// Nettoie le catalogue existant :
//  1. Devine la langue des livres qui n'en ont pas encore (colonne ajoutée après coup).
//  2. Supprime les entrées "résumé/summary" (fiches de lecture tierces, pas le livre lui-même).
//  3. Supprime les entrées "coquille vide" (ni couverture ni description) quand une autre
//     entrée du même titre+auteur a, elle, du contenu.
//  4. Supprime les entrées avec une description strictement identique à une autre du même
//     titre+auteur (doublons exacts renvoyés par Google sous des google_books_id différents).
//
// Ne touche jamais à un livre présent dans la bibliothèque d'un utilisateur, dans un avis
// ou dans une recommandation (sécurité, même si peu probable en pratique aujourd'hui).
//
// Usage :
//   node scripts/cleanup-catalog.js

import pool from "../src/db/pool.js";
import { isJunkTitle } from "./googleBooks.js";
import { guessLanguage } from "./languageHeuristic.js";

const NOT_REFERENCED = `
  NOT EXISTS (SELECT 1 FROM user_books WHERE book_id = b.id)
  AND NOT EXISTS (SELECT 1 FROM reviews WHERE book_id = b.id)
  AND NOT EXISTS (SELECT 1 FROM recommendations WHERE book_id = b.id)
`;

async function backfillLanguage() {
  const { rows } = await pool.query(
    "SELECT id, title, description FROM books WHERE language IS NULL"
  );
  let updated = 0;
  for (const book of rows) {
    const lang = guessLanguage(book);
    if (lang) {
      await pool.query("UPDATE books SET language = $1 WHERE id = $2", [lang, book.id]);
      updated++;
    }
  }
  console.log(`Langue devinée pour ${updated}/${rows.length} livre(s) sans langue connue.`);
}

async function removeJunkTitles() {
  const { rows } = await pool.query("SELECT id, title FROM books");
  const junkIds = rows.filter((b) => isJunkTitle(b.title)).map((b) => b.id);
  if (junkIds.length === 0) return console.log("Aucune entrée résumé/summary à supprimer.");

  const { rows: deleted } = await pool.query(
    `DELETE FROM books b WHERE id = ANY($1) AND ${NOT_REFERENCED} RETURNING id, title`,
    [junkIds]
  );
  console.log(`${deleted.length}/${junkIds.length} entrée(s) résumé/summary supprimée(s).`);
}

async function removeEmptyDuplicates() {
  const { rows: deleted } = await pool.query(`
    DELETE FROM books b
    WHERE b.cover_url IS NULL
      AND b.description IS NULL
      AND EXISTS (
        SELECT 1 FROM books other
        WHERE other.id != b.id
          AND lower(trim(other.title)) = lower(trim(b.title))
          AND lower(trim(coalesce(other.author, ''))) = lower(trim(coalesce(b.author, '')))
          AND (other.cover_url IS NOT NULL OR other.description IS NOT NULL)
      )
      AND ${NOT_REFERENCED}
    RETURNING id, title
  `);
  console.log(`${deleted.length} entrée(s) sans contenu supprimée(s) (doublon d'une entrée plus complète).`);
}

async function removeIdenticalDescriptionDuplicates() {
  const { rows: deleted } = await pool.query(`
    DELETE FROM books b
    WHERE b.description IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM books keeper
        WHERE keeper.id != b.id
          AND lower(trim(keeper.title)) = lower(trim(b.title))
          AND lower(trim(coalesce(keeper.author, ''))) = lower(trim(coalesce(b.author, '')))
          AND keeper.description = b.description
          AND (
            (keeper.cover_url IS NOT NULL AND b.cover_url IS NULL)
            OR (keeper.cover_url IS NOT NULL) = (b.cover_url IS NOT NULL) AND keeper.id < b.id
          )
      )
      AND ${NOT_REFERENCED}
    RETURNING id, title
  `);
  console.log(`${deleted.length} doublon(s) à description identique supprimé(s).`);
}

async function main() {
  await backfillLanguage();
  await removeJunkTitles();
  await removeEmptyDuplicates();
  await removeIdenticalDescriptionDuplicates();

  const { rows } = await pool.query("SELECT COUNT(*) FROM books");
  console.log(`\nTerminé. ${rows[0].count} livre(s) restant(s) en catalogue.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
