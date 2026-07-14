import { useEffect, useState } from "react";

// A readable temporal decision tree: state -> futures -> best path.
// The phase cycle is driven by React state for reliable SVG transitions.

type Node = {
  id: string;
  x: number;
  y: number;
  parent?: string;
};

type Phase = "state" | "expand" | "prune" | "collapse" | "result";

const phaseSequence: { phase: Phase; duration: number }[] = [
  { phase: "state", duration: 900 },
  { phase: "expand", duration: 1900 },
  { phase: "prune", duration: 1500 },
  { phase: "collapse", duration: 900 },
  { phase: "result", duration: 2200 },
];

const winningNodeIds = new Set(["origin", "b", "b2"]);

const nodes: Node[] = [
  { id: "origin", x: 400, y: 76 },

  { id: "a", x: 184, y: 185, parent: "origin" },
  { id: "b", x: 400, y: 185, parent: "origin" },
  { id: "c", x: 616, y: 185, parent: "origin" },

  { id: "a1", x: 94, y: 298, parent: "a" },
  { id: "a2", x: 184, y: 298, parent: "a" },
  { id: "a3", x: 274, y: 298, parent: "a" },
  { id: "b1", x: 346, y: 298, parent: "b" },
  { id: "b2", x: 454, y: 298, parent: "b" },
  { id: "c1", x: 526, y: 298, parent: "c" },
  { id: "c2", x: 616, y: 298, parent: "c" },
  { id: "c3", x: 706, y: 298, parent: "c" },
];

const nodeById = new Map(nodes.map((node) => [node.id, node]));

function curve(from: Node, to: Node) {
  const midpointY = from.y + (to.y - from.y) * 0.52;
  return `M ${from.x} ${from.y + 13} C ${from.x} ${midpointY}, ${to.x} ${midpointY}, ${to.x} ${to.y - 13}`;
}

function isWinningEdge(parentId: string, nodeId: string) {
  return (parentId === "origin" && nodeId === "b") || (parentId === "b" && nodeId === "b2");
}

export function BranchingAnimation() {
  const [phase, setPhase] = useState<Phase>("state");

  useEffect(() => {
    let index = 0;
    let timer: number | undefined;

    const advance = () => {
      const current = phaseSequence[index];
      setPhase(current.phase);
      timer = window.setTimeout(() => {
        index = (index + 1) % phaseSequence.length;
        advance();
      }, current.duration);
    };

    advance();
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className="tree-visual relative mx-auto w-full max-w-[680px] overflow-hidden rounded-2xl border border-line bg-bg-soft/60 p-4 sm:p-6"
      data-phase={phase}
    >
      <div className="pointer-events-none absolute inset-0 line-grid opacity-30" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-chronos blink" />
          <span className="font-mono text-[10px] uppercase tracking-[0.23em] text-ink-dim">
            Temporal decision tree
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          {phase === "state" ? "current state" : "1,000 futures"}
        </span>
      </div>

      <svg
        viewBox="0 0 800 500"
        className="relative mt-3 h-auto w-full"
        aria-label="Current state branching into futures before collapsing to the best path"
      >
        <defs>
          <linearGradient id="tree-path" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c6f0ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#b79bff" stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id="tree-winner" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c6f0ff" />
            <stop offset="100%" stopColor="#ffd7a3" />
          </linearGradient>
          <radialGradient id="tree-origin" cx="0.35" cy="0.25" r="0.7">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#c6f0ff" />
            <stop offset="100%" stopColor="#6687a4" />
          </radialGradient>
          <radialGradient id="tree-win" cx="0.35" cy="0.25" r="0.7">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#ffd7a3" />
            <stop offset="100%" stopColor="#b79bff" />
          </radialGradient>
        </defs>

        <text x="400" y="22" fill="#8a93a6" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle" style={{ letterSpacing: 2 }}>
          CURRENT STATE
        </text>

        {nodes
          .filter((node) => node.parent)
          .map((node) => {
            const parent = nodeById.get(node.parent!);
            if (!parent) return null;
            const winner = isWinningEdge(node.parent!, node.id);
            return (
              <path
                key={`${node.parent}-${node.id}`}
                pathLength="1"
                d={curve(parent, node)}
                className={winner ? "tree-edge tree-edge-winner" : "tree-edge"}
                stroke={winner ? "url(#tree-winner)" : "url(#tree-path)"}
              />
            );
          })}

        {nodes.map((node) => {
          const isOrigin = node.id === "origin";
          const onWinningPath = winningNodeIds.has(node.id);
          return (
            <g
              key={node.id}
              className={`tree-node${onWinningPath ? " tree-node-winner" : ""}${isOrigin ? " tree-node-origin" : ""}`}
            >
              {onWinningPath && !isOrigin && (
                <circle cx={node.x} cy={node.y} r="24" fill="#ffd7a3" opacity="0.08" className="tree-node-halo" />
              )}
              <circle
                cx={node.x}
                cy={node.y}
                r={isOrigin ? "13" : onWinningPath ? "10" : "7"}
                fill={isOrigin ? "url(#tree-origin)" : onWinningPath ? "url(#tree-win)" : "#7b79be"}
                opacity={onWinningPath || isOrigin ? "1" : "0.72"}
              />
              {isOrigin && <circle cx={node.x} cy={node.y} r="20" fill="none" stroke="#c6f0ff" strokeWidth="0.7" opacity="0.42" />}
            </g>
          );
        })}

        {nodes
          .filter((node) => node.y === 298 && !winningNodeIds.has(node.id))
          .map((node) => (
            <g key={`prune-${node.id}`} className="tree-prune">
              <line x1={node.x - 5} y1={node.y - 5} x2={node.x + 5} y2={node.y + 5} stroke="#4a5168" strokeWidth="1.1" />
              <line x1={node.x + 5} y1={node.y - 5} x2={node.x - 5} y2={node.y + 5} stroke="#4a5168" strokeWidth="1.1" />
            </g>
          ))}

        <g className="tree-collapse">
          <path d="M454 326 L454 388" stroke="url(#tree-winner)" strokeWidth="1.5" strokeDasharray="3 4" />
          <path d="M448 382 L454 389 L460 382" stroke="#ffd7a3" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        <g className="tree-result">
          <rect x="326" y="405" width="256" height="60" rx="8" fill="#1C3E4E" stroke="#E2DDDA" strokeOpacity="0.55" />
          <circle cx="352" cy="435" r="7" fill="url(#tree-win)" />
          <text x="370" y="431" fill="#ffd7a3" fontSize="11" fontFamily="JetBrains Mono" style={{ letterSpacing: 1.4 }}>
            BEST PATH
          </text>
          <text x="370" y="448" fill="#8a93a6" fontSize="10" fontFamily="JetBrains Mono">
            branch_0x4a · score 0.942
          </text>
        </g>

        <text x="400" y="487" fill="#4a5168" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle" style={{ letterSpacing: 1.5 }}>
          1,000 FUTURES → 1 DECISION
        </text>
      </svg>
    </div>
  );
}