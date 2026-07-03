"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Zap, ChevronDown } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import type { Profile } from "@/lib/data/profile";

const NAV_LINKS = [
  { href: "/visualiser", label: "Visualiser" },
  { href: "/stones", label: "Stone Catalog" },
  { href: "/my-renders", label: "My Renders" },
  { href: "/credits", label: "Credits" },
];

export function AppNavbar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-panel-border bg-[#0a0a0d]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/visualiser" className="flex items-center gap-3">
          <img src="/logo.svg" alt="RatedWorktops" className="h-9 w-9 rounded-lg" />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-base font-bold">Rated Worktops</span>
            <span className="text-[10px] uppercase tracking-widest text-white/40">Stone Visualiser</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition ${
                pathname.startsWith(link.href) ? "text-white" : "text-white/50 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/credits"
            className="flex items-center gap-1.5 rounded-full border border-panel-border bg-white/5 px-3 py-1.5 text-sm font-semibold text-brand-gold"
          >
            <Zap className="h-3.5 w-3.5" />
            {profile.credits} credits
          </Link>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1 rounded-full border border-panel-border bg-white/5 py-1 pl-1 pr-2"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold/20 text-xs font-bold text-brand-gold">
                {profile.name.charAt(0).toUpperCase()}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-white/50" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-lg border border-panel-border bg-panel py-1 shadow-xl"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <div className="border-b border-panel-border px-4 py-2 text-xs text-white/40">
                  {profile.email}
                </div>
                <Link href="/account" className="block px-4 py-2 text-sm text-white/80 hover:bg-white/5">
                  My Profile
                </Link>
                <Link href="/credits" className="block px-4 py-2 text-sm text-white/80 hover:bg-white/5">
                  Subscription & Credits
                </Link>
                <form action={signOut}>
                  <button className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5">
                    Sign out
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
