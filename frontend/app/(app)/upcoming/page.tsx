"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Book } from "@/lib/types";
import { BookCard } from "@/components/BookCard";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function UpcomingPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.upcomingBooks().then(setBooks).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-[34px] font-semibold tracking-tight">Prochaines sorties</h1>

      {loading ? (
        <p className="text-sm text-ink-muted">Chargement...</p>
      ) : books.length === 0 ? (
        <p className="text-sm text-ink-muted">
          Aucune sortie à venir n&apos;est renseignée pour le moment.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {books.map((book) => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              author={book.author}
              coverUrl={book.cover_url}
              footer={
                book.release_date && (
                  <p className="mt-1 text-[11px] text-ink-soft">{formatDate(book.release_date)}</p>
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
