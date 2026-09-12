"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Status, UserBook } from "@/lib/types";
import { STATUS_LABELS, STATUS_OPTIONS } from "@/lib/constants";
import { BookCover } from "@/components/BookCover";

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
        <h1 className="text-2xl font-semibold">Ma bibliothèque</h1>
        <Link href="/discover" className="text-sm text-neutral-600 underline">
          Chercher un livre à ajouter
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", ...STATUS_OPTIONS] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3 py-1 text-sm ${
              filter === s
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {s === "all" ? "Tous" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Chargement...</p>
      ) : books.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Aucun livre ici pour l&apos;instant. Va sur{" "}
          <Link href="/discover" className="underline">
            Découvrir
          </Link>{" "}
          pour en ajouter.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {books.map((book) => (
            <div
              key={book.id}
              className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white"
            >
              <Link href={`/books/${book.book_id}`}>
                <BookCover src={book.cover_url} title={book.title} className="h-40 w-full" />
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <Link href={`/books/${book.book_id}`} className="line-clamp-2 text-sm font-medium hover:underline">
                  {book.title}
                </Link>
                {book.author && <p className="text-xs text-neutral-500">{book.author}</p>}
                {book.rating != null && (
                  <p className="text-xs text-amber-600">{"★".repeat(Math.round(book.rating))}</p>
                )}
                <select
                  value={book.status}
                  onChange={(e) => updateStatus(book, e.target.value as Status)}
                  className="mt-auto rounded-md border border-neutral-300 px-2 py-1 text-xs"
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
