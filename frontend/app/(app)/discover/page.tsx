"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import {
  MOOD_OPTIONS,
  PACE_OPTIONS,
  LITERATURE_OPTIONS,
  LITERATURE_LABELS,
  THEME_OPTIONS,
  THEME_LABELS,
  LANGUAGE_OPTIONS,
  LANGUAGE_LABELS,
} from "@/lib/constants";
import type { Book } from "@/lib/types";
import { BookCard } from "@/components/BookCard";
import { FilterGroup } from "@/components/FilterGroup";

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [mood, setMood] = useState("");
  const [pace, setPace] = useState("");
  const [literature, setLiterature] = useState("");
  const [theme, setTheme] = useState("");
  const [language, setLanguage] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function runSearch(e?: FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const results = await api.searchBooks({ search, mood, pace, literature, theme, language });
      setBooks(results);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Découvrir</h1>

      <form onSubmit={runSearch} className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4">
        <input
          type="text"
          placeholder="Titre ou auteur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <FilterGroup label="Littérature" options={LITERATURE_OPTIONS} value={literature} onChange={setLiterature} labels={LITERATURE_LABELS} />
          <FilterGroup label="Genre" options={THEME_OPTIONS} value={theme} onChange={setTheme} labels={THEME_LABELS} />
          <FilterGroup label="Langue" options={LANGUAGE_OPTIONS} value={language} onChange={setLanguage} labels={LANGUAGE_LABELS} />
          <FilterGroup label="Mood" options={MOOD_OPTIONS} value={mood} onChange={setMood} />
          <FilterGroup label="Rythme" options={PACE_OPTIONS} value={pace} onChange={setPace} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Recherche..." : "Rechercher"}
        </button>
      </form>

      {searched && !loading && books.length === 0 && (
        <p className="text-sm text-neutral-500">Aucun livre ne correspond à ces critères.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {books.map((book) => (
          <BookCard
            key={book.id}
            id={book.id}
            title={book.title}
            author={book.author}
            coverUrl={book.cover_url}
          />
        ))}
      </div>
    </div>
  );
}
