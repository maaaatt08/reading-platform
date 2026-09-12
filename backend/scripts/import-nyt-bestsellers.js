// Importe toutes les listes de bestsellers actuelles du New York Times, et enrichit
// chaque livre via Google Books quand une correspondance ISBN existe (couverture,
// description, genre plus complets) — avec repli sur les données NYT sinon.
//
// Nécessite NYT_API_KEY dans backend/.env (voir .env.example, gratuit sur
// developer.nytimes.com). L'API NYT limite à 5 requêtes/minute en accès gratuit,
// donc l'import complet (~50 listes) prend une dizaine de minutes.
//
// Usage :
//   node scripts/import-nyt-bestsellers.js

import pool from "../src/db/pool.js";
import { fetchListNames, fetchCurrentList } from "./nytBooks.js";
import { searchGoogleBooks } from "./googleBooks.js";
import { inferTags } from "./tagHeuristics.js";
import { inferLiterature } from "./literatureMap.js";
import { inferTheme } from "./themeHeuristics.js";

async function upsertBook(book) {
  const result = await pool.query(
    `INSERT INTO books (google_books_id, title, author, cover_url, description, genre, language, release_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (google_books_id) DO UPDATE SET
       title = EXCLUDED.title,
       author = EXCLUDED.author,
       cover_url = COALESCE(EXCLUDED.cover_url, books.cover_url),
       description = COALESCE(EXCLUDED.description, books.description),
       genre = COALESCE(EXCLUDED.genre, books.genre),
       language = COALESCE(EXCLUDED.language, books.language),
       release_date = COALESCE(EXCLUDED.release_date, books.release_date)
     RETURNING id, (xmax = 0) AS inserted`,
    [
      book.google_books_id,
      book.title,
      book.author,
      book.cover_url,
      book.description,
      book.genre,
      book.language,
      book.release_date,
    ]
  );
  return result.rows[0];
}

async function applyTags(bookId, book) {
  const { moods, pace } = inferTags(book);
  const literature = inferLiterature(book.author);
  const theme = inferTheme(book);
  const tags = [
    ...moods.map((value) => ["mood", value]),
    ["pace", pace],
    ...(book.genre ? [["genre", book.genre]] : []),
    ...(literature ? [["literature", literature]] : []),
    ...(theme ? [["theme", theme]] : []),
  ];
  for (const [tag_type, tag_value] of tags) {
    await pool.query(
      `INSERT INTO book_tags (book_id, tag_type, tag_value) VALUES ($1, $2, $3)
       ON CONFLICT (book_id, tag_type, tag_value) DO NOTHING`,
      [bookId, tag_type, tag_value]
    );
  }
}

async function resolveViaGoogleBooks(nytBook) {
  if (!nytBook.isbn13) return null;
  try {
    const results = await searchGoogleBooks(`isbn:${nytBook.isbn13}`, { maxResults: 1 });
    return results[0] || null;
  } catch {
    return null;
  }
}

async function main() {
  const listNames = await fetchListNames();
  console.log(`${listNames.length} liste(s) de bestsellers NYT trouvée(s).`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const seenIsbns = new Set();

  for (const [i, listName] of listNames.entries()) {
    console.log(`\n[${i + 1}/${listNames.length}] Liste : ${listName}`);
    let books;
    try {
      books = await fetchCurrentList(listName);
    } catch (err) {
      console.error(`  Erreur : ${err.message}`);
      continue;
    }
    console.log(`  ${books.length} livre(s)`);

    for (const nytBook of books) {
      if (nytBook.isbn13 && seenIsbns.has(nytBook.isbn13)) {
        skipped++;
        continue; // déjà traité via une autre liste dans cette même exécution
      }
      if (nytBook.isbn13) seenIsbns.add(nytBook.isbn13);

      const googleMatch = await resolveViaGoogleBooks(nytBook);
      const book = googleMatch || {
        google_books_id: nytBook.isbn13 ? `nyt-${nytBook.isbn13}` : null,
        title: nytBook.title?.slice(0, 500) || null,
        author: nytBook.author?.slice(0, 255) || null,
        cover_url: nytBook.cover_url,
        description: nytBook.description,
        genre: null,
        language: "en", // les listes NYT ne couvrent que l'édition américaine
        release_date: null,
      };
      if (!book.google_books_id || !book.title) continue;

      try {
        const { id, inserted: wasInserted } = await upsertBook(book);
        if (wasInserted) inserted++;
        else updated++;
        await applyTags(id, book);
      } catch (err) {
        console.error(`  Erreur pour le livre "${book.title}" : ${err.message}`);
      }
    }
  }

  console.log(
    `\nTerminé. ${inserted} livre(s) ajouté(s), ${updated} mis à jour, ${skipped} doublon(s) inter-listes ignoré(s).`
  );
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
