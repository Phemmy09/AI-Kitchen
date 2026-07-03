import Link from "next/link";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-panel-border bg-[#0a0a0d]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-b from-brand-gold to-brand-gold-dark font-display font-bold text-black">
            R
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-base font-bold text-white">Rated Worktops</span>
            <span className="text-[10px] uppercase tracking-widest text-white/40">Stone Visualiser</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="#how-it-works" className="text-sm text-white/60 hover:text-white">
            How it works
          </a>
          <Link href="/stones" className="text-sm text-white/60 hover:text-white">
            Stones
          </Link>
          <a href="#pricing" className="text-sm text-white/60 hover:text-white">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-gradient-to-b from-brand-gold to-brand-gold-dark px-4 py-2 text-sm font-semibold text-black"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
