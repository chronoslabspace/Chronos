/**
 * Error monitoring scaffold for public beta.
 *
 * - Always safe: never throws, never blocks UX
 * - Console-first for the client bundle; server-side Sentry wiring is a roadmap hook.
 * - VITE_SENTRY_DSN is intentionally not imported here so missing optional SDKs cannot
 *   break production builds.
 */

type Severity = "fatal" | "error" | "warning" | "info";

type CaptureContext = {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  level?: Severity;
};

let initAttempted = false;

function readDsn(): string | undefined {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  return typeof dsn === "string" && dsn.trim() ? dsn.trim() : undefined;
}

/** Call once at app boot (main.tsx). */
export async function initErrorMonitoring(): Promise<void> {
  if (initAttempted) return;
  initAttempted = true;

  const dsn = readDsn();
  if (!dsn) {
    if (import.meta.env.DEV) {
      console.info("[chronos] error monitoring: no VITE_SENTRY_DSN — console only");
    }
    return;
  }

  console.info(
    "[chronos] error monitoring: VITE_SENTRY_DSN configured; client SDK integration is disabled in this build",
    { environment: import.meta.env.MODE, dsnConfigured: Boolean(dsn) }
  );
}

export function captureException(
  error: unknown,
  context: CaptureContext = {}
): void {
  try {
    console.error("[chronos]", error, context.extra ?? "");
  } catch {
    /* never throw from monitoring */
  }
}

export function captureMessage(
  message: string,
  context: CaptureContext = {}
): void {
  try {
    console[context.level === "warning" ? "warn" : "error"]("[chronos]", message);
  } catch {
    /* never throw from monitoring */
  }
}

export function isErrorMonitoringEnabled(): boolean {
  return false;
}
