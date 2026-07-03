import { InputHTMLAttributes, forwardRef } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string };

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, id, className = "", ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="text-xs font-semibold uppercase tracking-wide text-white/50"
      >
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={`w-full rounded-lg border border-panel-border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-brand-gold focus:ring-1 focus:ring-brand-gold ${className}`}
        {...props}
      />
    </div>
  );
});
