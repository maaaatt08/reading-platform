"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { BookDetail, Status } from "@/lib/types";
import { STATUS_LABELS, STATUS_OPTIONS } from "@/lib/constants";
import { BookCover } from "@/components/BookCover";
import { Button } from "@/components/Button";
import { BookmarkIcon, StarIcon, CheckIcon, ChevronDownIcon } from "@/components/icons";

const AVATAR_COLORS = ["#6b7a5e", "#5d7a8c", "#7a5670", "#c99a3a", "#b5542e"];

function avatarColor(username: string) {
  let sum = 0;
  for (let i = 0; i < username.length; i++) sum += username.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

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

  if (loading) return <p className="text-sm text-ink-muted">Chargement...</p>;
  if (!book) return <p className="text-sm text-ink-muted">Livre introuvable.</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-8 sm:flex-row">
        <BookCover
          src={book.cover_url}
          title={book.title}
          className="aspect-[2/3] w-44 shrink-0 rounded-md shadow-[0_18px_34px_-14px_rgba(43,36,32,0.35)]"
        />
        <div className="space-y-1">
          <h1 className="font-serif text-[32px] font-semibold leading-tight tracking-tight">{book.title}</h1>
          {book.author && <p className="text-[15px] text-ink-muted">{book.author}</p>}

          {book.ratings_count > 0 && (
            <div className="flex items-center gap-2 pt-2 pb-1">
              <span className="text-[15px] tracking-wide text-star">
                {"★".repeat(Math.round(Number(book.avg_rating)))}
                {"☆".repeat(5 - Math.round(Number(book.avg_rating)))}
              </span>
              <span className="text-[14.5px] font-semibold text-ink">{book.avg_rating}</span>
              <span className="text-[13px] text-ink-soft">
                · {book.ratings_count} lecteur{book.ratings_count > 1 ? "s" : ""}
              </span>
            </div>
          )}

          {book.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 pb-1">
              {book.tags.map((t, i) => (
                <span
                  key={i}
                  className="rounded-full bg-[#efe2d2] px-3 py-1 text-[11.5px] font-semibold text-ink-muted"
                >
                  {t.tag_value}
                </span>
              ))}
            </div>
          )}

          {book.description && (
            <p className="max-w-xl pt-2 text-[14.5px] leading-relaxed text-[#4a4239]">{book.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-5">
        <form
          onSubmit={handleAddToLibrary}
          className="flex-1 basis-[420px] space-y-3.5 rounded-[10px] border border-border-warm bg-surface p-6"
        >
          <h2 className="font-serif text-base font-semibold">Ajouter à ma bibliothèque</h2>
          <div className="flex flex-wrap gap-2.5">
            <ChipSelect
              value={status}
              onChange={(v) => setStatus(v as Status)}
              icon={<BookmarkIcon className="h-3.5 w-3.5" strokeWidth={2} />}
              display={STATUS_LABELS[status]}
              active
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </ChipSelect>

            <ChipSelect
              value={rating}
              onChange={(v) => setRating(v === "" ? "" : Number(v))}
              icon={<StarIcon className="h-3.5 w-3.5" strokeWidth={1.8} />}
              display={rating === "" ? "Note (optionnel)" : `${rating} ★`}
              active={rating !== ""}
            >
              <option value="">Note (optionnel)</option>
              {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((r) => (
                <option key={r} value={r}>
                  {r} ★
                </option>
              ))}
            </ChipSelect>

            <Button type="submit" disabled={savingLibrary} icon={<CheckIcon className="h-3.5 w-3.5" />}>
              {savingLibrary ? "..." : "Enregistrer"}
            </Button>
          </div>
          {libraryMessage && <p className="text-sm text-ink-muted">{libraryMessage}</p>}
        </form>

        <div className="flex-1 basis-[260px] rounded-[10px] border border-border-warm bg-surface p-6">
          <h2 className="font-serif text-base font-semibold">Lu par tes amis</h2>
          {book.friends_reading.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">Aucun de tes amis n&apos;a ce livre pour l&apos;instant.</p>
          ) : (
            <div className="mt-3.5 flex flex-col gap-3">
              {book.friends_reading.map((fr, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11.5px] font-semibold text-surface"
                    style={{ backgroundColor: avatarColor(fr.username) }}
                  >
                    {fr.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 text-[13.5px] font-semibold">{fr.username}</span>
                  <span className="text-xs text-ink-soft">{STATUS_LABELS[fr.status]}</span>
                  {fr.rating != null && (
                    <span className="text-xs tracking-wide text-star">{"★".repeat(Math.round(fr.rating))}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={handleRecommend}
        className="max-w-md space-y-3 rounded-[10px] border border-border-warm bg-surface p-6"
      >
        <h2 className="font-serif text-base font-semibold">Recommander à un ami</h2>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={recommendUsername}
          onChange={(e) => setRecommendUsername(e.target.value)}
          className="w-full rounded-md border border-border-warm bg-card px-3 py-2 text-sm text-ink"
        />
        <input
          type="text"
          placeholder="Message (optionnel)"
          value={recommendMessage}
          onChange={(e) => setRecommendMessage(e.target.value)}
          className="w-full rounded-md border border-border-warm bg-card px-3 py-2 text-sm text-ink"
        />
        <Button type="submit">Recommander</Button>
        {recommendStatus && <p className="text-sm text-ink-muted">{recommendStatus}</p>}
      </form>

      <div className="space-y-4">
        <h2 className="font-serif text-xl font-semibold">Avis ({book.reviews.length})</h2>

        <form onSubmit={handleAddReview} className="max-w-xl space-y-2">
          <textarea
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
            placeholder="Partage ton avis..."
            rows={3}
            className="w-full rounded-md border border-border-warm bg-card px-3 py-2 text-sm text-ink"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-ink-muted">
              <input
                type="checkbox"
                checked={hasSpoiler}
                onChange={(e) => setHasSpoiler(e.target.checked)}
              />
              Contient un spoiler
            </label>
            <Button type="submit" disabled={submittingReview || !reviewContent.trim()}>
              {submittingReview ? "..." : "Publier"}
            </Button>
          </div>
        </form>

        <ul className="space-y-3">
          {book.reviews.map((r) => (
            <li key={r.id} className="rounded-[10px] border border-border-warm bg-surface p-4">
              <div className="mb-2 flex items-center gap-2.5">
                <div
                  className="flex h-[26px] w-[26px] items-center justify-center rounded-full text-[11px] font-semibold text-surface"
                  style={{ backgroundColor: avatarColor(r.username) }}
                >
                  {r.username.charAt(0).toUpperCase()}
                </div>
                <p className="text-[13.5px] font-semibold">{r.username}</p>
              </div>
              <p className="text-sm leading-relaxed text-[#4a4239]">
                {r.has_spoiler ? <span className="font-semibold text-red-700">[Spoiler] </span> : null}
                {r.content}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ChipSelect({
  value,
  onChange,
  icon,
  display,
  active,
  children,
}: {
  value: string | number;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  display: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative inline-flex items-center gap-2 rounded-full border px-3.5 py-2.5 transition hover:border-[#c7996e] ${
        active ? "border-accent bg-accent-tint" : "border-border-warm bg-card"
      }`}
    >
      <span className={active ? "text-accent" : "text-ink-soft"}>{icon}</span>
      <span className={`text-[13px] ${active ? "font-semibold text-accent" : "text-ink-soft"}`}>{display}</span>
      <ChevronDownIcon className={`h-[5px] w-2 ${active ? "text-accent" : "text-ink-soft"}`} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full cursor-pointer opacity-0"
      >
        {children}
      </select>
    </div>
  );
}
