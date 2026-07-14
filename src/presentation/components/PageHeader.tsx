import { Link } from "react-router-dom";

type PageHeaderProps = {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  breadcrumb?: { label: string; to?: string }[];
};

export function PageHeader({ eyebrow, title, subtitle, breadcrumb }: PageHeaderProps) {
  return (
    <section className="relative border-b border-line pt-20 pb-16 lg:pt-28 lg:pb-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 line-grid opacity-40" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        {/* Breadcrumb */}
        {breadcrumb && (
          <div className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-ink-faint">
            <Link to="/" className="transition hover:text-ink-dim">
              Home
            </Link>
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="text-ink-faint">/</span>
                {crumb.to ? (
                  <Link to={crumb.to} className="transition hover:text-ink-dim">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-ink-dim">{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
        )}

        <div className="mb-6 flex items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-chronos">
            {eyebrow}
          </span>
          <div className="h-px w-10 bg-line" />
        </div>

        <h1 className="font-serif text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.98] tracking-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-ink-dim sm:text-[16px]">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
