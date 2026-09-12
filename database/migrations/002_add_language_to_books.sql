-- Ajoute la langue de chaque livre (code ISO 639-1 renvoyé par Google Books : "fr",
-- "en", "es"...), pour permettre de filtrer une recherche par langue plutôt que de
-- mélanger toutes les éditions/traductions d'un même livre.
ALTER TABLE books ADD COLUMN language VARCHAR(10);
CREATE INDEX idx_books_language ON books(language);
