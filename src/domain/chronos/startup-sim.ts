// Chronos Startup Simulator
// =========================
// Deterministic simulator that takes an idea string and returns
// 1000 simulated futures collapsed into a best path + alternatives.
//
// The same input always produces the same output (deterministic hash-based).

export type Milestone = {
  month: number;
  title: string;
  description: string;
};

export type Path = {
  id: string;
  name: string;
  thesis: string;
  milestones: Milestone[];
  arr: number; // dollars
  probability: number; // 0-1
  monthsToPmf: number;
  cac: number;
  ltv: number;
  burn: number; // monthly burn
  highlights: string[];
  risks: string[];
};

export type SimulationResult = {
  idea: string;
  category: string;
  categoryLabel: string;
  bestPath: Path;
  alternatives: Path[];
  totalPaths: number;
  pathsEvaluated: number;
  bestBranchId: string;
};

// ---- Hash + seeded RNG ----

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- Categorization ----

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "ai-dev-tools": ["ai", "developer", "dev", "llm", "code", "engineer", "infra", "platform", "sdk", "api"],
  "productivity": ["meeting", "calendar", "note", "assistant", "workflow", "team", "collab"],
  "consumer": ["consumer", "social", "fitness", "wellness", "gaming", "entertainment", "creator"],
  "b2b-saas": ["saas", "b2b", "enterprise", "sales", "crm", "hr", "finance", "accounting"],
  "marketplace": ["marketplace", "uber", "airbnb", "rental", "hire", "gig", "freelance"],
  "fintech": ["fintech", "payment", "banking", "crypto", "invest", "trade", "loan"],
  "health": ["health", "medical", "clinic", "patient", "doctor", "mental", "therapy"],
};

function categorize(idea: string): { category: string; label: string } {
  const lower = idea.toLowerCase();
  let best = { category: "b2b-saas", label: "B2B SaaS", score: 0 };
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of kws) {
      if (lower.includes(kw)) score += 1;
    }
    if (score > best.score) {
      best = { category: cat, label: catLabel(cat), score };
    }
  }
  return { category: best.category, label: best.label };
}

function catLabel(cat: string): string {
  return {
    "ai-dev-tools": "AI / Developer Tools",
    productivity: "Productivity",
    consumer: "Consumer",
    "b2b-saas": "B2B SaaS",
    marketplace: "Marketplace",
    fintech: "Fintech",
    health: "Health",
  }[cat] ?? "General";
}

// ---- Path templates ----

type PathTemplate = Omit<Path, "id" | "arr" | "probability" | "monthsToPmf" | "cac" | "ltv" | "burn"> & {
  arrRange: [number, number];
  probRange: [number, number];
};

