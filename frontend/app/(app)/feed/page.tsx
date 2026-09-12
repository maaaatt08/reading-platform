"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { FeedItem, Recommendation } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/constants";
import { BookCover } from "@/components/BookCover";

export default function FeedPage() {
  const { token } = useAuth();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([api.feed(token), api.recommendations(token)])
      .then(([feedData, recData]) => {
        setFeed(feedData);
        setRecommendations(recData);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-sm text-neutral-500">Chargement...</p>;

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="space-y-4 md:col-span-2">
        <h1 className="text-2xl font-semibold">Activité de tes amis</h1>
        {feed.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Rien à afficher pour l&apos;instant. Va sur{" "}
            <Link href="/friends" className="underline">
              Amis
            </Link>{" "}
            pour suivre des lecteurs.
          </p>
        ) : (
          <ul className="space-y-3">
            {feed.map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3"
              >
                <BookCover
                  src={item.cover_url}
                  title={item.title}
                  className="h-16 w-12 shrink-0 rounded"
                />
                <p className="text-sm">
                  <span className="font-medium">{item.username}</span> a marqué{" "}
                  <Link href={`/books/${item.book_id}`} className="underline">
                    {item.title}
                  </Link>{" "}
                  comme <span className="text-neutral-500">{STATUS_LABELS[item.status]}</span>
                  {item.rating != null && (
                    <span className="text-amber-600"> · {"★".repeat(Math.round(item.rating))}</span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recommandations reçues</h2>
        {recommendations.length === 0 ? (
          <p className="text-sm text-neutral-500">Aucune recommandation pour l&apos;instant.</p>
        ) : (
          <ul className="space-y-3">
            {recommendations.map((rec) => (
              <li key={rec.id} className="rounded-lg border border-neutral-200 bg-white p-3">
                <p className="text-sm">
                  <span className="font-medium">{rec.from_username}</span> te recommande{" "}
                  <Link href={`/books/${rec.book_id}`} className="underline">
                    {rec.title}
                  </Link>
                </p>
                {rec.message && <p className="mt-1 text-xs text-neutral-500">« {rec.message} »</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
