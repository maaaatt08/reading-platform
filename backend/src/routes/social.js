import { Router } from 'express';
import pool from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// POST /social/follow/:userId - Suivre un utilisateur
router.post('/follow/:userId', async (req, res) => {
  const followedId = parseInt(req.params.userId, 10);

  if (followedId === req.userId) {
    return res.status(400).json({ error: 'Vous ne pouvez pas vous suivre vous-même' });
  }

  try {
    await pool.query(
      `INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [req.userId, followedId]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /social/follow/:userId - Ne plus suivre
router.delete('/follow/:userId', async (req, res) => {
  const followedId = parseInt(req.params.userId, 10);

  try {
    await pool.query(
      'DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2',
      [req.userId, followedId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /social/feed - Activité récente des personnes que je suis
router.get('/feed', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ub.status, ub.rating, ub.added_at, u.username, b.title, b.cover_url, b.id AS book_id
       FROM user_books ub
       JOIN users u ON u.id = ub.user_id
       JOIN books b ON b.id = ub.book_id
       WHERE ub.user_id IN (
         SELECT followed_id FROM follows WHERE follower_id = $1
       )
       ORDER BY ub.added_at DESC
       LIMIT 30`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /social/recommend - Recommander un livre à un ami
router.post('/recommend', async (req, res) => {
  const { to_user_id, book_id, message } = req.body;

  if (!to_user_id || !book_id) {
    return res.status(400).json({ error: 'to_user_id et book_id sont requis' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO recommendations (from_user_id, to_user_id, book_id, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.userId, to_user_id, book_id, message || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /social/recommendations - Livres qu'on m'a recommandés
router.get('/recommendations', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT rec.id, rec.message, rec.created_at, u.username AS from_username,
              b.id AS book_id, b.title, b.cover_url
       FROM recommendations rec
       JOIN users u ON u.id = rec.from_user_id
       JOIN books b ON b.id = rec.book_id
       WHERE rec.to_user_id = $1
       ORDER BY rec.created_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
