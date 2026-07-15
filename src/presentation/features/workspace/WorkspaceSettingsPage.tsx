import { useWorkspace } from "./WorkspaceContext";

/** Workspace settings — identity only for MVP. */
export function WorkspaceSettingsPage() {
  const { home } = useWorkspace();
  if (!home) return null;

  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">Settings</div>
      <h1 className="mt-2 font-serif text-3xl text-ink">Workspace</h1>
      <dl className="mt-8 space-y-4 border-y border-line py-4">
        <Row label="Name" value={home.workspace.name} />
        <Row label="Description" value={home.workspace.description || "—"} />
        <Row label="Id" value={home.workspace.id} />
        <Row label="Goal" value={home.goal?.title ?? "—"} />
        <Row label="Goal status" value={home.goal?.status ?? "—"} />
        <Row label="Priority" value={home.goal ? String(home.goal.priority) : "—"} />
        <Row label="Simulations" value={String(home.recentSimulations.length)} />
        <Row label="Knowledge" value={String(home.knowledge.length)} />
        <Row label="Notes" value={String(home.notes.length)} />
      </dl>
      <p className="mt-4 text-sm text-ink-dim">
        Progress is saved so you can return and continue. Cloud tables: workspaces, goals,
        simulations, futures, knowledge, notes, timeline_nodes.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">{label}</dt>
      <dd className="text-sm text-ink">{value}</dd>
    </div>
  );
}
