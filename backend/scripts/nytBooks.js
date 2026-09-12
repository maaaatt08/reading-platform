// Client pour l'API NYT Books (listes de bestsellers officielles).
// Le palier gratuit est limité à 5 requêtes/minute : on espace donc chaque appel.

const API_BASE = "https://api.nytimes.com/svc/books/v3";
const MIN_INTERVAL_MS = 13000; // marge de sécurité sous la limite de 5 req/min

let lastRequestAt = 0;

async function throttledFetch(url) {
  const wait = MIN_INTERVAL_MS - (Date.now() - lastRequestAt);
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastRequestAt = Date.now();

  let res = await fetch(url);
  if (res.status === 429) {
    await new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL_MS));
    lastRequestAt = Date.now();
    res = await fetch(url);
  }
  return res;
}

function requireApiKey() {
  const key = process.env.NYT_API_KEY;
  if (!key) {
    throw new Error("NYT_API_KEY manquant dans backend/.env (voir .env.example)");
  }
  return key;
}

// Renvoie le nom encodé de chaque liste de bestsellers disponible (fiction, non-fiction,
// young adult, business, manga, etc. — une cinquantaine de listes en général).
export async function fetchListNames() {
  const key = requireApiKey();
  const res = await throttledFetch(`${API_BASE}/lists/names.json?api-key=${key}`);
  if (!res.ok) {
    throw new Error(`NYT API (lists/names) a répondu ${res.status}`);
  }
  const data = await res.json();
  return data.results.map((r) => r.list_name_encoded);
}

// Renvoie les livres classés dans la liste courante (semaine en cours) pour une liste donnée.
export async function fetchCurrentList(listNameEncoded) {
  const key = requireApiKey();
  const res = await throttledFetch(`${API_BASE}/lists/current/${listNameEncoded}.json?api-key=${key}`);
  if (!res.ok) {
    throw new Error(`NYT API (${listNameEncoded}) a répondu ${res.status}`);
  }
  const data = await res.json();
  return (data.results?.books || []).map((b) => ({
    title: b.title,
    author: b.author,
    isbn13: b.primary_isbn13 || null,
    cover_url: b.book_image || null,
    description: b.description || null,
    rank: b.rank,
    list: listNameEncoded,
  }));
}
