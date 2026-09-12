import type { Status } from "./types";

export const STATUS_LABELS: Record<Status, string> = {
  to_read: "À lire",
  reading: "En cours",
  read: "Lu",
  dnf: "Abandonné",
};

export const STATUS_OPTIONS: Status[] = ["to_read", "reading", "read", "dnf"];

export const MOOD_OPTIONS = [
  "dark",
  "emotional",
  "funny",
  "hopeful",
  "mysterious",
  "reflective",
  "tense",
  "adventurous",
];

export const PACE_OPTIONS = ["slow", "medium", "fast"];

export const LITERATURE_OPTIONS = [
  "francaise",
  "russe",
  "anglaise",
  "americaine",
  "hispanophone",
  "germanique",
  "italienne",
  "japonaise",
  "chinoise",
  "coreenne",
  "africaine",
  "moyen-orientale",
  "indienne",
  "nordique",
  "portugaise-bresilienne",
];

export const LITERATURE_LABELS: Record<string, string> = {
  francaise: "Française",
  russe: "Russe",
  anglaise: "Anglaise",
  americaine: "Américaine",
  hispanophone: "Hispanophone",
  germanique: "Germanique",
  italienne: "Italienne",
  japonaise: "Japonaise",
  chinoise: "Chinoise",
  coreenne: "Coréenne",
  africaine: "Africaine",
  "moyen-orientale": "Moyen-orientale",
  indienne: "Indienne",
  nordique: "Nordique",
  "portugaise-bresilienne": "Portugaise/brésilienne",
};

export const THEME_OPTIONS = [
  "roman",
  "policier",
  "fantasy",
  "science-fiction",
  "romance",
  "poesie",
  "theatre",
  "essai",
  "biographie",
  "bd-manga",
  "jeunesse",
  "developpement-personnel",
  "business",
  "cuisine",
  "histoire",
  "sciences",
  "philosophie",
  "spiritualite",
  "voyage",
  "humour",
  "true-crime",
];

export const THEME_LABELS: Record<string, string> = {
  roman: "Roman",
  policier: "Policier",
  fantasy: "Fantasy",
  "science-fiction": "Science-fiction",
  romance: "Romance",
  poesie: "Poésie",
  theatre: "Théâtre",
  essai: "Essai",
  biographie: "Biographie",
  "bd-manga": "BD / Manga",
  jeunesse: "Jeunesse",
  "developpement-personnel": "Développement personnel",
  business: "Business",
  cuisine: "Cuisine",
  histoire: "Histoire",
  sciences: "Sciences",
  philosophie: "Philosophie",
  spiritualite: "Spiritualité",
  voyage: "Voyage",
  humour: "Humour",
  "true-crime": "True crime",
};
