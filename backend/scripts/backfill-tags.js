// Applique les tags "literature" et "theme" aux livres déjà importés (avant que ces
// deux catégories n'existent). Les nouveaux imports les posent automatiquement
// (voir import-books.js / import-nyt-bestsellers.js) — ce script rattrape l'existant.
//
// Usage :
//   node scripts/backfill-tags.js

import pool from "../src/db/pool.js";
import { inferLiterature } from "./literatureMap.js";
import { inferTheme } from "./themeHeuristics.js";

async function main() {
  const { rows: books } = await pool.query("SELECT id, title, author, genre, description FROM books");
  console.log(`${books.length} livre(s) à traiter.`);

  let literatureTagged = 0;
  let themeTagged = 0;

  for (const book of books) {
    const literature = inferLiterature(book.author);
    const theme = inferTheme(book);

    try {
      if (literature) {
        await pool.query(
          `INSERT INTO book_tags (book_id, tag_type, tag_value) VALUES ($1, 'literature', $2)
           ON CONFLICT (book_id, tag_type, tag_value) DO NOTHING`,
          [book.id, literature]
        );
        literatureTagged++;
      }
      if (theme) {
        await pool.query(
          `INSERT INTO book_tags (book_id, tag_type, tag_value) VALUES ($1, 'theme', $2)
           ON CONFLICT (book_id, tag_type, tag_value) DO NOTHING`,
          [book.id, theme]
        );
        themeTagged++;
      }
    } catch (err) {
      console.error(`  Erreur pour "${book.title}" : ${err.message}`);
    }
  }

  console.log(`\nTerminé. ${literatureTagged} tag(s) "literature" posés, ${themeTagged} tag(s) "theme" posés.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
