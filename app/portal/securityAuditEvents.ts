import type { AuthenticationAssuranceLevel } from "./identitySecurityPolicy";
import type { PortalPermission, PortalRole } from "./accessControl";

export type SecurityAuditOutcome = "success" | "denied" | "challenge" | "error";

export type SecurityAuditEventType =
  | "authentication.succeeded"
  | "authentication.failed"
  | "authentication.challenged"
  | "session.revoked"
  | "authorization.allowed"
  | "authorization.denied"
  | "tenant.context.failed"
  | "identity.provider.failed";

export type SecurityAuditActor = {
  subjectId?: string;
  tenantId?: string;
  sessionId?: string;
  roles: PortalRole[];
  authenticationAssurance?: AuthenticationAssuranceLevel;
};

export type SecurityAuditEvent = Readonly<{
  eventId: string;
  eventType: SecurityAuditEventType;
  occurredAt: string;
  correlationId: string;
  requestId: string;
  outcome: SecurityAuditOutcome;
  actor: SecurityAuditActor;
  resource?: string;
  action?: string;
  requiredPermission?: PortalPermission;
  reason: string;
  riskScore?: number;
  deviceTrusted?: boolean;
  ipAddress?: string;
  userAgent?: string;
  metadata: Readonly<Record<string, string | number | boolean | undefined>>;
}>;

export interface SecurityAuditSink {
  append(event: SecurityAuditEvent): Promise<void>;
}

export type SecurityAuditEventInput = Omit<SecurityAuditEvent, "eventId" | "occurredAt" | "metadata"> & {
  eventId?: string;
  occurredAt?: string;
  metadata?: Record<string, string | number | boolean | undefined>;
};

export function createSecurityAuditEvent(input: SecurityAuditEventInput): SecurityAuditEvent {
  const event: SecurityAuditEvent = Object.freeze({
    ...input,
    eventId: input.eventId ?? crypto.randomUUID(),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    actor: Object.freeze({ ...input.actor, roles: Object.freeze([...input.actor.roles]) }) as SecurityAuditActor,
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });

  if (!event.correlationId || !event.requestId || !event.reason) {
    throw new Error("Security audit events require correlationId, requestId, and reason");
  }

  return event;
}

export class CompositeSecurityAuditSink implements SecurityAuditSink {
  constructor(private readonly sinks: readonly SecurityAuditSink[]) {}

  async append(event: SecurityAuditEvent): Promise<void> {
    await Promise.all(this.sinks.map((sink) => sink.append(event)));
  }
}

export class InMemorySecurityAuditSink implements SecurityAuditSink {
  private readonly events: SecurityAuditEvent[] = [];

  async append(event: SecurityAuditEvent): Promise<void> {
    this.events.push(event);
  }

  list(): readonly SecurityAuditEvent[] {
    return Object.freeze([...this.events]);
  }
}
