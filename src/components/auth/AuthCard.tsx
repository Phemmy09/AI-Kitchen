import Link from "next/link";
import { ReactNode } from "react";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0d] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-panel-border bg-panel p-8 shadow-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            href="/"
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-b from-brand-gold to-brand-gold-dark font-display text-xl font-bold text-black"
          >
            R
          </Link>
          <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-white/50">{subtitle}</p>}
        </div>
        {children}
        {footer && <div className="mt-6 text-center text-sm text-white/50">{footer}</div>}
      </div>
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      {message}
    </div>
  );
}

export function FormNotice({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
      {message}
    </div>
  );
}
