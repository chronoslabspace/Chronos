import { ScrollReveal } from "../../components/ScrollReveal";

const phases = [
  {
    num: "01",
    title: "Intake",
    body: "Your agent submits a state snapshot and a set of candidate actions. Chronos validates causal invariants in under a millisecond.",
    time: "t = 0.0ms",
    color: "#60899B",
  },
  {
    num: "02",
    title: "Fork",
    body: "The runtime clones state into N isolated branches. Each branch is allocated a deterministic compute budget and entropy quota.",
    time: "t = 0.3ms",
    color: "#CDCAB2",
  },
  {
    num: "03",
    title: "Compute",
    body: "Branches execute in parallel across the temporal fabric. Conflicts are detected at the byte level; redundant work is pruned on the fly.",
    time: "t = 1.4ms",
    color: "#E2DDDA",
  },
  {
    num: "04",
    title: "Collapse",
    body: "A scoring function evaluates every outcome. The highest-scoring branch is merged back into canonical state; the rest are archived for replay.",
    time: "t = 2.1ms",
    color: "#60899B",
  },
];

export function Timeline() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Timeline */}
        <div className="relative">
          {/* Spine */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-line via-line-strong to-line lg:left-1/2 lg:-translate-x-1/2" />

          <div className="space-y-20 lg:space-y-32">
            {phases.map((p, i) => (
              <ScrollReveal key={p.num} delay={i * 80}>
                <div
                  className={`relative grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-20 ${
                    i % 2 === 0 ? "" : "lg:[&>*:first-child]:order-2"
                  }`}
                >
                {/* Node on spine — clean, no halo */}
                <div className="absolute left-8 top-3 h-3 w-3 -translate-x-1/2 lg:left-1/2">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ background: p.color }}
                  />
                  <div
                    className="absolute -inset-1.5 rounded-full border"
                    style={{ borderColor: p.color, opacity: 0.3 }}
                  />
                </div>

                {/* Text side */}
                <div className="pl-20 lg:pl-0 lg:pr-16 lg:text-right">
                  <div
                    className="inline-flex items-center gap-3"
                    style={{ color: p.color }}
                  >
                    <span className="font-mono text-[11px] uppercase tracking-[0.25em]">
                      Phase {p.num}
                    </span>
                    <span className="h-px w-8 bg-current opacity-40" />
                  </div>
                  <h3 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
                    {p.title}
                    <span className="ml-2 text-ink-faint">.</span>
                  </h3>
                  <p className="mt-5 max-w-md text-[14px] leading-[1.75] text-ink-dim lg:ml-auto">
                    {p.body}
                  </p>
                </div>

                {/* Visual side */}
                <div className="pl-20 lg:pl-16">
                  <PhaseVisual index={i} color={p.color} />
                </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PhaseVisual({ index, color }: { index: number; color: string }) {
  const wrapper = "relative h-[230px] overflow-hidden rounded-xl border border-line bg-bg-soft/60 sm:h-[250px]";
  const footer = "absolute bottom-3 left-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint";

  if (index === 0) {
    return (
      <div className={wrapper}>
        <div className="flex h-full items-center justify-center">
          <svg viewBox="0 0 200 120" className="h-full w-full">
            <rect x="25" y="25" width="55" height="70" rx="2" stroke={color} strokeWidth="0.8" fill="none" opacity="0.5" />
            <rect x="120" y="25" width="55" height="70" rx="2" stroke={color} strokeWidth="0.8" fill="none" opacity="0.5" />
            <path d="M85 60 L115 60" stroke={color} strokeWidth="0.8" fill="none" />
            <path d="M110 56 L116 60 L110 64" stroke={color} strokeWidth="0.8" fill="none" />
            <text x="52" y="65" fill="#989898" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">STATE</text>
            <text x="147" y="65" fill="#989898" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">ACTIONS</text>
          </svg>
        </div>
        <div className={footer}>snapshot.json · 142kb</div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className={wrapper}>
        <div className="flex h-full items-center justify-center">
          <svg viewBox="0 0 200 120" className="h-full w-full">
            <line x1="25" y1="60" x2="65" y2="60" stroke={color} strokeWidth="0.8" />
            <circle cx="25" cy="60" r="3" fill={color} />
            {[25, 60, 95].map((y, i) => (
              <g key={i}>
                <path d={`M65 60 C 105 60, 125 ${y}, 175 ${y}`} stroke={color} strokeWidth="0.6" fill="none" opacity={0.75 - i * 0.15} />
                <circle cx="175" cy={y} r="2" fill={color} opacity={0.75 - i * 0.15} />
              </g>
            ))}
          </svg>
        </div>
        <div className={footer}>branches: 1,024 · isolation: byte-level</div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className={wrapper}>
        <div className="flex h-full items-center justify-center">
          <svg viewBox="0 0 200 120" className="h-full w-full">
            {Array.from({ length: 7 }).map((_, r) =>
              Array.from({ length: 13 }).map((_, c) => {
                const active = (r + c) % 3 === 0 || (r * c) % 5 === 0;
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={25 + c * 12}
                    y={15 + r * 13}
                    width="9"
                    height="9"
                    fill={color}
                    opacity={active ? 0.75 : 0.06}
                    rx="1"
                  />
                );
              })
            )}
          </svg>
        </div>
        <div className={footer}>cores: 8,192 · util: 94%</div>
      </div>
    );
  }

  return (
    <div className={wrapper}>
      <div className="flex h-full items-center justify-center">
        <svg viewBox="0 0 200 120" className="h-full w-full">
          {[25, 60, 95].map((y, i) => (
            <path
              key={i}
              d={`M30 ${y} C 70 ${y}, 90 60, 125 60`}
              stroke={color}
              strokeWidth="0.6"
              fill="none"
              opacity={0.75 - i * 0.15}
            />
          ))}
          <line x1="125" y1="60" x2="170" y2="60" stroke={color} strokeWidth="0.8" />
          <circle cx="170" cy="60" r="3.5" fill={color} />
          <circle cx="170" cy="60" r="8" fill={color} opacity="0.1" />
        </svg>
      </div>
      <div className={footer}>winner: branch_0x4a · score: 0.942</div>
    </div>
  );
}
