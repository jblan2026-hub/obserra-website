import type { SecurityAuditEvent, SecurityAuditSink } from "./securityAuditEvents";

export type SecurityEventEnvelope = Readonly<{
  event: SecurityAuditEvent;
  publishedAt: string;
  schemaVersion: 1;
  source: string;
  partitionKey: string;
}>;

export type SecurityEventHandler = (envelope: SecurityEventEnvelope) => Promise<void>;

export interface SecurityEventPublisher {
  publish(event: SecurityAuditEvent): Promise<void>;
}

export interface SecurityEventSubscription {
  unsubscribe(): void;
}

export interface SecurityEventBus extends SecurityEventPublisher {
  subscribe(eventType: SecurityAuditEvent["eventType"] | "*", handler: SecurityEventHandler): SecurityEventSubscription;
}

export interface DeadLetterRecord {
  envelope: SecurityEventEnvelope;
  failedAt: string;
  handlerName: string;
  reason: string;
  attempts: number;
}

export interface DeadLetterSink {
  append(record: DeadLetterRecord): Promise<void>;
}

export class InMemoryDeadLetterSink implements DeadLetterSink {
  private readonly records: DeadLetterRecord[] = [];

  async append(record: DeadLetterRecord): Promise<void> {
    this.records.push(Object.freeze({ ...record }));
  }

  list(): readonly DeadLetterRecord[] {
    return Object.freeze([...this.records]);
  }
}

export class InMemorySecurityEventBus implements SecurityEventBus {
  private readonly subscriptions = new Map<string, Set<SecurityEventHandler>>();

  constructor(
    private readonly auditSink?: SecurityAuditSink,
    private readonly deadLetterSink: DeadLetterSink = new InMemoryDeadLetterSink(),
  ) {}

  subscribe(eventType: SecurityAuditEvent["eventType"] | "*", handler: SecurityEventHandler): SecurityEventSubscription {
    const handlers = this.subscriptions.get(eventType) ?? new Set<SecurityEventHandler>();
    handlers.add(handler);
    this.subscriptions.set(eventType, handlers);
    return { unsubscribe: () => handlers.delete(handler) };
  }

  async publish(event: SecurityAuditEvent): Promise<void> {
    const envelope: SecurityEventEnvelope = Object.freeze({
      event,
      publishedAt: new Date().toISOString(),
      schemaVersion: 1,
      source: "obserra.customer-portal",
      partitionKey: event.actor.tenantId ?? event.correlationId,
    });

    if (this.auditSink) await this.auditSink.append(event);

    const handlers = [
      ...(this.subscriptions.get(event.eventType) ?? []),
      ...(this.subscriptions.get("*") ?? []),
    ];

    await Promise.all(handlers.map(async (handler) => {
      try {
        await handler(envelope);
      } catch (error) {
        await this.deadLetterSink.append({
          envelope,
          failedAt: new Date().toISOString(),
          handlerName: handler.name || "anonymous-security-handler",
          reason: error instanceof Error ? error.message : "Unknown subscriber failure",
          attempts: 1,
        });
      }
    }));
  }
}

export class AuditRepositorySubscriber {
  constructor(private readonly sink: SecurityAuditSink) {}

  handle = async (envelope: SecurityEventEnvelope): Promise<void> => {
    await this.sink.append(envelope.event);
  };
}
