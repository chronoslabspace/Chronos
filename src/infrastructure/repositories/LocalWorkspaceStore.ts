import type { WorkspaceHome } from "../../domain/workspace/types";

const STORAGE_KEY = "chronos.workspace.v3";
const LEGACY_KEYS = ["chronos.workspace.v2", "chronos.workspace.v1"] as const;

type StoreShape = {
  byOwner: Record<string, WorkspaceHome>;
};

function emptyStore(): StoreShape {
  return { byOwner: {} };
}

function normalizeHome(home: WorkspaceHome): WorkspaceHome {
  return {
    ...home,
    workspace: {
      description: "",
      ...home.workspace,
    },
    futuresBySimulation: home.futuresBySimulation ?? {},
    timelineBySimulation: home.timelineBySimulation ?? {},
    recentSimulations: (home.recentSimulations ?? []).map((sim) => {
      const lineage = sim.lineage_id || sim.id;
      return {
        ...sim,
        result: sim.result ?? {},
        title: sim.title ?? "",
        version: typeof sim.version === "number" && sim.version > 0 ? sim.version : 1,
        lineage_id: lineage,
        parent_simulation_id: sim.parent_simulation_id ?? null,
      };
    }),
    knowledge: home.knowledge ?? [],
    notes: home.notes ?? [],
  };
}

function readStore(): StoreShape {
  if (typeof localStorage === "undefined") return emptyStore();
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const key of LEGACY_KEYS) {
        raw = localStorage.getItem(key);
        if (raw) break;
      }
    }
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as StoreShape;
    if (!parsed || typeof parsed !== "object" || !parsed.byOwner) return emptyStore();
    return parsed;
  } catch {
    return emptyStore();
  }
}

function writeStore(store: StoreShape) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

/** Browser resume store — foundation success metric requires leave/return. */
export class LocalWorkspaceStore {
  get(ownerId: string): WorkspaceHome | null {
    const home = readStore().byOwner[ownerId];
    return home ? normalizeHome(home) : null;
  }

  save(ownerId: string, home: WorkspaceHome): WorkspaceHome {
    const normalized = normalizeHome(home);
    const store = readStore();
    store.byOwner[ownerId] = normalized;
    writeStore(store);
    return normalized;
  }

  clear(ownerId: string) {
    const store = readStore();
    delete store.byOwner[ownerId];
    writeStore(store);
  }
}

export const localWorkspaceStore = new LocalWorkspaceStore();
