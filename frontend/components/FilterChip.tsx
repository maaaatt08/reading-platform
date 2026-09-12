export function FilterChip({
  label,
  icon,
  options,
  value,
  onChange,
  labels,
}: {
  label: string;
  icon: React.ReactNode;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  labels?: Record<string, string>;
}) {
  const active = value !== "";

  return (
    <div
      className={`relative inline-flex items-center gap-2 rounded-full border px-3.5 py-2.5 transition hover:border-[#c7996e] hover:shadow-[0_2px_8px_-3px_rgba(43,36,32,0.18)] ${
        active ? "border-accent bg-accent-tint" : "border-border-warm bg-card"
      }`}
    >
      <span className={active ? "text-accent" : "text-ink-soft"}>{icon}</span>
      <span className={`text-[13px] ${active ? "text-ink-soft" : "text-ink"}`}>{label}</span>
      {active && <span className="text-[13px] font-semibold text-accent">{labels?.[value] ?? value}</span>}
      <ChevronDown active={active} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="absolute inset-0 w-full cursor-pointer opacity-0"
      >
        <option value="">Tous</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {labels?.[opt] ?? opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function ChevronDown({ active }: { active: boolean }) {
  return (
    <svg
      width="9"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={active ? "text-accent" : "text-ink-soft"}
    >
      <path d="M1 1l4 4 4-4" />
    </svg>
  );
}
