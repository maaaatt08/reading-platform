# Plateforme de lecture — MVP

Plateforme de lecture sociale : bibliothèque personnelle, notes/avis, recommandations entre amis, découverte par mood/pace/genre, et flux des prochaines sorties de livres.

## Structure du projet

```
reading-platform/
├── backend/
│   ├── src/
│   │   ├── db/pool.js          # Connexion PostgreSQL
│   │   ├── middleware/auth.js  # Vérification du token JWT
│   │   ├── routes/
│   │   │   ├── auth.js         # Inscription / connexion / profil courant
│   │   │   ├── books.js        # Recherche, détails, sorties à venir
│   │   │   ├── library.js      # Bibliothèque perso, avis
│   │   │   ├── social.js       # Follow, feed, recommandations
│   │   │   └── users.js        # Recherche d'utilisateurs, profils publics
│   │   └── server.js           # Point d'entrée
│   ├── scripts/
│   │   ├── import-books.js         # Import de livres depuis l'API Google Books
│   │   ├── import-nyt-bestsellers.js  # Import des listes de bestsellers du New York Times
│   │   ├── backfill-tags.js        # Pose les tags literature/theme sur les livres déjà importés
│   │   ├── tag-book.js             # Ajout/retrait manuel d'un tag mood/pace/genre/literature/theme
│   │   ├── googleBooks.js          # Client Google Books (recherche + normalisation)
│   │   ├── nytBooks.js             # Client NYT Books API (listes de bestsellers)
│   │   ├── tagHeuristics.js        # Devine des tags mood/pace par mots-clés
│   │   ├── literatureMap.js        # Devine la tradition littéraire (française, russe...) par auteur
│   │   ├── themeHeuristics.js      # Devine le thème/genre (roman, policier, essai...) par catégorie+mots-clés
│   │   └── seedQueries.js          # Requêtes par défaut pour peupler la base (par vagues)
│   ├── package.json
│   └── .env.example
├── frontend/                   # Next.js (App Router) + TypeScript + Tailwind
│   ├── app/                    # Pages (login, register, library, discover, upcoming, feed, friends, profile, books)
│   └── lib/                    # Client API, contexte d'auth, types
└── database/
    ├── schema.sql               # Schéma complet de la base de données
    └── migrations/               # Modifications de schéma postérieures à la mise en place initiale
```

## Installation pas à pas

### 1. Installer les prérequis
- [Node.js](https://nodejs.org) (version 20 ou plus)
- Une base PostgreSQL : soit en local, soit gratuitement sur [Supabase](https://supabase.com) ou [Railway](https://railway.app) (recommandé pour débuter, aucune installation locale)

### 2. Configurer la base de données
Si tu utilises Supabase/Railway : crée un projet, récupère l'URL de connexion PostgreSQL, puis exécute le contenu de `database/schema.sql` dans leur éditeur SQL en ligne.

En local :
```bash
createdb reading_platform
psql reading_platform < database/schema.sql
```

### 3. Configurer le backend
```bash
cd backend
npm install
cp .env.example .env
```
Puis édite `.env` : colle ton `DATABASE_URL` et remplace `JWT_SECRET` par une chaîne aléatoire longue.

### 4. Lancer le serveur
```bash
npm run dev
```
L'API sera disponible sur `http://localhost:3000`.

### 5. Tester
```bash
# Créer un compte
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@test.com","password":"motdepasse123"}'
```
Tu dois recevoir un token JWT. Utilise-le ensuite dans le header `Authorization: Bearer <token>` pour les routes protégées (`/library`, `/social`).

## Lancer le frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL doit pointer vers le backend
npm run dev -- -p 3001
```
L'app sera disponible sur `http://localhost:3001` (le backend tourne déjà sur le port 3000).

## Importer des livres depuis Google Books
```bash
cd backend
npm run import-books                          # importe une sélection variée par défaut (voir scripts/seedQueries.js)
npm run import-books -- "dune frank herbert"   # ou une/plusieurs requêtes précises
npm run import-books -- --max=10 "stephen king"
```
Chaque livre importé reçoit automatiquement des tags mood/pace par heuristique de mots-clés (titre + description + genre). Pour corriger ou compléter un tag à la main :
```bash
npm run tag-book -- <book_id> mood dark
npm run tag-book -- <book_id> pace fast --remove
```

**Limite de quota** : l'API Google Books fonctionne sans clé pour un usage modeste, mais le quota anonyme est partagé et se sature vite. Si `import-books` échoue avec une erreur 429 "Quota exceeded", récupère une clé API gratuite sur la [Google Cloud Console](https://console.cloud.google.com/apis/library/books.googleapis.com) (API "Books API", quota par défaut largement suffisant) et ajoute-la dans `backend/.env` :
```
GOOGLE_BOOKS_API_KEY=ta-clé
```

Comme Google Books ne remonte qu'une vingtaine de résultats "populaires" par requête (pas forcément les bons), `seedQueries.js` structure les requêtes par vagues pour couvrir plus de terrain :
```bash
npm run import-books -- --more       # sous-genres et auteurs supplémentaires
npm run import-books -- --classics   # grands classiques par littérature (russe, française, anglaise, japonaise, africaine...)
npm run import-books -- --titles     # titres précis très demandés (recherche intitle:+inauthor:)
```

## Importer les vraies listes de bestsellers (New York Times)
Il n'existe pas d'API publique agrégeant "tous les bestsellers de tous les sites" (Amazon/Fnac n'en proposent pas, et les scraper irait contre leurs conditions d'utilisation). La seule source officielle et gratuite de vraies listes de bestsellers est l'**API du New York Times**.

1. Crée un compte gratuit sur [developer.nytimes.com](https://developer.nytimes.com/accounts/create), crée une "app", active l'accès à la **Books API**, copie la clé.
2. Ajoute-la dans `backend/.env` :
```
NYT_API_KEY=ta-clé
```
3. Lance l'import :
```bash
npm run import-nyt
```
Le script récupère toutes les listes NYT courantes (fiction, non-fiction, young adult, business, manga, etc.), et enrichit chaque livre via Google Books quand une correspondance ISBN existe (couverture/description/genre plus complets), avec repli sur les données NYT sinon. L'API NYT limite à 5 requêtes/minute en accès gratuit : l'import complet prend une dizaine de minutes.

## Filtres Découvrir : littérature et genre
En plus de mood/pace, chaque livre reçoit deux tags supplémentaires posés automatiquement à l'import :
- **literature** : tradition géographique/linguistique (française, russe, anglaise, américaine, japonaise...) — devinée à partir de l'auteur (`scripts/literatureMap.js`)
- **theme** : genre littéraire courant (roman, policier, fantasy, essai, bd-manga, jeunesse...) — deviné à partir de la catégorie Google Books et de mots-clés (`scripts/themeHeuristics.js`)

Ces deux tags sont posés automatiquement par `import-books.js` et `import-nyt-bestsellers.js`. Pour les appliquer rétroactivement à des livres déjà en base (ex: après une migration ou un import fait avant l'ajout de cette fonctionnalité) :
```bash
npm run backfill-tags
```

## Ce qui reste à faire
- Relire/corriger les tags posés automatiquement (heuristiques par mots-clés/auteur, pas parfaites)
- Déploiement (backend + frontend) au-delà du développement local
