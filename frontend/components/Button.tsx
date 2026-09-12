export function Button({
  icon,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: React.ReactNode }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded-[10px] bg-accent px-5 py-2.5 text-sm font-semibold text-card shadow-[0_6px_14px_-6px_rgba(43,36,32,0.35)] transition hover:-translate-y-px hover:shadow-[0_10px_18px_-8px_rgba(43,36,32,0.4)] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_6px_14px_-6px_rgba(43,36,32,0.35)] ${className}`}
    >
      {icon}
      {props.children}
    </button>
  );
}
