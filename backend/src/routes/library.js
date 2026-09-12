import { Router } from 'express';
import pool from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth); // toutes les routes ci-dessous nécessitent d'être connecté

// GET /library - Ma bibliothèque (filtrable par statut)
router.get('/', async (req, res) => {
  const { status } = req.query;

  try {
    let query = `
      SELECT ub.*, b.title, b.author, b.cover_url
      FROM user_books ub
      JOIN books b ON b.id = ub.book_id
      WHERE ub.user_id = $1
    `;
    const params = [req.userId];

    if (status) {
      params.push(status);
      query += ` AND ub.status = $${params.length}`;
    }

    query += ' ORDER BY ub.added_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /library - Ajouter un livre à ma bibliothèque
router.post('/', async (req, res) => {
  const { book_id, status, rating } = req.body;

  if (!book_id || !status) {
    return res.status(400).json({ error: 'book_id et status sont requis' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO user_books (user_id, book_id, status, rating)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, book_id)
       DO UPDATE SET status = $3, rating = $4
       RETURNING *`,
      [req.userId, book_id, status, rating || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /library/reviews - Ajouter un avis sur un livre
router.post('/reviews', async (req, res) => {
  const { book_id, content, has_spoiler } = req.body;

  if (!book_id || !content) {
    return res.status(400).json({ error: 'book_id et content sont requis' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO reviews (user_id, book_id, content, has_spoiler)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.userId, book_id, content, has_spoiler || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
