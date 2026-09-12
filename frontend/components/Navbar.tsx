"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const LINKS = [
  { href: "/library", label: "Bibliothèque" },
  { href: "/discover", label: "Découvrir" },
  { href: "/upcoming", label: "Sorties" },
  { href: "/feed", label: "Fil social" },
  { href: "/friends", label: "Amis" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="border-b border-border-warm bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-10">
          <Link href="/library" className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4.5C4 3.7 4.7 3 5.5 3H12v18H5.5c-.8 0-1.5-.7-1.5-1.5v-15Z" />
              <path d="M20 4.5c0-.8-.7-1.5-1.5-1.5H12v18h6.5c.8 0 1.5-.7 1.5-1.5v-15Z" />
            </svg>
            <span className="font-serif text-[19px] font-semibold tracking-tight text-ink">Bookmarks</span>
          </Link>
          <nav className="hidden gap-7 sm:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm ${
                  pathname.startsWith(link.href)
                    ? "-mb-[1px] border-b-2 border-accent pb-4 font-semibold text-accent"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {user && (
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <Link href={`/profile/${user.id}`} className="hidden text-sm text-ink-muted hover:text-ink sm:inline">
              {user.username}
            </Link>
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#6b7a5e] text-xs font-semibold text-surface">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="shrink-0 rounded-md border border-border-warm px-2.5 py-1.5 text-xs text-ink-muted hover:bg-card sm:px-3 sm:text-sm"
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-border-warm px-4 py-2 sm:hidden">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap text-sm ${
              pathname.startsWith(link.href) ? "font-semibold text-accent" : "text-ink-muted"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
