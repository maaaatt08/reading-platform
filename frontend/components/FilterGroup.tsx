export function FilterGroup({
  label,
  options,
  value,
  onChange,
  labels,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  labels?: Record<string, string>;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <button
            type="button"
            key={opt}
            onClick={() => onChange(value === opt ? "" : opt)}
            className={`rounded-full border px-2.5 py-1 text-xs ${
              value === opt
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {labels?.[opt] ?? opt}
          </button>
        ))}
      </div>
    </div>
  );
}
