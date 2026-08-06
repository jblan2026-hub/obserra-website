import "server-only";

import { deploymentTargets, sharedPlatformCapabilities } from "./platform-topology";
import { withResilience } from "./resilience";

type HealthPayload = {
  service?: string;
  status?: "healthy" | "degraded" | "unhealthy";
  ready?: boolean;
  durationMs?: number;
  timestamp?: string;
  target?: { key?: string; projectName?: string; role?: string };
  capabilities?: string[];
  checks?: Array<{ name?: string; status?: string; detail?: string }>;
};

export type ControlRoomTargetStatus = {
  key: string;
  projectName: string;
  role: string;
  url: string | null;
  reachable: boolean;
  ready: boolean;
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  latencyMs: number;
  checkedAt: string;
  capabilityCount: number;
  identityValid: boolean;
  error?: string;
};

export type ControlRoomMonitorMode = "live" | "persistent";

type MonitorPolicy = {
  attempts: number;
  timeoutMs: number;
  baseDelayMs: number;
};

const monitorPolicies: Record<ControlRoomMonitorMode, MonitorPolicy> = {
  live: { attempts: 1, timeoutMs: 2_500, baseDelayMs: 50 },
  persistent: { attempts: 2, timeoutMs: 5_000, baseDelayMs: 150 },
};

function targetUrl(projectName: string): string | null {
  const explicit: Record<string, string | undefined> = {
    "obserra-website-live": process.env.OBSERRA_WEBSITE_LIVE_URL,
    "obserra-website-lcn2": process.env.OBSERRA_WEBSITE_LCN2_URL,
    "obserra-integrated-services": process.env.OBSERRA_INTEGRATED_SERVICES_URL,
  };
  const value = explicit[projectName];
  return value ? value.replace(/\/$/, "") : null;
}

async function checkTarget(
  target: (typeof deploymentTargets)[number],
  policy: MonitorPolicy,
): Promise<ControlRoomTargetStatus> {
  const url = targetUrl(target.projectName);
  const checkedAt = new Date().toISOString();
  if (!url) {
    return {
      key: target.key,
      projectName: target.projectName,
      role: target.role,
      url: null,
      reachable: false,
      ready: false,
      status: "unknown",
      latencyMs: 0,
      checkedAt,
      capabilityCount: 0,
      identityValid: false,
      error: "Target URL is not configured",
    };
  }

  const startedAt = Date.now();
  try {
    const result = await withResilience(
      async (signal) => {
        const response = await fetch(`${url}/api/health`, {
          cache: "no-store",
          headers: { "user-agent": "ObserraControlRoomMonitor/1.0" },
          signal,
        });
        const payload = (await response.json()) as HealthPayload;
        if (!response.ok) throw new Error(`Health returned HTTP ${response.status}`);
        return payload;
      },
      {
        operation: `control-room:${target.key}`,
        attempts: policy.attempts,
        timeoutMs: policy.timeoutMs,
        baseDelayMs: policy.baseDelayMs,
      },
    );
    const payload = result.value;
    const capabilities = payload.capabilities ?? [];
    return {
      key: target.key,
      projectName: target.projectName,
      role: target.role,
      url,
      reachable: true,
      ready: payload.ready === true,
      status: payload.status ?? "unknown",
      latencyMs: Date.now() - startedAt,
      checkedAt,
      capabilityCount: capabilities.length,
      identityValid: payload.target?.key === target.key && sharedPlatformCapabilities.every((item) => capabilities.includes(item)),
    };
  } catch (error) {
    return {
      key: target.key,
      projectName: target.projectName,
      role: target.role,
      url,
      reachable: false,
      ready: false,
      status: "unhealthy",
      latencyMs: Date.now() - startedAt,
      checkedAt,
      capabilityCount: 0,
      identityValid: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function buildControlRoomSnapshot(mode: ControlRoomMonitorMode = "live") {
  const policy = monitorPolicies[mode];
  const startedAt = Date.now();
  const targets = await Promise.all(deploymentTargets.map((target) => checkTarget(target, policy)));
  const healthy = targets.filter((item) => item.ready && item.identityValid).length;
  const unhealthy = targets.filter((item) => !item.reachable || !item.ready).length;
  const degraded = targets.length - healthy - unhealthy;
  const status = unhealthy > 0 ? "unhealthy" : degraded > 0 ? "degraded" : "healthy";

  return {
    generatedAt: new Date().toISOString(),
    status,
    mode,
    durationMs: Date.now() - startedAt,
    latencyBudgetMs: mode === "live" ? 3_500 : 11_000,
    targetCount: targets.length,
    healthy,
    degraded,
    unhealthy,
    pollRecommendationSeconds: 15,
    persistentCheckIntervalMinutes: 5,
    capabilitiesExpected: sharedPlatformCapabilities.length,
    nonBlockingCustomerPath: true,
    targets,
  };
}
