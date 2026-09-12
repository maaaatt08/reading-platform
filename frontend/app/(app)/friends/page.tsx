"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { UserSearchResult } from "@/lib/types";

export default function FriendsPage() {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [followed, setFollowed] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function runSearch(e: FormEvent) {
    e.preventDefault();
    if (!token || !query.trim()) return;
    setLoading(true);
    try {
      const users = await api.searchUsers(token, query.trim());
      setResults(users);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  async function toggleFollow(userId: number) {
    if (!token) return;
    if (followed.has(userId)) {
      await api.unfollow(token, userId);
      setFollowed((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    } else {
      await api.follow(token, userId);
      setFollowed((prev) => new Set(prev).add(userId));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Trouver des amis</h1>

      <form onSubmit={runSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Nom d'utilisateur..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-sm rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "..." : "Chercher"}
        </button>
      </form>

      {searched && !loading && results.length === 0 && (
        <p className="text-sm text-neutral-500">Aucun utilisateur trouvé.</p>
      )}

      <ul className="space-y-2">
        {results.map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3"
          >
            <Link href={`/profile/${u.id}`} className="text-sm font-medium hover:underline">
              {u.username}
            </Link>
            <button
              onClick={() => toggleFollow(u.id)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                followed.has(u.id)
                  ? "border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                  : "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-700"
              }`}
            >
              {followed.has(u.id) ? "Suivi(e)" : "Suivre"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
