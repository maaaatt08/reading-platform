"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { PublicProfile, UserBook } from "@/lib/types";
import { BookCard } from "@/components/BookCard";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { token, user: me } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [books, setBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [followBusy, setFollowBusy] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset loading when the viewed profile changes
    setLoading(true);
    Promise.all([api.userProfile(token, id), api.userBooks(token, id, "read")])
      .then(([profileData, booksData]) => {
        setProfile(profileData);
        setBooks(booksData);
      })
      .finally(() => setLoading(false));
  }, [token, id]);

  async function toggleFollow() {
    if (!token || !profile) return;
    setFollowBusy(true);
    try {
      if (profile.is_followed_by_me) {
        await api.unfollow(token, profile.id);
      } else {
        await api.follow(token, profile.id);
      }
      setProfile({ ...profile, is_followed_by_me: !profile.is_followed_by_me });
    } finally {
      setFollowBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-neutral-500">Chargement...</p>;
  if (!profile) return <p className="text-sm text-neutral-500">Utilisateur introuvable.</p>;

  const isMe = me?.id === profile.id;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between rounded-lg border border-neutral-200 bg-white p-6">
        <div>
          <h1 className="text-2xl font-semibold">{profile.username}</h1>
          {profile.bio && <p className="mt-1 text-sm text-neutral-600">{profile.bio}</p>}
          <div className="mt-3 flex gap-4 text-sm text-neutral-500">
            <span>{profile.books_read_count} livres lus</span>
            <span>{profile.followers_count} abonnés</span>
            <span>{profile.following_count} abonnements</span>
          </div>
        </div>
        {!isMe && (
          <button
            onClick={toggleFollow}
            disabled={followBusy}
            className={`rounded-md border px-4 py-2 text-sm disabled:opacity-50 ${
              profile.is_followed_by_me
                ? "border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                : "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-700"
            }`}
          >
            {profile.is_followed_by_me ? "Suivi(e)" : "Suivre"}
          </button>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Livres lus</h2>
        {books.length === 0 ? (
          <p className="text-sm text-neutral-500">Aucun livre marqué comme lu.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {books.map((b) => (
              <BookCard
                key={b.book_id}
                id={b.book_id}
                title={b.title}
                author={b.author}
                coverUrl={b.cover_url}
                footer={
                  b.rating != null && (
                    <p className="text-xs text-amber-600">{"★".repeat(Math.round(b.rating))}</p>
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
