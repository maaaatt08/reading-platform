// Ajoute ou retire manuellement un tag mood/pace/genre sur un livre —
// utile pour corriger ou compléter le tagging automatique de import-books.js.
//
// Usage :
//   node scripts/tag-book.js <book_id> mood dark
//   node scripts/tag-book.js <book_id> pace fast
//   node scripts/tag-book.js <book_id> mood dark --remove

import pool from "../src/db/pool.js";

const [bookIdArg, tagType, tagValue, ...rest] = process.argv.slice(2);
const remove = rest.includes("--remove");

if (!bookIdArg || !tagType || !tagValue) {
  console.error("Usage: node scripts/tag-book.js <book_id> <mood|pace|genre> <valeur> [--remove]");
  process.exit(1);
}
if (!["mood", "pace", "genre"].includes(tagType)) {
  console.error('tag_type doit être "mood", "pace" ou "genre"');
  process.exit(1);
}

const bookId = parseInt(bookIdArg, 10);

async function main() {
  const bookResult = await pool.query("SELECT id, title FROM books WHERE id = $1", [bookId]);
  if (bookResult.rows.length === 0) {
    console.error(`Aucun livre avec l'id ${bookId}`);
    process.exit(1);
  }
  const book = bookResult.rows[0];

  if (remove) {
    await pool.query(
      "DELETE FROM book_tags WHERE book_id = $1 AND tag_type = $2 AND tag_value = $3",
      [bookId, tagType, tagValue]
    );
    console.log(`Tag retiré : "${book.title}" — ${tagType}:${tagValue}`);
  } else {
    await pool.query(
      `INSERT INTO book_tags (book_id, tag_type, tag_value) VALUES ($1, $2, $3)
       ON CONFLICT (book_id, tag_type, tag_value) DO NOTHING`,
      [bookId, tagType, tagValue]
    );
    console.log(`Tag ajouté : "${book.title}" — ${tagType}:${tagValue}`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