const PATHS: Record<string, PathTemplate[]> = {
  "ai-dev-tools": [
    {
      name: "Developer-first wedge",
      thesis: "Win developers with a free tier, convert to paid teams, then enterprise.",
      milestones: [
        { month: 1, title: "Target developers", description: "Open-source the core. Build in public on Twitter / HN." },
        { month: 3, title: "Integrate with Slack + VS Code", description: "Meet devs where they already work. Reduce friction to zero." },
        { month: 6, title: "First paid teams", description: "Team seats at $20/seat/mo. Word-of-mouth driven." },
        { month: 9, title: "Enterprise interest", description: "Two Fortune 500s request SOC 2 and SSO." },
        { month: 12, title: "Enterprise pivot", description: "Reprice to $50/seat. Hire first AEs." },
        { month: 18, title: "$200k MRR", description: "120 enterprise seats. Sales-led expansion." },
      ],
      arrRange: [1_800_000, 3_200_000],
      probRange: [0.14, 0.24],
      highlights: ["Low CAC via OSS", "Strong word-of-mouth", "High switching costs once embedded"],
      risks: ["Long enterprise sales cycles", "Dependence on dev goodwill", "Open-source copycats"],
    },
    {
      name: "Agency-to-product",
      thesis: "Start as a high-touch service, productize the pattern, scale.",
      milestones: [
        { month: 1, title: "Land 3 design partners", description: "Charge $8k/mo for done-for-you AI pipelines." },
        { month: 3, title: "Pattern emerges", description: "Same problem showing up across all three customers." },
        { month: 6, title: "Productize the pattern", description: "Turn the common workflow into a self-serve product." },
        { month: 9, title: "First self-serve cohort", description: "50 companies on a $500/mo plan." },
        { month: 12, title: "Kill the agency arm", description: "All revenue is now product. Team shrinks from 8 to 5." },
        { month: 18, title: "Product-led growth", description: "400 customers at $1.5k/mo average." },
      ],
      arrRange: [5_000_000, 9_000_000],
      probRange: [0.06, 0.12],
      highlights: ["Revenue from day one", "Deep pattern recognition", "Strong founder-market fit"],
      risks: ["Hard to let go of services revenue", "Slow to scale initially", "Team must re-skill"],
    },
    {
      name: "Vertical AI",
      thesis: "Pick one niche. Own it end-to-end. Become the default.",
      milestones: [
        { month: 1, title: "Pick a vertical", description: "Legal contracts, insurance claims, or clinical notes." },
        { month: 3, title: "Embed in the workflow", description: "Integrate with the vertical's existing tools." },
        { month: 6, title: "10 paying customers", description: "All in the same vertical. All referencing each other." },
        { month: 9, title: "Vertical conference talk", description: "Sponsor the main event. Become synonymous with the niche." },
        { month: 12, title: "100 customers in vertical", description: "Network effects within the niche kick in." },
        { month: 18, title: "Expand to adjacent vertical", description: "Take the same engine to the next market." },
      ],
      arrRange: [2_400_000, 4_500_000],
      probRange: [0.1, 0.2],
      highlights: ["Defensible niche", "Strong network effects", "Clear expansion path"],
      risks: ["Niche may be too small", "Slow to expand beyond vertical", "Dependence on one market"],
    },
  ],
  productivity: [
    {
      name: "Meeting-to-memory",
      thesis: "Capture meetings, turn them into searchable memory. Land in teams, expand to orgs.",
      milestones: [
        { month: 1, title: "Target developers + PMs", description: "Power users who take too many notes." },
        { month: 3, title: "Integrate Slack + Zoom", description: "Auto-join every meeting. Summarize in-channel." },
        { month: 6, title: "Team features ship", description: "Shared workspaces, action items, follow-ups." },
        { month: 9, title: "1,000 teams active", description: "Mostly dev shops and agencies." },
        { month: 12, title: "Enterprise pivot", description: "First 100-seat deals. Security review queue builds." },
        { month: 18, title: "$200k MRR · enterprise-led", description: "8 enterprise logos, 2,000 small teams." },
      ],
      arrRange: [1_800_000, 3_600_000],
      probRange: [0.12, 0.22],
      highlights: ["Natural virality in meetings", "High retention once embedded", "Clear enterprise motion"],
      risks: ["Crowded market", "Zoom/Google could build it", "Privacy concerns in enterprise"],
    },
    {
      name: "Consumer-first productivity",
      thesis: "Win individuals with a delightful free tool, convert to paid, B2C→B2B.",
      milestones: [
        { month: 1, title: "Launch beautiful free app", description: "Single-purpose. One job, done better than anyone." },
        { month: 3, title: "TikTok / Reels push", description: "Short-form content showing the magic." },
        { month: 6, title: "100k users", description: "Mostly students and freelancers." },
        { month: 9, title: "Paid tier at $6/mo", description: "Unlimited storage + advanced features." },
        { month: 12, title: "500k users, 3% conversion", description: "$360k ARR. Slow but real." },
        { month: 18, title: "Team plan launches", description: "Pivot motion to B2B. Faster growth." },
      ],
      arrRange: [600_000, 1_400_000],
      probRange: [0.05, 0.1],
      highlights: ["Low CAC via social", "Strong brand potential", "Optionality to go B2B"],
      risks: ["Slow monetization", "Consumer churn is brutal", "Hard to predict growth"],
    },
  ],
  consumer: [
    {
      name: "Viral consumer play",
      thesis: "Ship something delightful. Ride social. Monetize late.",
      milestones: [
        { month: 1, title: "Launch to 1,000 beta users", description: "Invite-only. Scarcity drives demand." },
        { month: 3, title: "Short-form content explodes", description: "One creator posts, it hits 2M views." },
        { month: 6, title: "100k MAU", description: "Retention is the bottleneck. 25% D30." },
        { month: 9, title: "Paid tier: $8/mo", description: "Unlock premium features. 2% conversion." },
        { month: 12, title: "1M MAU, $50k MRR", description: "Growing but monetization is an open question." },
        { month: 18, title: "Ad-supported + premium", description: "Hybrid model. $200k MRR." },
      ],
      arrRange: [1_200_000, 3_000_000],
      probRange: [0.04, 0.1],
      highlights: ["Potential for massive scale", "Strong brand leverage", "Multiple monetization paths"],
      risks: ["Retention is the killer", "Monetization is uncertain", "Algorithm changes sink you"],
    },
  ],
  "b2b-saas": [
    {
      name: "Bottom-up SaaS",
      thesis: "Free tier drives adoption. Team conversion drives revenue. Enterprise closes the round.",
      milestones: [
        { month: 1, title: "Generous free tier", description: "Let individuals use it without talking to anyone." },
        { month: 3, title: "Team features emerge", description: "Sharing, permissions, integrations." },
        { month: 6, title: "First paid teams", description: "$50/team/mo. 100 teams in." },
        { month: 9, title: "Sales team hired", description: "First two AEs target mid-market." },
        { month: 12, title: "Enterprise pilot", description: "5 enterprise deals in motion." },
        { month: 18, title: "$180k MRR", description: "Mix of SMB, mid-market, enterprise." },
      ],
      arrRange: [1_500_000, 2_800_000],
      probRange: [0.1, 0.18],
      highlights: ["Proven motion", "Predictable growth", "Multiple expansion levers"],
      risks: ["Competitive category", "Slow enterprise sales", "High CAC at mid-market"],
    },
    {
      name: "Top-down enterprise",
      thesis: "Land one big logo. Expand inside it. Repeat.",
      milestones: [
        { month: 1, title: "Founder-led sales", description: "Close 2 pilot customers at $5k/mo each." },
        { month: 3, title: "Deliver massive value", description: "White-glove onboarding. Over-deliver." },
        { month: 6, title: "First expansion deal", description: "Pilot customer buys 10x seats." },
        { month: 9, title: "Case study ships", description: "The pilot becomes the proof." },
        { month: 12, title: "5 enterprise logos", description: "$50k/mo each. $600k ARR." },
        { month: 18, title: "20 enterprise logos", description: "$100k/mo each. $1.2M ARR." },
      ],
      arrRange: [1_000_000, 2_000_000],
      probRange: [0.08, 0.15],
      highlights: ["High ACV", "Strong retention", "Predictable revenue"],
      risks: ["Slow sales cycles", "High support burden", "Key-person dependency"],
    },
  ],
  marketplace: [
    {
      name: "Supply-first marketplace",
      thesis: "Subsidize supply side to build liquidity. Take rate follows.",
      milestones: [
        { month: 1, title: "Recruit 100 suppliers", description: "Pay them to list. Guarantee first jobs." },
        { month: 3, title: "Solve the chicken-egg", description: "Subsidize demand with discounts." },
        { month: 6, title: "First organic matches", description: "Supply meets demand without subsidy." },
        { month: 9, title: "Liquidity achieved", description: "90% of jobs fill within 24 hours." },
        { month: 12, title: "Take rate at 15%", description: "Marketplace economics start working." },
        { month: 18, title: "$100k/mo GMV", description: "Network effects kick in. Unit economics positive." },
      ],
      arrRange: [800_000, 2_000_000],
      probRange: [0.05, 0.12],
      highlights: ["Massive TAM", "Network effects", "High exit multiples"],
      risks: ["Capital-intensive", "Liquidity is hard", "Incumbents have data"],
    },
  ],
  fintech: [
    {
      name: "Vertical fintech",
      thesis: "Pick one underserved segment. Own their money flow.",
      milestones: [
        { month: 1, title: "Pick a niche", description: "Freelancers, dental offices, or restaurants." },
        { month: 3, title: "Embedded banking", description: "Checking + invoicing in one place." },
        { month: 6, title: "Lending product", description: "Offer working capital against receivables." },
        { month: 9, title: "1,000 customers", description: "All in the same vertical." },
        { month: 12, title: "10% attach rate on lending", description: "Revenue jumps. NPLs manageable." },
        { month: 18, title: "$2.5M revenue", description: "Mix of interchange, lending, SaaS." },
      ],
      arrRange: [1_800_000, 3_500_000],
      probRange: [0.08, 0.16],
      highlights: ["High LTV", "Regulatory moat", "Multiple revenue streams"],
      risks: ["Regulatory risk", "Capital intensive", "Credit risk"],
    },
  ],
  health: [
    {
      name: "Clinical AI workflow",
      thesis: "Embed in clinical workflow. Get reimbursement. Scale through practices.",
      milestones: [
        { month: 1, title: "5 pilot clinics", description: "Offer free for 90 days in exchange for data." },
        { month: 3, title: "HIPAA + SOC 2", description: "Compliance is the table stakes." },
        { month: 6, title: "CPT code secured", description: "Clinics can bill for using the tool." },
        { month: 9, title: "50 paying clinics", description: "$800/mo each. Revenue starts." },
        { month: 12, title: "Health system pilot", description: "One 200-provider system signs." },
        { month: 18, title: "$2.4M ARR", description: "Mix of clinics and health systems." },
      ],
      arrRange: [1_800_000, 3_200_000],
      probRange: [0.08, 0.16],
      highlights: ["Reimbursement-backed", "Sticky workflow", "High switching costs"],
      risks: ["Long sales cycles", "Regulatory burden", "Clinical validation required"],
    },
  ],
};

