import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";
import {
  ConnectorRuntimeError,
  type ConnectorSecretContext,
} from "./contracts";

const ENVELOPE_VERSION = "v1";
const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const MAX_SECRET_BYTES = 64 * 1024;
const KEY_ID_PATTERN = /^[A-Za-z0-9_.:-]{1,64}$/;

type KeyRing = {
  activeKeyId: string;
  keys: ReadonlyMap<string, Buffer>;
};

function configurationError(message: string, code: string): never {
  throw new ConnectorRuntimeError(message, code, "configuration", 503, false);
}

function parseKeyMaterial(value: string, keyId: string) {
  let decoded: Buffer;
  try {
    decoded = Buffer.from(value.trim(), "base64url");
  } catch {
    decoded = Buffer.alloc(0);
  }
  if (decoded.length !== 32) {
    configurationError(
      `Connector encryption key ${keyId} must decode to exactly 32 bytes.`,
      "OBSERRA_CONNECTOR_ENCRYPTION_KEY_INVALID",
    );
  }
  return decoded;
}

function loadKeyRing(): KeyRing {
  const activeKeyId = process.env.OBSERRA_CONNECTOR_ENCRYPTION_KEY_ID?.trim() || "primary";
  if (!KEY_ID_PATTERN.test(activeKeyId)) {
    configurationError(
      "Connector encryption key ID is invalid.",
      "OBSERRA_CONNECTOR_ENCRYPTION_KEY_ID_INVALID",
    );
  }

  const activeKey = process.env.OBSERRA_CONNECTOR_ENCRYPTION_KEY?.trim();
  if (!activeKey) {
    configurationError(
      "Connector encrypted credential storage is not configured.",
      "OBSERRA_CONNECTOR_ENCRYPTION_KEY_MISSING",
    );
  }

  const keys = new Map<string, Buffer>();
  keys.set(activeKeyId, parseKeyMaterial(activeKey, activeKeyId));

  const historical = process.env.OBSERRA_CONNECTOR_ENCRYPTION_KEYS_JSON?.trim();
  if (historical) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(historical) as unknown;
    } catch {
      configurationError(
        "Connector encryption key ring is invalid JSON.",
        "OBSERRA_CONNECTOR_ENCRYPTION_KEYRING_INVALID",
      );
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      configurationError(
        "Connector encryption key ring must be a JSON object.",
        "OBSERRA_CONNECTOR_ENCRYPTION_KEYRING_INVALID",
      );
    }

    for (const [keyId, material] of Object.entries(parsed as Record<string, unknown>)) {
      if (!KEY_ID_PATTERN.test(keyId) || typeof material !== "string") {
        configurationError(
          "Connector encryption key ring contains an invalid entry.",
          "OBSERRA_CONNECTOR_ENCRYPTION_KEYRING_INVALID",
        );
      }
      keys.set(keyId, parseKeyMaterial(material, keyId));
    }
  }

  return { activeKeyId, keys };
}

function additionalAuthenticatedData(context: ConnectorSecretContext) {
  const tenantKey = context.tenantKey.trim();
  const connectorId = context.connectorId.trim();
  const secretName = context.secretName.trim();
  if (!tenantKey || !connectorId || !secretName) {
    throw new ConnectorRuntimeError(
      "Connector secret context is incomplete.",
      "OBSERRA_CONNECTOR_SECRET_CONTEXT_INVALID",
      "policy_denied",
      400,
      false,
    );
  }
  return Buffer.from(JSON.stringify({ tenantKey, connectorId, secretName }), "utf8");
}

export type EncryptedConnectorSecret = {
  envelope: string;
  keyId: string;
};

export function encryptConnectorSecret(
  plaintext: string,
  context: ConnectorSecretContext,
): EncryptedConnectorSecret {
  const payload = Buffer.from(plaintext, "utf8");
  if (payload.length === 0 || payload.length > MAX_SECRET_BYTES) {
    throw new ConnectorRuntimeError(
      "Connector secret size is invalid.",
      "OBSERRA_CONNECTOR_SECRET_INVALID",
      "policy_denied",
      400,
      false,
    );
  }

  const keyRing = loadKeyRing();
  const key = keyRing.keys.get(keyRing.activeKeyId);
  if (!key) {
    configurationError(
      "Active connector encryption key is unavailable.",
      "OBSERRA_CONNECTOR_ENCRYPTION_KEY_MISSING",
    );
  }

  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  cipher.setAAD(additionalAuthenticatedData(context));
  const ciphertext = Buffer.concat([cipher.update(payload), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    keyId: keyRing.activeKeyId,
    envelope: [
      ENVELOPE_VERSION,
      keyRing.activeKeyId,
      iv.toString("base64url"),
      ciphertext.toString("base64url"),
      authTag.toString("base64url"),
    ].join("."),
  };
}

export function decryptConnectorSecret(
  envelope: string,
  context: ConnectorSecretContext,
) {
  const parts = envelope.split(".");
  if (parts.length !== 5 || parts[0] !== ENVELOPE_VERSION || !KEY_ID_PATTERN.test(parts[1])) {
    throw new ConnectorRuntimeError(
      "Connector secret envelope is invalid.",
      "OBSERRA_CONNECTOR_SECRET_ENVELOPE_INVALID",
      "invalid_response",
      500,
      false,
    );
  }

  const [, keyId, ivEncoded, ciphertextEncoded, authTagEncoded] = parts;
  const key = loadKeyRing().keys.get(keyId);
  if (!key) {
    configurationError(
      "Connector secret key required for decryption is unavailable.",
      "OBSERRA_CONNECTOR_ENCRYPTION_KEY_MISSING",
    );
  }

  try {
    const iv = Buffer.from(ivEncoded, "base64url");
    const ciphertext = Buffer.from(ciphertextEncoded, "base64url");
    const authTag = Buffer.from(authTagEncoded, "base64url");
    if (iv.length !== IV_BYTES || ciphertext.length > MAX_SECRET_BYTES || authTag.length !== 16) {
      throw new Error("invalid envelope");
    }

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAAD(additionalAuthenticatedData(context));
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    throw new ConnectorRuntimeError(
      "Connector secret envelope authentication failed.",
      "OBSERRA_CONNECTOR_SECRET_DECRYPT_FAILED",
      "invalid_response",
      500,
      false,
    );
  }
}
