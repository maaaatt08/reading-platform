const API_URL = "https://www.googleapis.com/books/v1/volumes";

// Google renvoie parfois juste une année ("1965") ou "année-mois" ("2007-03") :
// on complète pour obtenir une DATE Postgres valide.
function normalizeDate(publishedDate) {
  if (!publishedDate) return null;
  const parts = publishedDate.split("-");
  const [year, month = "01", day = "01"] = parts;
  if (!/^\d{4}$/.test(year)) return null;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function normalizeVolume(volume) {
  const info = volume.volumeInfo || {};
  return {
    google_books_id: volume.id,
    title: info.title,
    author: (info.authors || []).join(", ") || null,
    cover_url: info.imageLinks?.thumbnail?.replace("http://", "https://") || null,
    description: info.description || null,
    genre: info.categories?.[0]?.split("/")[0]?.trim() || null,
    release_date: normalizeDate(info.publishedDate),
  };
}

// Interroge l'API Google Books (aucune clé requise pour un usage modeste ;
// GOOGLE_BOOKS_API_KEY augmente le quota si défini).
export async function searchGoogleBooks(query, { maxResults = 20 } = {}) {
  const results = [];
  const pageSize = 40; // maximum autorisé par requête par l'API

  for (let startIndex = 0; results.length < maxResults; startIndex += pageSize) {
    const url = new URL(API_URL);
    url.searchParams.set("q", query);
    url.searchParams.set("startIndex", String(startIndex));
    url.searchParams.set("maxResults", String(Math.min(pageSize, maxResults - results.length)));
    url.searchParams.set("printType", "books");
    if (process.env.GOOGLE_BOOKS_API_KEY) {
      url.searchParams.set("key", process.env.GOOGLE_BOOKS_API_KEY);
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Books API a répondu ${res.status} pour "${query}"`);
    }
    const data = await res.json();
    const items = data.items || [];
    if (items.length === 0) break;

    for (const item of items) {
      const book = normalizeVolume(item);
      if (book.title) results.push(book);
    }

    if (items.length < pageSize) break; // dernière page
  }

  return results.slice(0, maxResults);
}
