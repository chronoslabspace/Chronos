import { Link } from "react-router-dom";
import {
  deriveDecisionCard,
  type DecisionCardModel,
} from "../../../../domain/workspace/decisionCard";
import { confidencePercent } from "../../../../domain/workspace/seed";
import type { WorkspaceHome } from "../../../../domain/workspace/types";

/**
 * HQ hero — recommendation + next action.
 * Deep-link only; never commits chooseBestPath.
 */
export function DecisionCard({ home }: { home: WorkspaceHome }) {
  const card = deriveDecisionCard(home);
  return <DecisionCardView card={card} />;
}

export function DecisionCardView({ card }: { card: DecisionCardModel }) {
  const conf =
    card.confidence != null ? confidencePercent(card.confidence) : "—";

  return (
    <section
      data-testid="decision-card"
      className="rounded-2xl border border-chronos/40 bg-gradient-to-br from-chronos/15 via-bg-soft/30 to-bg p-5 sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-chronos">
            Workspace pulse
          </div>
          <p className="mt-2 text-sm text-ink-dim">
            Working on{" "}
            <span className="text-ink" data-testid="decision-card-goal">
              {card.decisionTitle}
            </span>
          </p>
        </div>
        <span
          data-testid="decision-card-status"
          className="rounded-full border border-chronos/30 bg-bg/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-chronos"
        >
          {card.statusLabel}
        </span>
      </div>

      <div className="mt-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          Recommendation
        </div>
        <h2
          data-testid="decision-card-recommendation"
          className="mt-2 font-serif text-3xl text-ink sm:text-4xl"
        >
          {card.recommendation ?? "No recommendation yet"}
          {card.recommendation ? (
            <span className="ml-2 text-chronos" aria-hidden>
              ⭐
            </span>
          ) : null}
        </h2>
        <div className="mt-4 flex flex-wrap items-baseline gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase text-ink-faint">Confidence</div>
            <div className="mt-0.5 font-mono text-3xl tabular-nums text-chronos sm:text-4xl">
              {conf}
            </div>
          </div>
        </div>
        {card.reason ? (
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-dim">{card.reason}</p>
        ) : null}
      </div>

      <div className="mt-6 border-t border-line/80 pt-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          Next action
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to={card.primaryCtaHref}
            data-testid="decision-card-cta"
            className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg transition hover:bg-chronos"
          >
            {card.primaryCtaLabel}
          </Link>
          {card.secondaryCtaLabel && card.secondaryCtaHref ? (
            <Link
              to={card.secondaryCtaHref}
              className="inline-flex rounded-full border border-line px-4 py-2.5 text-sm text-ink hover:border-chronos/50 hover:text-chronos"
            >
              {card.secondaryCtaLabel}
            </Link>
          ) : null}
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          Review evidence and alternatives before saving a path — commitment happens on the
          simulation page.
        </p>
      </div>
    </section>
  );
}
