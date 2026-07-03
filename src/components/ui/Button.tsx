import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

const variants: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "bg-gradient-to-b from-brand-gold to-brand-gold-dark text-black hover:brightness-110",
  secondary:
    "bg-white/5 text-white border border-panel-border hover:bg-white/10",
  danger: "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20",
  ghost: "text-white/70 hover:text-white",
};

export function Button({ variant = "primary", className = "", ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
