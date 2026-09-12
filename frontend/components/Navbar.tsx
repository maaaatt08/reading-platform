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
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/library" className="text-lg font-semibold">
            📚 Bookmarks
          </Link>
          <nav className="hidden gap-4 sm:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm ${
                  pathname.startsWith(link.href)
                    ? "font-medium text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <Link href={`/profile/${user.id}`} className="text-sm text-neutral-600 hover:underline">
              {user.username}
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100"
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-neutral-100 px-4 py-2 sm:hidden">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap text-sm ${
              pathname.startsWith(link.href) ? "font-medium text-neutral-900" : "text-neutral-500"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
