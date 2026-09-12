"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { BookDetail, Status } from "@/lib/types";
import { STATUS_LABELS, STATUS_OPTIONS } from "@/lib/constants";
import { BookCover } from "@/components/BookCover";

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<Status>("to_read");
  const [rating, setRating] = useState<number | "">("");
  const [savingLibrary, setSavingLibrary] = useState(false);
  const [libraryMessage, setLibraryMessage] = useState<string | null>(null);

  const [reviewContent, setReviewContent] = useState("");
  const [hasSpoiler, setHasSpoiler] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const [recommendUsername, setRecommendUsername] = useState("");
  const [recommendMessage, setRecommendMessage] = useState("");
  const [recommendStatus, setRecommendStatus] = useState<string | null>(null);

  function loadBook() {
    if (!id) return;
    setLoading(true);
    return api.bookDetail(id).then(setBook).finally(() => setLoading(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset loading when the viewed book changes
    loadBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAddToLibrary(e: FormEvent) {
    e.preventDefault();
    if (!token || !book) return;
    setSavingLibrary(true);
    setLibraryMessage(null);
    try {
      await api.addToLibrary(token, {
        book_id: book.id,
        status,
        rating: rating === "" ? null : Number(rating),
      });
      setLibraryMessage("Ajouté à ta bibliothèque !");
    } catch (err) {
      setLibraryMessage(err instanceof ApiError ? err.message : "Erreur");
    } finally {
      setSavingLibrary(false);
    }
  }

  async function handleAddReview(e: FormEvent) {
    e.preventDefault();
    if (!token || !book || !reviewContent.trim()) return;
    setSubmittingReview(true);
    try {
      await api.addReview(token, {
        book_id: book.id,
        content: reviewContent.trim(),
        has_spoiler: hasSpoiler,
      });
      setReviewContent("");
      setHasSpoiler(false);
      await loadBook();
    } finally {
      setSubmittingReview(false);
    }
  }

  async function handleRecommend(e: FormEvent) {
    e.preventDefault();
    if (!token || !book || !recommendUsername.trim()) return;
    setRecommendStatus(null);
    try {
      const matches = await api.searchUsers(token, recommendUsername.trim());
      const target = matches.find(
        (u) => u.username.toLowerCase() === recommendUsername.trim().toLowerCase()
      );
      if (!target) {
        setRecommendStatus("Utilisateur introuvable.");
        return;
      }
      await api.recommend(token, {
        to_user_id: target.id,
        book_id: book.id,
        message: recommendMessage.trim() || undefined,
      });
      setRecommendStatus(`Recommandé à ${target.username} !`);
      setRecommendUsername("");
      setRecommendMessage("");
    } catch (err) {
      setRecommendStatus(err instanceof ApiError ? err.message : "Erreur");
    }
  }

  if (loading) return <p className="text-sm text-neutral-500">Chargement...</p>;
  if (!book) return <p className="text-sm text-neutral-500">Livre introuvable.</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row">
        <BookCover
          src={book.cover_url}
          title={book.title}
          className="h-64 w-44 shrink-0 rounded-lg"
        />
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-semibold">{book.title}</h1>
            {book.author && <p className="text-neutral-600">{book.author}</p>}
          </div>

          {book.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {book.tags.map((t, i) => (
                <span
                  key={i}
                  className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600"
                >
                  {t.tag_type}: {t.tag_value}
                </span>
              ))}
            </div>
          )}

          {book.description && (
            <p className="max-w-2xl text-sm text-neutral-600">{book.description}</p>
          )}
        </div>
      </div>

      <form
        onSubmit={handleAddToLibrary}
        className="max-w-md space-y-3 rounded-lg border border-neutral-200 bg-white p-4"
      >
        <h2 className="font-medium">Ajouter à ma bibliothèque</h2>
        <div className="flex gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value === "" ? "" : Number(e.target.value))}
            className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          >
            <option value="">Note (optionnel)</option>
            {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((r) => (
              <option key={r} value={r}>
                {r} ★
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={savingLibrary}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {savingLibrary ? "..." : "Enregistrer"}
          </button>
        </div>
        {libraryMessage && <p className="text-sm text-neutral-600">{libraryMessage}</p>}
      </form>

      <form
        onSubmit={handleRecommend}
        className="max-w-md space-y-3 rounded-lg border border-neutral-200 bg-white p-4"
      >
        <h2 className="font-medium">Recommander à un ami</h2>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={recommendUsername}
          onChange={(e) => setRecommendUsername(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Message (optionnel)"
          value={recommendMessage}
          onChange={(e) => setRecommendMessage(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          Recommander
        </button>
        {recommendStatus && <p className="text-sm text-neutral-600">{recommendStatus}</p>}
      </form>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Avis ({book.reviews.length})</h2>

        <form onSubmit={handleAddReview} className="max-w-xl space-y-2">
          <textarea
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
            placeholder="Partage ton avis..."
            rows={3}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <input
                type="checkbox"
                checked={hasSpoiler}
                onChange={(e) => setHasSpoiler(e.target.checked)}
              />
              Contient un spoiler
            </label>
            <button
              type="submit"
              disabled={submittingReview || !reviewContent.trim()}
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {submittingReview ? "..." : "Publier"}
            </button>
          </div>
        </form>

        <ul className="space-y-3">
          {book.reviews.map((r) => (
            <li key={r.id} className="rounded-lg border border-neutral-200 bg-white p-3">
              <p className="text-sm font-medium">{r.username}</p>
              <p className="mt-1 text-sm text-neutral-600">
                {r.has_spoiler ? <span className="font-medium text-red-600">[Spoiler] </span> : null}
                {r.content}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
