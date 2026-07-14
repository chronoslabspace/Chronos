const partners = [
  "HELION",
  "VEKTOR",
  "PARALLAX",
  "AXIOM",
  "LUMEN",
  "VERTEX",
  "NEBULA",
  "QUANTUM",
  "AETHER",
  "SOLARIS",
];

export function Marquee() {
  const doubled = [...partners, ...partners];
  return (
    <section className="relative border-b border-line py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-faint">
            Powering temporal systems at
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-bg to-transparent" />

        <div className="marquee-track flex w-max items-center gap-16">
          {doubled.map((p, i) => (
            <div
              key={i}
              className="flex shrink-0 items-center gap-3 text-ink-faint transition hover:text-ink"
            >
              <span className="h-1 w-1 rounded-full bg-ink-faint" />
              <span className="font-mono text-sm tracking-[0.2em]">{p}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
