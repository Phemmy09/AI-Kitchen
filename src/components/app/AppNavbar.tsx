"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
        <Link href="/visualiser" className="group flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="RatedWorktops"
            className="h-9 w-9 rounded-lg transition-transform duration-200 group-hover:scale-105"
          />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-base font-bold">Rated Worktops</span>
            <span className="text-[10px] uppercase tracking-widest text-white/40">Stone Visualiser</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 text-sm font-medium transition-colors duration-200 ${
                  active ? "text-white" : "text-white/50 hover:text-white"
                }`}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-brand-gold"
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/credits"
            className="flex items-center gap-1.5 rounded-full border border-panel-border bg-white/5 px-3 py-1.5 text-sm font-semibold text-brand-gold transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--border-gold)] hover:shadow-[0_8px_40px_rgba(201,169,110,0.18)]"
          >
            <Zap className="h-3.5 w-3.5" />
            {profile.credits} credits
          </Link>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1 rounded-full border border-panel-border bg-white/5 py-1 pl-1 pr-2 transition-colors duration-200 hover:bg-white/10"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold/20 text-xs font-bold text-brand-gold">
                {profile.name.charAt(0).toUpperCase()}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-white/50 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute right-0 mt-2 w-48 rounded-lg border border-panel-border bg-panel py-1 shadow-xl"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <div className="border-b border-panel-border px-4 py-2 text-xs text-white/40">{profile.email}</div>
                  <Link href="/account" className="block px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/5">
                    My Profile
                  </Link>
                  <Link href="/credits" className="block px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/5">
                    Subscription & Credits
                  </Link>
                  <form action={signOut}>
                    <button className="block w-full px-4 py-2 text-left text-sm text-red-400 transition-colors hover:bg-white/5">
                      Sign out
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
