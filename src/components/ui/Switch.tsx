export function Switch({ checked, disabled, onClick }: { checked: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onClick}
      className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 disabled:opacity-40 ${
        checked ? "bg-brand-gold" : "bg-white/10"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
