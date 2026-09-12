import { Router } from 'express';
import pool from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /users/search?q= - Chercher des utilisateurs par nom (pour suivre des amis)
router.get('/search', async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.json([]);
  }

  try {
    const result = await pool.query(
      `SELECT id, username, avatar_url FROM users
       WHERE username ILIKE $1 AND id != $2
       ORDER BY username
       LIMIT 20`,
      [`%${q}%`, req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /users/:id - Profil public d'un utilisateur (bio, stats, statut de suivi)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const userResult = await pool.query(
      'SELECT id, username, bio, avatar_url, created_at FROM users WHERE id = $1',
      [id]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    const followStatusResult = await pool.query(
      'SELECT 1 FROM follows WHERE follower_id = $1 AND followed_id = $2',
      [req.userId, id]
    );

    const countsResult = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM follows WHERE followed_id = $1) AS followers_count,
         (SELECT COUNT(*) FROM follows WHERE follower_id = $1) AS following_count,
         (SELECT COUNT(*) FROM user_books WHERE user_id = $1 AND status = 'read') AS books_read_count`,
      [id]
    );

    res.json({
      ...userResult.rows[0],
      is_followed_by_me: followStatusResult.rows.length > 0,
      ...countsResult.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /users/:id/books - Bibliothèque publique d'un utilisateur
router.get('/:id/books', async (req, res) => {
  const { id } = req.params;
  const { status } = req.query;

  try {
    let query = `
      SELECT ub.status, ub.rating, ub.finished_at, b.id AS book_id, b.title, b.author, b.cover_url
      FROM user_books ub
      JOIN books b ON b.id = ub.book_id
      WHERE ub.user_id = $1
    `;
    const params = [id];

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

export default router;
