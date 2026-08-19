import type { ConnectorHealthState } from "./contracts";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ConnectorRow = {
  id: string;
  owner_user_id: string;
  tenant_key: string;
  connector_key: string;
  provider: string;
  display_name: string;
  base_url: string;
  allowed_hostname: string;
  activated: boolean;
  health_state: ConnectorHealthState;
  failure_count: number;
  circuit_open_until: string | null;
  last_success_at: string | null;
  last_failure_at: string | null;
  last_error_code: string | null;
  config_version: number;
  provenance: Json;
  created_at: string;
  updated_at: string;
};

export type ConnectorInsert = {
  id?: string;
  owner_user_id: string;
  tenant_key: string;
  connector_key: string;
  provider: string;
  display_name: string;
  base_url: string;
  allowed_hostname: string;
  activated?: boolean;
  health_state?: ConnectorHealthState;
  failure_count?: number;
  circuit_open_until?: string | null;
  last_success_at?: string | null;
  last_failure_at?: string | null;
  last_error_code?: string | null;
  config_version?: number;
  provenance?: Json;
  created_at?: string;
  updated_at?: string;
};

export type ConnectorUpdate = Partial<ConnectorInsert>;

export type ConnectorHealthEventRow = {
  id: number;
  connector_id: string;
  owner_user_id: string;
  tenant_key: string;
  connector_key: string;
  provider: string;
  correlation_id: string;
  health_state: ConnectorHealthState;
  failure_class: string | null;
  error_code: string | null;
  latency_ms: number | null;
  attempt_count: number;
  provider_status: number | null;
  occurred_at: string;
};

export type ConnectorHealthEventInsert = Omit<ConnectorHealthEventRow, "id"> & { id?: number };
export type ConnectorHealthEventUpdate = Partial<ConnectorHealthEventInsert>;

export type ConnectorFailureRow = {
  id: number;
  connector_id: string;
  owner_user_id: string;
  tenant_key: string;
  correlation_id: string;
  operation_key: string;
  failure_class: string;
  error_code: string;
  payload_digest: string | null;
  attempt_count: number;
  next_attempt_at: string;
  claimed_at: string | null;
  resolved_at: string | null;
  dead_lettered_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ConnectorFailureInsert = Omit<
  ConnectorFailureRow,
  "id" | "attempt_count" | "claimed_at" | "resolved_at" | "dead_lettered_at" | "created_at" | "updated_at"
> & {
  id?: number;
  attempt_count?: number;
  claimed_at?: string | null;
  resolved_at?: string | null;
  dead_lettered_at?: string | null;
  created_at?: string;
  updated_at?: string;
};
export type ConnectorFailureUpdate = Partial<ConnectorFailureInsert>;

export type ConnectorDatabase = {
  public: {
    Tables: {
      integration_connectors: {
        Row: ConnectorRow;
        Insert: ConnectorInsert;
        Update: ConnectorUpdate;
        Relationships: [];
      };
      integration_connector_health_events: {
        Row: ConnectorHealthEventRow;
        Insert: ConnectorHealthEventInsert;
        Update: ConnectorHealthEventUpdate;
        Relationships: [];
      };
      integration_connector_failures: {
        Row: ConnectorFailureRow;
        Insert: ConnectorFailureInsert;
        Update: ConnectorFailureUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      obserra_connector_store_secret: {
        Args: {
          p_connector_id: string;
          p_owner_user_id: string;
          p_tenant_key: string;
          p_secret_name: string;
          p_secret_envelope: string;
          p_encryption_key_id: string;
        };
        Returns: undefined;
      };
      obserra_connector_load_secret: {
        Args: {
          p_connector_id: string;
          p_owner_user_id: string;
          p_tenant_key: string;
          p_secret_name: string;
        };
        Returns: Array<{
          secret_envelope: string;
          encryption_key_id: string;
        }>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
