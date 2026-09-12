import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

// GET /books?search=&mood=&pace=&genre=&literature=&theme=
// Recherche de livres avec filtres optionnels par mood/pace/genre/littérature/thème
router.get('/', async (req, res) => {
  const { search, mood, pace, genre, literature, theme } = req.query;

  try {
    let query = `
      SELECT DISTINCT b.*
      FROM books b
      LEFT JOIN book_tags bt ON bt.book_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (b.title ILIKE $${params.length} OR b.author ILIKE $${params.length})`;
    }
    if (mood) {
      params.push(mood);
      query += ` AND EXISTS (
        SELECT 1 FROM book_tags WHERE book_id = b.id AND tag_type = 'mood' AND tag_value = $${params.length}
      )`;
    }
    if (pace) {
      params.push(pace);
      query += ` AND EXISTS (
        SELECT 1 FROM book_tags WHERE book_id = b.id AND tag_type = 'pace' AND tag_value = $${params.length}
      )`;
    }
    if (genre) {
      params.push(genre);
      query += ` AND b.genre = $${params.length}`;
    }
    if (literature) {
      params.push(literature);
      query += ` AND EXISTS (
        SELECT 1 FROM book_tags WHERE book_id = b.id AND tag_type = 'literature' AND tag_value = $${params.length}
      )`;
    }
    if (theme) {
      params.push(theme);
      query += ` AND EXISTS (
        SELECT 1 FROM book_tags WHERE book_id = b.id AND tag_type = 'theme' AND tag_value = $${params.length}
      )`;
    }

    query += ' ORDER BY b.title LIMIT 50';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /books/upcoming - Prochaines sorties (flux actualité)
router.get('/upcoming', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM books
       WHERE release_date >= CURRENT_DATE
       ORDER BY release_date ASC
       LIMIT 30`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /books/:id - Détails d'un livre + ses tags + ses avis
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const bookResult = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: 'Livre introuvable' });
    }

    const tagsResult = await pool.query(
      'SELECT tag_type, tag_value FROM book_tags WHERE book_id = $1',
      [id]
    );

    const reviewsResult = await pool.query(
      `SELECT r.id, r.content, r.has_spoiler, r.created_at, u.username
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.book_id = $1
       ORDER BY r.created_at DESC
       LIMIT 20`,
      [id]
    );

    res.json({
      ...bookResult.rows[0],
      tags: tagsResult.rows,
      reviews: reviewsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
