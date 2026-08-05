import type { SecurityAuditEvent, SecurityAuditSink } from "./securityAuditEvents";

export type AuditRetentionClass = "standard" | "regulated" | "legal-hold";

export type AuditIntegrityRecord = Readonly<{
  sequence: number;
  event: SecurityAuditEvent;
  previousHash: string;
  recordHash: string;
  retentionClass: AuditRetentionClass;
  retainUntil?: string;
  legalHold: boolean;
}>;

export type AuditQuery = {
  tenantId?: string;
  subjectId?: string;
  correlationId?: string;
  eventTypes?: SecurityAuditEvent["eventType"][];
  outcomes?: SecurityAuditEvent["outcome"][];
  occurredFrom?: string;
  occurredTo?: string;
  limit?: number;
};

export type AuditExportRequest = {
  requestedBy: string;
  tenantId: string;
  purpose: string;
  query: AuditQuery;
};

export interface SecurityAuditRepository extends SecurityAuditSink {
  query(request: AuditQuery): Promise<readonly AuditIntegrityRecord[]>;
  verifyIntegrity(): Promise<{ valid: boolean; checkedRecords: number; failedSequence?: number }>;
  export(request: AuditExportRequest): Promise<readonly AuditIntegrityRecord[]>;
}

export interface AuditRetentionPolicy {
  classify(event: SecurityAuditEvent): AuditRetentionClass;
  retainUntil(event: SecurityAuditEvent, retentionClass: AuditRetentionClass): string | undefined;
}

export const defaultAuditRetentionPolicy: AuditRetentionPolicy = {
  classify(event) {
    if (event.eventType.startsWith("authentication.") || event.eventType.startsWith("authorization.")) {
      return "regulated";
    }
    return "standard";
  },
  retainUntil(event, retentionClass) {
    if (retentionClass === "legal-hold") return undefined;
    const years = retentionClass === "regulated" ? 7 : 3;
    const until = new Date(event.occurredAt);
    until.setUTCFullYear(until.getUTCFullYear() + years);
    return until.toISOString();
  },
};

function canonicalize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalize(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export class InMemoryAppendOnlyAuditRepository implements SecurityAuditRepository {
  private readonly records: AuditIntegrityRecord[] = [];

  constructor(private readonly retentionPolicy: AuditRetentionPolicy = defaultAuditRetentionPolicy) {}

  async append(event: SecurityAuditEvent): Promise<void> {
    const previousHash = this.records.at(-1)?.recordHash ?? "GENESIS";
    const retentionClass = this.retentionPolicy.classify(event);
    const sequence = this.records.length + 1;
    const payload = { sequence, event, previousHash, retentionClass };
    const recordHash = await sha256(canonicalize(payload));

    this.records.push(Object.freeze({
      sequence,
      event,
      previousHash,
      recordHash,
      retentionClass,
      retainUntil: this.retentionPolicy.retainUntil(event, retentionClass),
      legalHold: retentionClass === "legal-hold",
    }));
  }

  async query(request: AuditQuery): Promise<readonly AuditIntegrityRecord[]> {
    const limit = Math.min(Math.max(request.limit ?? 100, 1), 1000);
    return Object.freeze(this.records.filter((record) => {
      const event = record.event;
      if (request.tenantId && event.actor.tenantId !== request.tenantId) return false;
      if (request.subjectId && event.actor.subjectId !== request.subjectId) return false;
      if (request.correlationId && event.correlationId !== request.correlationId) return false;
      if (request.eventTypes?.length && !request.eventTypes.includes(event.eventType)) return false;
      if (request.outcomes?.length && !request.outcomes.includes(event.outcome)) return false;
      if (request.occurredFrom && event.occurredAt < request.occurredFrom) return false;
      if (request.occurredTo && event.occurredAt > request.occurredTo) return false;
      return true;
    }).slice(-limit));
  }

  async verifyIntegrity(): Promise<{ valid: boolean; checkedRecords: number; failedSequence?: number }> {
    let previousHash = "GENESIS";
    for (const record of this.records) {
      const expected = await sha256(canonicalize({
        sequence: record.sequence,
        event: record.event,
        previousHash,
        retentionClass: record.retentionClass,
      }));
      if (record.previousHash !== previousHash || record.recordHash !== expected) {
        return { valid: false, checkedRecords: record.sequence, failedSequence: record.sequence };
      }
      previousHash = record.recordHash;
    }
    return { valid: true, checkedRecords: this.records.length };
  }

  async export(request: AuditExportRequest): Promise<readonly AuditIntegrityRecord[]> {
    if (!request.requestedBy || !request.tenantId || !request.purpose.trim()) {
      throw new Error("Audit exports require requester, tenant, and documented purpose");
    }
    return this.query({ ...request.query, tenantId: request.tenantId, limit: request.query.limit ?? 1000 });
  }
}
