import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import libraryRoutes from './routes/library.js';
import socialRoutes from './routes/social.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API Plateforme de lecture' });
});

app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/library', libraryRoutes);
app.use('/social', socialRoutes);
app.use('/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
