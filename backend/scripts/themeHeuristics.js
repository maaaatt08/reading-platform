// Devine un "thème" (genre littéraire au sens courant : roman, policier, essai...)
// à partir de la catégorie brute Google Books (souvent trop vague, ex: "Fiction" pour
// tout et n'importe quoi) et, en repli, de mots-clés dans le titre/la description.
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

// Catégorie brute Google Books (books.genre) -> thème. Comparaison insensible à la casse,
// sur la première catégorie renvoyée par l'API (déjà stockée dans books.genre).
const RAW_GENRE_MAP = {
  poetry: "poesie",
  drama: "theatre",
  "comics & graphic novels": "bd-manga",
  "juvenile fiction": "jeunesse",
  "juvenile nonfiction": "jeunesse",
  "biography & autobiography": "biographie",
  cooking: "cuisine",
  "business & economics": "business",
  "self-help": "developpement-personnel",
  history: "histoire",
  science: "sciences",
  philosophy: "philosophie",
  religion: "spiritualite",
  "body, mind & spirit": "spiritualite",
  travel: "voyage",
  humor: "humour",
  "true crime": "true-crime",
};

const FICTION_KEYWORDS = {
  policier: ["murder", "detective", "crime", "investigation", "assassin", "enquête", "policier"],
  fantasy: ["dragon", "magic", "kingdom", "sorcery", "wizard", "elf", "royaume", "magie"],
  "science-fiction": ["spaceship", "alien", "robot", "dystopian", "galaxy", "planet", "futuristic"],
  romance: ["love story", "falls in love", "romance", "passion amoureuse"],
  humour: ["hilarious", "comedy", "funny", "satire", "humour"],
};

function matchesAny(text, keywords) {
  return keywords.some((kw) => text.includes(kw));
}

export function inferTheme(book) {
  const rawGenre = book.genre?.toLowerCase().trim();
  if (rawGenre && RAW_GENRE_MAP[rawGenre]) return RAW_GENRE_MAP[rawGenre];

  const text = [book.title, book.description].filter(Boolean).join(" ").toLowerCase();
  const isFiction = !rawGenre || rawGenre.includes("fiction");

  if (isFiction) {
    for (const [theme, keywords] of Object.entries(FICTION_KEYWORDS)) {
      if (matchesAny(text, keywords)) return theme;
    }
    if (rawGenre?.includes("fiction")) return "roman"; // fiction générique sans signal plus précis
  }

  if (rawGenre) return "essai"; // non-fiction non mappée plus précisément
  return null; // pas assez d'info pour deviner
}