// ---- Main simulator ----

export function simulate(idea: string): SimulationResult {
  const hash = hashString(idea);
  const rng = mulberry32(hash);
  const { category, label } = categorize(idea);

  // Pick paths for this category
  const categoryPaths = PATHS[category] ?? PATHS["b2b-saas"];

  // Shuffle + pick best (by probability-weighted expected value)
  const shuffled = [...categoryPaths].sort(() => rng() - 0.5);
  const withStats = shuffled.map((p, i) => {
    const arr = p.arrRange[0] + rng() * (p.arrRange[1] - p.arrRange[0]);
    const probability = p.probRange[0] + rng() * (p.probRange[1] - p.probRange[0]);
    const monthsToPmf = 6 + Math.floor(rng() * 8);
    const cac = 400 + Math.floor(rng() * 2000);
    const ltv = 8000 + Math.floor(rng() * 20000);
    const burn = 40000 + Math.floor(rng() * 80000);
    return {
      ...p,
      id: `0x${(hash + i * 7).toString(16).padStart(4, "0").slice(-4)}`,
      arr: Math.round(arr / 100000) * 100000,
      probability: Math.round(probability * 1000) / 1000,
      monthsToPmf,
      cac,
      ltv,
      burn,
      ev: arr * probability,
    };
  });

  // Best = highest expected value
  withStats.sort((a, b) => b.ev - a.ev);
  const best = withStats[0];
  const alternatives = withStats.slice(1, 4);

  // Best branch id
  const bestBranchId = `0x${(hash % 65536).toString(16).padStart(4, "0")}`;

  return {
    idea,
    category,
    categoryLabel: label,
    bestPath: best,
    alternatives,
    totalPaths: 1000,
    pathsEvaluated: 1000,
    bestBranchId,
  };
}

export function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

export function formatPercent(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}
