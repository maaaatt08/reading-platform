// Importe des livres depuis l'API Google Books vers la table `books`,
// et leur attribue des tags mood/pace/genre par heuristique de mots-clés.
//
// Usage :
//   node scripts/import-books.js                          -> importe la liste de requêtes par défaut (seedQueries.js)
//   node scripts/import-books.js "harry potter" "dune"     -> importe ces requêtes précises
//   node scripts/import-books.js --max=10 "stephen king"   -> limite le nombre de résultats par requête (défaut 20)
//   node scripts/import-books.js --no-tags "dune"          -> importe sans poser de tags mood/pace
//   node scripts/import-books.js --more                    -> importe la 2e vague de requêtes (MORE_QUERIES)
//   node scripts/import-books.js --classics                -> importe les grands classiques par littérature (CLASSICS_QUERIES)
//   node scripts/import-books.js --titles                  -> importe des titres précis très connus (TITLE_QUERIES)
//   node scripts/import-books.js --extra                   -> importe des best-sellers contemporains supplémentaires (EXTRA_QUERIES)
//   node scripts/import-books.js --french                  -> importe la littérature française en profondeur (FRENCH_LITERATURE_QUERIES)
//   node scripts/import-books.js --nonfiction               -> importe histoire/philosophie/biographie/business/science (NONFICTION_QUERIES)

import pool from "../src/db/pool.js";
import { searchGoogleBooks } from "./googleBooks.js";
import { inferTags } from "./tagHeuristics.js";
import { inferLiterature } from "./literatureMap.js";
import { inferTheme } from "./themeHeuristics.js";
import {
  SEED_QUERIES,
  MORE_QUERIES,
  CLASSICS_QUERIES,
  TITLE_QUERIES,
  EXTRA_QUERIES,
  FRENCH_LITERATURE_QUERIES,
  NONFICTION_QUERIES,
} from "./seedQueries.js";

const WAVE_FLAGS = {
  "--more": MORE_QUERIES,
  "--classics": CLASSICS_QUERIES,
  "--titles": TITLE_QUERIES,
  "--extra": EXTRA_QUERIES,
  "--french": FRENCH_LITERATURE_QUERIES,
  "--nonfiction": NONFICTION_QUERIES,
};

const args = process.argv.slice(2);
const maxArg = args.find((a) => a.startsWith("--max="));
const maxResults = maxArg ? parseInt(maxArg.split("=")[1], 10) : 20;
const shouldTag = !args.includes("--no-tags");
const queries = args.filter((a) => !a.startsWith("--"));
const waveFlag = Object.keys(WAVE_FLAGS).find((flag) => args.includes(flag));
const queriesToRun = queries.length > 0 ? queries : waveFlag ? WAVE_FLAGS[waveFlag] : SEED_QUERIES;

async function upsertBook(book) {
  const result = await pool.query(
    `INSERT INTO books (google_books_id, title, author, cover_url, description, genre, release_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (google_books_id) DO UPDATE SET
       title = EXCLUDED.title,
       author = EXCLUDED.author,
       cover_url = EXCLUDED.cover_url,
       description = EXCLUDED.description,
       genre = EXCLUDED.genre,
       release_date = EXCLUDED.release_date
     RETURNING id, (xmax = 0) AS inserted`,
    [book.google_books_id, book.title, book.author, book.cover_url, book.description, book.genre, book.release_date]
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
  return tags.length;
}

async function main() {
  let inserted = 0;
  let updated = 0;
  let tagged = 0;

  for (const query of queriesToRun) {
    console.log(`\nRecherche : "${query}"...`);
    let books;
    try {
      books = await searchGoogleBooks(query, { maxResults });
    } catch (err) {
      console.error(`  Erreur pour "${query}" : ${err.message}`);
      continue;
    }
    console.log(`  ${books.length} résultat(s) trouvé(s)`);

    for (const book of books) {
      if (!book.google_books_id) continue;
      try {
        const { id, inserted: wasInserted } = await upsertBook(book);
        if (wasInserted) inserted++;
        else updated++;

        if (shouldTag) {
          const count = await applyTags(id, book);
          if (count > 0) tagged++;
        }
      } catch (err) {
        console.error(`  Erreur pour le livre "${book.title}" : ${err.message}`);
      }
    }
  }

  console.log(`\nTerminé. ${inserted} livre(s) ajouté(s), ${updated} mis à jour, ${tagged} taggé(s).`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
