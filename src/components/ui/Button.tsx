import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

const variants: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "bg-gradient-to-b from-brand-gold to-brand-gold-dark text-black shadow-[0_2px_12px_rgba(201,169,110,0.3)] hover:from-brand-gold-light hover:to-brand-gold hover:shadow-[0_8px_40px_rgba(201,169,110,0.18)] hover:-translate-y-0.5",
  secondary: "bg-white/5 text-white border border-panel-border hover:bg-white/10",
  danger: "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20",
  ghost: "text-white/70 hover:text-white",
};

export function Button({ variant = "primary", className = "", ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none active:scale-[0.98] ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
