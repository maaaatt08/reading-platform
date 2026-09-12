"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/Button";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(username, email, password);
      router.push("/library");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-cream px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-border-warm bg-surface p-8 shadow-sm"
      >
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink">Créer un compte</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Rejoins la communauté pour suivre tes lectures.
          </p>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-ink" htmlFor="username">
            Nom d&apos;utilisateur
          </label>
          <input
            id="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border border-border-warm bg-card px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-ink" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border-warm bg-card px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-ink" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border-warm bg-card px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
        </div>

        <Button type="submit" disabled={submitting} className="w-full justify-center">
          {submitting ? "Création..." : "Créer mon compte"}
        </Button>

        <p className="text-center text-sm text-ink-muted">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-accent underline">
            Se connecter
          </Link>
        </p>
      </form>
    </main>
  );
}
