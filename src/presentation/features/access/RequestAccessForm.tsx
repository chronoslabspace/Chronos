import { useState } from "react";
import { accessRequestRepository } from "../../../infrastructure/repositories";
import { analyticsQueries } from "../../../infrastructure/queries";

type RequestAccessFormProps = {
  source: string;
  onSuccess?: () => void;
  compact?: boolean;
};

/**
 * Qualification form for private Chronos access. A temporal compute platform
 * needs the deployment context, not just an email address.
 */
export function RequestAccessForm({
  source,
  onSuccess,
  compact = false,
}: RequestAccessFormProps) {
  const [email, setEmail] = useState("");
  const [identity, setIdentity] = useState("");
  const [agentProject, setAgentProject] = useState("");
  const [chronosMotivation, setChronosMotivation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const clearError = () => {
    if (error) setError("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await accessRequestRepository.submit({
      email,
      identity,
      agentProject,
      chronosMotivation,
      source,
    });

    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    void analyticsQueries.track({
      event: "access_submitted",
      properties: { source, qualified: true },
    });
    setSubmitted(true);
    onSuccess?.();
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-chronos/35 bg-chronos/10 p-5 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-chronos">
          Request received
        </div>
        <p className="mt-3 text-[13px] leading-[1.65] text-ink-dim">
          We received your Chronos access request for <span className="text-ink">{identity}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-3" : "space-y-4"}>
      <div className={compact ? "grid gap-3" : "grid gap-4 sm:grid-cols-2"}>
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            Email address
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => { setEmail(event.target.value); clearError(); }}
            placeholder="you@company.com"
            autoComplete="email"
            required
            className="mt-2 w-full rounded-lg border border-line bg-bg px-4 py-3 font-mono text-[13px] text-ink placeholder:text-ink-faint focus:border-chronos/60 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            Name or organization
          </span>
          <input
            value={identity}
            onChange={(event) => { setIdentity(event.target.value); clearError(); }}
            placeholder="Acme Labs or your name"
            autoComplete="organization"
            required
            className="mt-2 w-full rounded-lg border border-line bg-bg px-4 py-3 font-mono text-[13px] text-ink placeholder:text-ink-faint focus:border-chronos/60 focus:outline-none"
          />
        </label>
      </div>

      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          What are you building with AI agents?
        </span>
        <textarea
          value={agentProject}
          onChange={(event) => { setAgentProject(event.target.value); clearError(); }}
          placeholder="Describe the workflow, product, or decision system you are building."
          required
          rows={compact ? 2 : 3}
          className="mt-2 w-full resize-y rounded-lg border border-line bg-bg px-4 py-3 text-[13px] leading-[1.6] text-ink placeholder:text-ink-faint focus:border-chronos/60 focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          Why does Chronos matter for it?
        </span>
        <textarea
          value={chronosMotivation}
          onChange={(event) => { setChronosMotivation(event.target.value); clearError(); }}
          placeholder="Tell us where simulating futures would change the decision quality."
          required
          rows={compact ? 2 : 3}
          className="mt-2 w-full resize-y rounded-lg border border-line bg-bg px-4 py-3 text-[13px] leading-[1.6] text-ink placeholder:text-ink-faint focus:border-chronos/60 focus:outline-none"
        />
      </label>

      {error && (
        <p className="rounded-md border border-line bg-bg px-3 py-2 font-mono text-[11px] text-ink-dim">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-[13px] font-medium text-bg transition hover:bg-chronos disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Request access"}
        {!submitting && (
          <svg width="12" height="12" viewBox="0 0 12 12" className="transition group-hover:translate-x-0.5">
            <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </form>
  );
}