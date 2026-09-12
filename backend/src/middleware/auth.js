import jwt from 'jsonwebtoken';

// Vérifie le token JWT envoyé dans le header Authorization: Bearer <token>
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentification requise' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

// Comme requireAuth, mais ne bloque jamais la requête : renseigne req.userId
// si un token valide est fourni, sinon continue sans (utile pour les routes
// publiques qui personnalisent leur réponse quand l'utilisateur est connecté).
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
  } catch (err) {
    // token invalide/expiré : on continue simplement sans utilisateur identifié
  }
  next();
}
