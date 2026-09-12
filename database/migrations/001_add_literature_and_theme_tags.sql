-- Ajoute deux nouveaux types de tags pour les filtres "littérature" (origine
-- géographique/linguistique : française, russe, anglaise...) et "thème" (genre
-- littéraire au sens courant : roman, policier, fantasy, essai, bd-manga...).
-- À exécuter une fois sur une base existante (déjà inclus dans schema.sql pour
-- une installation neuve).

ALTER TABLE book_tags DROP CONSTRAINT book_tags_tag_type_check;
ALTER TABLE book_tags ADD CONSTRAINT book_tags_tag_type_check
  CHECK (tag_type IN ('mood', 'pace', 'genre', 'literature', 'theme'));
