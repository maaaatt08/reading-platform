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
import { FilterChip } from "@/components/FilterChip";
import { Button } from "@/components/Button";
import { GlobeIcon, TagIcon, ChatIcon, SparkleIcon, PulseIcon, SearchIcon } from "@/components/icons";

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
      <div>
        <h1 className="font-serif text-[34px] font-semibold tracking-tight">Découvrir</h1>
        <p className="mt-1 text-[14.5px] text-ink-muted">
          Trouve ta prochaine lecture par littérature, genre, humeur ou rythme.
        </p>
      </div>

      <form onSubmit={runSearch} className="space-y-5 rounded-[10px] border border-border-warm bg-surface p-6">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" strokeWidth={2} />
          <input
            type="text"
            placeholder="Titre ou auteur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border-warm bg-card py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-ink-soft"
          />
        </div>

        <div className="flex flex-wrap gap-2.5">
          <FilterChip label="Littérature" icon={<GlobeIcon className="h-[15px] w-[15px]" />} options={LITERATURE_OPTIONS} value={literature} onChange={setLiterature} labels={LITERATURE_LABELS} />
          <FilterChip label="Genre" icon={<TagIcon className="h-[15px] w-[15px]" />} options={THEME_OPTIONS} value={theme} onChange={setTheme} labels={THEME_LABELS} />
          <FilterChip label="Langue" icon={<ChatIcon className="h-[15px] w-[15px]" />} options={LANGUAGE_OPTIONS} value={language} onChange={setLanguage} labels={LANGUAGE_LABELS} />
          <FilterChip label="Mood" icon={<SparkleIcon className="h-[15px] w-[15px]" />} options={MOOD_OPTIONS} value={mood} onChange={setMood} />
          <FilterChip label="Rythme" icon={<PulseIcon className="h-[15px] w-[15px]" />} options={PACE_OPTIONS} value={pace} onChange={setPace} />
        </div>

        <Button type="submit" disabled={loading} icon={<SearchIcon className="h-[15px] w-[15px]" strokeWidth={2.2} />}>
          {loading ? "Recherche..." : "Rechercher"}
        </Button>
      </form>

      {searched && !loading && books.length === 0 && (
        <p className="text-sm text-ink-muted">Aucun livre ne correspond à ces critères.</p>
      )}

      <div className="grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
