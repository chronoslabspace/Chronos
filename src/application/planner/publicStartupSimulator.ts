import type { SimulationResult } from "../../domain/chronos/startup-sim";
import { MemorySimulationCache } from "../../infrastructure/cache";
import { StartupSimulationService } from "./StartupSimulationService";

/**
 * Shared browser-level simulator service. Reusing one cache means the landing
 * demo and full simulator return the same cached result for identical inputs.
 */
export const publicStartupSimulator = new StartupSimulationService(
  new MemorySimulationCache<SimulationResult>()
);

export function createPublicStartupRequest(prompt: string) {
  return {
    prompt,
    workspaceId: "public-startup-simulator",
    modelVersion: "startup-simulator-v1",
    configuration: {
      futureCount: 1000,
      horizonMonths: 18,
      ranking: "expected-arr",
    },
  };
}