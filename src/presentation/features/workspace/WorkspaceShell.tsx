import { useMemo, useState, type FormEvent } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { authService } from "../../../infrastructure/auth/SupabaseAuthService";
import { ChronosCMark } from "../../components/ChronosCMark";
import { WorkspaceProvider, useWorkspace } from "./WorkspaceContext";
import { WorkspaceOnboarding } from "./WorkspaceOnboarding";

type NavItem = {
  to: string;
  label: string;
  end?: boolean;
  /** Short label for mobile bottom bar */
  short: string;
};

const navItems: NavItem[] = [
  { to: "/workspace", label: "Workspace", short: "Home", end: true },
  { to: "/workspace/knowledge", label: "Knowledge", short: "Know" },
  { to: "/workspace/simulations", label: "Simulations", short: "Sims" },
  { to: "/workspace/memory", label: "Memory", short: "Mem" },
  { to: "/workspace/advisor", label: "Advisor", short: "Grok" },
  { to: "/workspace/settings", label: "Settings", short: "Set" },
];

/**
 * Product chrome: top bar (Chronos · Search · User) + desktop sidebar.
 * Mobile keeps a compact bottom nav and drawer.
 */
export function WorkspaceShell() {
  return (
    <WorkspaceProvider>
      <WorkspaceShellInner />
    </WorkspaceProvider>
  );
}

function WorkspaceShellInner() {
  const navigate = useNavigate();
  const { home, loading, ownerId } = useWorkspace();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const ready = Boolean(home?.workspace && home.goal);

  const timelineHref = useMemo(() => {
    const latest = home?.recentSimulations[0];
    return latest ? `/workspace/simulations/${latest.id}` : "/workspace/simulations";
  }, [home?.recentSimulations]);

  const sidebarItems: NavItem[] = useMemo(
    () => [
      ...navItems.slice(0, 3),
      { to: timelineHref, label: "Timeline", short: "Time" },
      ...navItems.slice(3),
    ],
    [timelineHref]
  );

  const userLabel = ownerId ? ownerId.slice(0, 8) : "You";
  const initials = userLabel.slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await authService.signOut();
    navigate("/login", { replace: true });
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/workspace/knowledge?q=${encodeURIComponent(q)}` : "/workspace/knowledge");
    setMenuOpen(false);
  };

  return (
    <div className="min-h-dvh bg-bg pb-20 md:pb-0">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-5 lg:px-6">
          <div className="flex min-w-0 items-center gap-2">
            {ready && (
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line text-ink-dim transition hover:border-line-strong hover:text-ink lg:hidden"
              >
                <span className="font-mono text-base leading-none">{menuOpen ? "×" : "☰"}</span>
              </button>
            )}
            <div className="flex min-w-0 items-center gap-2">
              <ChronosCMark size={22} className="chronos-brand-mark shrink-0" />
              <div className="min-w-0">
                <div className="font-chronos-wordmark text-[18px] leading-none text-ink sm:text-[20px]">
                  Chronos
                </div>
                <div className="mt-0.5 hidden truncate text-[11px] text-ink-dim sm:block">
                  {home ? home.workspace.name : "Workspace"}
                </div>
              </div>
            </div>
          </div>

          {ready && (
            <form
              onSubmit={handleSearch}
              className="mx-auto hidden min-w-0 flex-1 max-w-md md:block"
              role="search"
            >
              <label className="sr-only" htmlFor="workspace-search">
                Search knowledge
              </label>
              <input
                id="workspace-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search knowledge…"
                className="w-full rounded-full border border-line bg-bg-soft/30 px-4 py-2 text-sm text-ink placeholder:text-ink-faint outline-none transition focus:border-chronos/50"
              />
            </form>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            {ready && (
              <form onSubmit={handleSearch} className="md:hidden" role="search">
                <button
                  type="submit"
                  className="rounded-full border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-dim"
                >
                  Search
                </button>
              </form>
            )}
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-bg-soft/40 font-mono text-[10px] text-chronos"
              title={userLabel}
              aria-label={`Signed in as ${userLabel}`}
            >
              {initials}
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-ink-dim transition hover:text-ink sm:inline"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {ready && menuOpen && (
          <nav className="border-t border-line bg-bg lg:hidden" aria-label="Workspace menu">
            <div className="mx-auto flex max-w-6xl flex-col gap-0.5 px-3 py-2">
              {sidebarItems.map((item) => (
                <NavLink
                  key={`${item.to}-${item.label}`}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-3 text-[15px] transition ${
                      isActive
                        ? "bg-chronos/15 text-chronos"
                        : "text-ink-dim hover:bg-bg-soft/40 hover:text-ink"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <NavLink
                to="/workspace/settings"
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-3 text-[15px] text-chronos"
              >
                + New workspace
              </NavLink>
            </div>
          </nav>
        )}
      </header>

      <div className="mx-auto flex max-w-6xl">
        {/* Desktop sidebar */}
        {ready && (
          <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-52 shrink-0 border-r border-line lg:block">
            <nav className="flex h-full flex-col gap-0.5 p-3" aria-label="Workspace">
              <div className="mb-3 px-3 pt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                Navigate
              </div>
              {sidebarItems.map((item) => (
                <NavLink
                  key={`${item.to}-${item.label}`}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-[14px] transition ${
                      isActive
                        ? "bg-chronos/15 font-medium text-chronos"
                        : "text-ink-dim hover:bg-bg-soft/30 hover:text-ink"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="mt-auto border-t border-line px-3 pt-4 pb-2">
                <div className="truncate text-xs text-ink-dim">{home?.workspace.name}</div>
                <div className="mt-1 truncate font-mono text-[10px] text-ink-faint">
                  {home?.goal?.title ?? "No goal"}
                </div>
              </div>
            </nav>
          </aside>
        )}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-5 sm:py-8 lg:px-8">
          {loading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-6 w-6 rounded-full border border-chronos border-t-transparent animate-spin" />
                <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint">
                  Loading workspace
                </div>
              </div>
            </div>
          ) : !ready ? (
            <WorkspaceOnboarding />
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      {ready && (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 backdrop-blur-xl lg:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          aria-label="Workspace mobile"
        >
          <div className="mx-auto grid max-w-6xl grid-cols-5 gap-0 px-1 py-1">
            {navItems
              .filter((i) => i.to !== "/workspace/advisor")
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center rounded-lg px-1 py-2 font-mono text-[9px] uppercase tracking-[0.08em] ${
                      isActive ? "text-chronos" : "text-ink-faint"
                    }`
                  }
                >
                  {item.short}
                </NavLink>
              ))}
          </div>
        </nav>
      )}
    </div>
  );
}
