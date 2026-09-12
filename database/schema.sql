-- ============================================
-- Schéma de la base de données - Plateforme de lecture
-- ============================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    google_books_id VARCHAR(100) UNIQUE,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255),
    cover_url TEXT,
    description TEXT,
    genre VARCHAR(100),
    release_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tags mood/pace assignés aux livres (ex: "dark", "fast-paced")
CREATE TABLE book_tags (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    tag_type VARCHAR(20) NOT NULL CHECK (tag_type IN ('mood', 'pace', 'genre')),
    tag_value VARCHAR(50) NOT NULL,
    UNIQUE(book_id, tag_type, tag_value)
);

-- Bibliothèque personnelle de chaque utilisateur
CREATE TABLE user_books (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('read', 'reading', 'to_read', 'dnf')),
    rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
    started_at DATE,
    finished_at DATE,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    has_spoiler BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Relations "je suis cet utilisateur"
CREATE TABLE follows (
    follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    followed_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (follower_id, followed_id),
    CHECK (follower_id != followed_id)
);

-- Recommandations entre amis
CREATE TABLE recommendations (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    to_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index utiles pour les requêtes fréquentes
CREATE INDEX idx_user_books_user ON user_books(user_id);
CREATE INDEX idx_user_books_book ON user_books(book_id);
CREATE INDEX idx_reviews_book ON reviews(book_id);
CREATE INDEX idx_book_tags_book ON book_tags(book_id);
CREATE INDEX idx_books_release_date ON books(release_date);
