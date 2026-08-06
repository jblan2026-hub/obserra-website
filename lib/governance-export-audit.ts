import "server-only";

export type GovernanceExportAuditRecord = {
  operationId: string;
  actorId: string;
  organizationId: string | null;
  exportType: "pdf-download" | "excel-download" | "email-pdf" | "email-excel";
  frameworkScope: string[];
  recipientDomain: string | null;
  requestedAt: string;
  outcome: "completed" | "failed";
  reason: string;
};

function configuration() {
  const baseUrl = process.env.OBSERRA_CONTROL_PLANE_STORE_URL?.trim().replace(/\/$/, "") || null;
  const token = process.env.OBSERRA_CONTROL_PLANE_STORE_TOKEN?.trim() || null;
  return { baseUrl, token, configured: Boolean(baseUrl && token) };
}

export async function recordGovernanceExport(record: GovernanceExportAuditRecord) {
  const config = configuration();
  if (!config.configured || !config.baseUrl || !config.token) {
    throw new Error("Governance export audit persistence is not configured");
  }
  if (!record.operationId || record.operationId.length > 200) throw new Error("Invalid governance export operation identifier");
  if (!record.actorId || !record.reason.trim()) throw new Error("Governance export actor and reason are required");

  const response = await fetch(`${config.baseUrl}/v1/governance-export-events/${encodeURIComponent(record.operationId)}`, {
    method: "PUT",
    cache: "no-store",
    signal: AbortSignal.timeout(3_000),
    headers: {
      authorization: `Bearer ${config.token}`,
      "content-type": "application/json",
      "idempotency-key": record.operationId,
    },
    body: JSON.stringify(record),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Governance export audit request failed with ${response.status}: ${detail.slice(0, 200)}`);
  }
}

export function governanceExportAuditHealth() {
  const config = configuration();
  return { configured: config.configured, durable: true, idempotent: true, timeoutMs: 3_000, failClosed: true };
}
