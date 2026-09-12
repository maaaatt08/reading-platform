"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { MOOD_OPTIONS, PACE_OPTIONS } from "@/lib/constants";
import type { Book } from "@/lib/types";
import { BookCard } from "@/components/BookCard";

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [mood, setMood] = useState("");
  const [pace, setPace] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function runSearch(e?: FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const results = await api.searchBooks({ search, mood, pace });
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

        <div className="flex flex-wrap gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-neutral-500">Mood</p>
            <div className="flex flex-wrap gap-1">
              {MOOD_OPTIONS.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMood(mood === m ? "" : m)}
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    mood === m
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-neutral-500">Rythme</p>
            <div className="flex flex-wrap gap-1">
              {PACE_OPTIONS.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPace(pace === p ? "" : p)}
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    pace === p
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
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
