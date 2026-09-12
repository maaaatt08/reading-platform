"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { UserSearchResult } from "@/lib/types";
import { Button } from "@/components/Button";
import { SearchIcon } from "@/components/icons";

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
      <h1 className="font-serif text-[34px] font-semibold tracking-tight">Trouver des amis</h1>

      <form onSubmit={runSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Nom d'utilisateur..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-sm rounded-md border border-border-warm bg-card px-3 py-2 text-sm text-ink"
        />
        <Button type="submit" disabled={loading} icon={<SearchIcon className="h-[15px] w-[15px]" strokeWidth={2.2} />}>
          {loading ? "..." : "Chercher"}
        </Button>
      </form>

      {searched && !loading && results.length === 0 && (
        <p className="text-sm text-ink-muted">Aucun utilisateur trouvé.</p>
      )}

      <ul className="space-y-2">
        {results.map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between rounded-[10px] border border-border-warm bg-surface p-3"
          >
            <Link href={`/profile/${u.id}`} className="text-sm font-semibold hover:text-accent">
              {u.username}
            </Link>
            <button
              onClick={() => toggleFollow(u.id)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                followed.has(u.id)
                  ? "border-border-warm text-ink-muted hover:bg-card"
                  : "border-accent bg-accent text-card hover:bg-accent-dark"
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
