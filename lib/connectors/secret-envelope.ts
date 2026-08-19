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
import {
  resolveActiveConnectorEncryptionKey,
  resolveConnectorEncryptionKey,
} from "./key-provider";

const ENVELOPE_VERSION = "v1";
const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const MAX_SECRET_BYTES = 64 * 1024;
const KEY_ID_PATTERN = /^[A-Za-z0-9_.:-]{1,64}$/;

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

export async function encryptConnectorSecret(
  plaintext: string,
  context: ConnectorSecretContext,
): Promise<EncryptedConnectorSecret> {
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

  const activeKey = await resolveActiveConnectorEncryptionKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, activeKey.material, iv);
  cipher.setAAD(additionalAuthenticatedData(context));
  const ciphertext = Buffer.concat([cipher.update(payload), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    keyId: activeKey.keyId,
    envelope: [
      ENVELOPE_VERSION,
      activeKey.keyId,
      iv.toString("base64url"),
      ciphertext.toString("base64url"),
      authTag.toString("base64url"),
    ].join("."),
  };
}

export async function decryptConnectorSecret(
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
  const key = await resolveConnectorEncryptionKey(keyId);

  try {
    const iv = Buffer.from(ivEncoded, "base64url");
    const ciphertext = Buffer.from(ciphertextEncoded, "base64url");
    const authTag = Buffer.from(authTagEncoded, "base64url");
    if (iv.length !== IV_BYTES || ciphertext.length > MAX_SECRET_BYTES || authTag.length !== 16) {
      throw new Error("invalid envelope");
    }

    const decipher = createDecipheriv(ALGORITHM, key.material, iv);
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
