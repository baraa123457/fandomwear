import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-5 py-16">
      <Link href="/" className="mx-auto font-display text-lg font-extrabold tracking-tight text-ink">
        FANDOM<span className="text-accent-purple">WEAR</span>
      </Link>
      <div className="mt-8 rounded-2xl border border-line bg-surface p-8">
        <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
        <p className="mt-1.5 text-sm text-ink-faint">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      <p className="mt-6 text-center text-sm text-ink-faint">{footer}</p>
    </div>
  );
}

export function AuthField({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
  return (
    <label className={className}>
      <span className="text-xs font-medium text-ink-dim">{label}</span>
      <input
        {...props}
        className="mt-1.5 h-11 w-full rounded-xl border border-line bg-void px-4 text-sm text-ink placeholder:text-ink-faint focus:border-accent-cyan focus:outline-none"
      />
    </label>
  );
}
