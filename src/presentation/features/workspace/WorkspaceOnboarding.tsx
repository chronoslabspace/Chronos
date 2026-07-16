import { useMemo, useState } from "react";
import {
  prepareImportUrl,
  prepareUploadFile,
} from "../../../application/workspace/KnowledgeImport";
import {
  ONBOARDING_STEPS,
  onboardingStepIndex,
  requiredOnboardingStep,
  type OnboardingStepId,
} from "../../../domain/workspace/onboarding";
import { useWorkspace } from "./WorkspaceContext";

/**
 * Mandatory first-run product path. No skipping.
 *
 * Create Workspace → Name → Current Goal → Upload Context → Dashboard
 *
 * Frames Chronos around "What am I working on?" not "What do you want to ask?"
 */
export function WorkspaceOnboarding() {
  const { home, createWorkspace, setGoal, addKnowledge, addNote, error } = useWorkspace();

  const required = requiredOnboardingStep(home);

  // Local UI step for welcome → name before anything is persisted
  const [localStep, setLocalStep] = useState<"welcome" | "name">("welcome");
  const [name, setName] = useState("Chronos Lab");
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Context step state
  const [contextMode, setContextMode] = useState<"upload" | "url" | "note">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("https://");
  const [noteTitle, setNoteTitle] = useState("Decision context");
  const [noteBody, setNoteBody] = useState("");

  const activeStep: OnboardingStepId = useMemo(() => {
    if (!required) return "dashboard";
    if (required === "welcome") return localStep === "name" ? "name" : "welcome";
    return required;
  }, [required, localStep]);

  const displayError = localError || error;

  const submitName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setLocalError("Workspace name is required.");
      return;
    }
    setBusy(true);
    setLocalError(null);
    try {
      await createWorkspace(trimmed);
    } catch (err) {
      const msg = (err as Error).message || "Could not create workspace.";
      setLocalError(
        /not signed in/i.test(msg)
          ? "Your session expired or is not ready. Go to Sign in, then try again."
          : msg
      );
    } finally {
      setBusy(false);
    }
  };

  const submitGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = goalTitle.trim();
    if (!trimmed) {
      setLocalError("Current goal is required — what decision are you working on?");
      return;
    }
    setBusy(true);
    setLocalError(null);
    try {
      await setGoal(trimmed, goalDescription);
    } catch (err) {
      setLocalError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const submitContext = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setLocalError(null);
    try {
      if (contextMode === "upload") {
        if (!file) {
          setLocalError("Choose a PDF, Markdown, or TXT file.");
          return;
        }
        const prepared = await prepareUploadFile(file);
        await addKnowledge(prepared);
      } else if (contextMode === "url") {
        const prepared = await prepareImportUrl(url);
        await addKnowledge(prepared);
      } else {
        if (!noteTitle.trim() || !noteBody.trim()) {
          setLocalError("Note title and content are required.");
          return;
        }
        await addNote(noteTitle.trim(), noteBody.trim());
      }
    } catch (err) {
      setLocalError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <OnboardingRail active={activeStep} />

      <div className="mt-8">
        {activeStep === "welcome" && (
          <section>
            <Eyebrow>Step 1 of 4</Eyebrow>
            <h1 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">Create Workspace</h1>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-dim">
              Chronos does not ask{" "}
              <span className="italic text-ink-faint">“What do you want to ask?”</span>
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink">
              It asks:{" "}
              <span className="font-medium text-chronos">What am I working on?</span>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-dim">
              Every user starts here. Name a workspace, set the decision in focus, upload
              context — then the dashboard tracks that work. No skipping.
            </p>
            <button
              type="button"
              onClick={() => setLocalStep("name")}
              className="mt-8 w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-bg transition hover:bg-chronos"
            >
              Begin →
            </button>
          </section>
        )}

        {activeStep === "name" && (
          <section>
            <Eyebrow>Step 2 of 4 · Workspace name</Eyebrow>
            <h1 className="mt-3 font-serif text-3xl text-ink">Name this workspace</h1>
            <p className="mt-3 text-sm text-ink-dim">
              A workspace is the HQ for one decision stream — goals, context, and futures.
            </p>
            <form onSubmit={submitName} className="mt-8 space-y-4">
              <Field
                id="ws-name"
                label="Workspace name"
                value={name}
                onChange={setName}
                placeholder="Chronos Lab"
                autoFocus
              />
              <button
                type="submit"
                disabled={busy || !name.trim()}
                className="w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-bg transition hover:bg-chronos disabled:opacity-50"
              >
                {busy ? "Creating…" : "Continue →"}
              </button>
              {!home && (
                <button
                  type="button"
                  onClick={() => setLocalStep("welcome")}
                  className="w-full py-2 text-sm text-ink-faint hover:text-ink-dim"
                >
                  ← Back
                </button>
              )}
              {displayError && <p className="text-sm text-red-400">{displayError}</p>}
            </form>
          </section>
        )}

        {activeStep === "goal" && (
          <section>
            <Eyebrow>
              Step 3 of 4 · {home?.workspace.name ?? "Workspace"}
            </Eyebrow>
            <h1 className="mt-3 font-serif text-3xl text-ink">Current goal</h1>
            <p className="mt-3 text-sm text-ink-dim">
              What decision are you working on? Everything in this workspace revolves around it.
            </p>
            <form onSubmit={submitGoal} className="mt-8 space-y-4">
              <Field
                id="goal-title"
                label="Decision / goal"
                value={goalTitle}
                onChange={setGoalTitle}
                placeholder="Launch CLAB on Kickstart"
                autoFocus
              />
              <div>
                <label htmlFor="goal-desc" className="block text-sm font-medium text-ink">
                  What does done look like?{" "}
                  <span className="text-ink-faint">(optional)</span>
                </label>
                <textarea
                  id="goal-desc"
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-chronos focus:outline-none"
                  placeholder="Ship a public launch with a clear best path"
                />
              </div>
              <button
                type="submit"
                disabled={busy || !goalTitle.trim()}
                className="w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-bg transition hover:bg-chronos disabled:opacity-50"
              >
                {busy ? "Saving…" : "Continue →"}
              </button>
              {displayError && <p className="text-sm text-red-400">{displayError}</p>}
            </form>
          </section>
        )}

        {activeStep === "context" && (
          <section>
            <Eyebrow>Step 4 of 4 · Upload context</Eyebrow>
            <h1 className="mt-3 font-serif text-3xl text-ink">Upload context</h1>
            <p className="mt-3 text-sm text-ink-dim">
              Simulations need evidence. Add at least one doc, URL, or note before the
              dashboard unlocks.
            </p>
            {home?.goal && (
              <p className="mt-4 rounded-xl border border-line bg-bg-soft/25 px-4 py-3 text-sm text-ink">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                  Working on
                </span>
                <span className="mt-1 block font-serif text-lg">{home.goal.title}</span>
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {(
                [
                  ["upload", "File"],
                  ["url", "URL"],
                  ["note", "Note"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setContextMode(id);
                    setLocalError(null);
                  }}
                  className={`rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition ${
                    contextMode === id
                      ? "bg-chronos/20 text-chronos"
                      : "border border-line text-ink-faint hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={submitContext} className="mt-6 space-y-4">
              {contextMode === "upload" && (
                <div>
                  <label htmlFor="ctx-file" className="block text-sm font-medium text-ink">
                    PDF · Markdown · TXT
                  </label>
                  <input
                    id="ctx-file"
                    type="file"
                    accept=".pdf,.md,.markdown,.txt,text/plain,application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="mt-2 block w-full text-sm text-ink-dim file:mr-3 file:rounded-full file:border-0 file:bg-chronos/15 file:px-4 file:py-2 file:text-sm file:text-chronos"
                  />
                </div>
              )}

              {contextMode === "url" && (
                <Field
                  id="ctx-url"
                  label="Website or GitHub README"
                  value={url}
                  onChange={setUrl}
                  placeholder="https://chronoslab.space"
                />
              )}

              {contextMode === "note" && (
                <>
                  <Field
                    id="ctx-note-title"
                    label="Note title"
                    value={noteTitle}
                    onChange={setNoteTitle}
                    placeholder="Constraints"
                  />
                  <div>
                    <label htmlFor="ctx-note-body" className="block text-sm font-medium text-ink">
                      Note
                    </label>
                    <textarea
                      id="ctx-note-body"
                      value={noteBody}
                      onChange={(e) => setNoteBody(e.target.value)}
                      rows={5}
                      required
                      className="mt-2 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-chronos focus:outline-none"
                      placeholder="Facts, constraints, and assumptions for this decision…"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-bg transition hover:bg-chronos disabled:opacity-50"
              >
                {busy ? "Adding…" : "Add context & open dashboard →"}
              </button>
              {displayError && <p className="text-sm text-red-400">{displayError}</p>}
            </form>
          </section>
        )}
      </div>
    </div>
  );
}

function OnboardingRail({ active }: { active: OnboardingStepId }) {
  const activeIdx = onboardingStepIndex(active === "name" ? "name" : active);

  return (
    <nav aria-label="Onboarding progress">
      <ol className="flex flex-wrap items-center gap-1.5">
        {ONBOARDING_STEPS.map((step) => {
          const done = step.index < activeIdx || active === "dashboard";
          const isActive = step.id === active;

          return (
            <li key={step.id} className="flex items-center gap-1.5">
              {step.index > 0 && (
                <span className="mx-0.5 text-ink-faint" aria-hidden>
                  →
                </span>
              )}
              <span
                className={`rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] ${
                  isActive
                    ? "bg-chronos/20 text-chronos"
                    : done
                      ? "text-chronos/70"
                      : "text-ink-faint"
                }`}
                aria-current={isActive ? "step" : undefined}
              >
                {done && !isActive ? "✓ " : ""}
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
        Required path · no skipping
      </p>
    </nav>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-chronos">{children}</div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-sm text-ink focus:border-chronos focus:outline-none"
      />
    </div>
  );
}
