"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Status, UserBook } from "@/lib/types";
import { STATUS_LABELS, STATUS_OPTIONS } from "@/lib/constants";
import { BookCover } from "@/components/BookCover";
import { BookmarkIcon, ChevronDownIcon } from "@/components/icons";

export default function LibraryPage() {
  const { token } = useAuth();
  const [books, setBooks] = useState<UserBook[]>([]);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset loading when token/filter changes
    setLoading(true);
    api
      .myLibrary(token, filter === "all" ? undefined : filter)
      .then(setBooks)
      .finally(() => setLoading(false));
  }, [token, filter]);

  async function updateStatus(book: UserBook, status: Status) {
    if (!token) return;
    const updated = await api.addToLibrary(token, {
      book_id: book.book_id,
      status,
      rating: book.rating,
    });
    setBooks((prev) =>
      filter === "all" || filter === status
        ? prev.map((b) => (b.id === book.id ? { ...b, ...updated } : b))
        : prev.filter((b) => b.id !== book.id)
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-[34px] font-semibold tracking-tight">Ma bibliothèque</h1>
        <Link href="/discover" className="text-sm text-accent underline">
          Chercher un livre à ajouter
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", ...STATUS_OPTIONS] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-4 py-2 text-[13.5px] font-semibold transition ${
              filter === s
                ? "border-accent bg-accent text-card"
                : "border-border-warm bg-surface text-ink-muted hover:bg-card"
            }`}
          >
            {s === "all" ? "Tous" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-ink-muted">Chargement...</p>
      ) : books.length === 0 ? (
        <p className="text-sm text-ink-muted">
          Aucun livre ici pour l&apos;instant. Va sur{" "}
          <Link href="/discover" className="text-accent underline">
            Découvrir
          </Link>{" "}
          pour en ajouter.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {books.map((book) => (
            <div key={book.id} className="flex flex-col gap-2">
              <Link href={`/books/${book.book_id}`}>
                <BookCover
                  src={book.cover_url}
                  title={book.title}
                  className="aspect-[2/3] w-full rounded-[5px] shadow-[0_4px_10px_-4px_rgba(43,36,32,0.22)]"
                />
              </Link>
              <div>
                <Link
                  href={`/books/${book.book_id}`}
                  className="line-clamp-2 font-serif text-[13px] font-semibold leading-tight text-ink hover:text-accent"
                >
                  {book.title}
                </Link>
                {book.author && <p className="mt-0.5 text-[11px] text-ink-soft">{book.author}</p>}
              </div>
              {book.rating != null && (
                <p className="text-[13px] tracking-wide text-star">{"★".repeat(Math.round(book.rating))}</p>
              )}
              <div className="relative flex items-center justify-between gap-1.5 rounded-full border border-border-warm bg-card px-2.5 py-1.5 transition hover:border-[#c7996e] hover:bg-surface">
                <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <BookmarkIcon className="h-3 w-3 text-ink-soft" strokeWidth={2} />
                  {STATUS_LABELS[book.status]}
                </span>
                <ChevronDownIcon className="h-[5px] w-2 text-ink-soft" />
                <select
                  value={book.status}
                  onChange={(e) => updateStatus(book, e.target.value as Status)}
                  aria-label="Statut"
                  className="absolute inset-0 w-full cursor-pointer opacity-0"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
