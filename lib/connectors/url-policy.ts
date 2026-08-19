import "server-only";

import net from "node:net";
import { ConnectorRuntimeError } from "./contracts";

const LOCALHOST_NAMES = new Set(["localhost", "localhost.localdomain", "[::1]", "::1"]);
const PRIVATE_IPV4_PREFIXES = ["10.", "127.", "169.254.", "192.168."] as const;

function normalizeHostname(value: string) {
  return value.trim().toLowerCase().replace(/\.$/, "");
}

function isPrivateIpv4(hostname: string) {
  if (PRIVATE_IPV4_PREFIXES.some((prefix) => hostname.startsWith(prefix))) return true;
  const octets = hostname.split(".").map((value) => Number(value));
  return octets.length === 4
    && octets.every((value) => Number.isInteger(value) && value >= 0 && value <= 255)
    && octets[0] === 172
    && octets[1] >= 16
    && octets[1] <= 31;
}

function reject(message: string): never {
  throw new ConnectorRuntimeError(
    message,
    "OBSERRA_CONNECTOR_URL_REJECTED",
    "policy_denied",
    400,
    false,
  );
}

export type ConnectorUrlPolicyInput = {
  url: string;
  allowedHostnames: readonly string[];
};

export function validateConnectorBaseUrl(input: ConnectorUrlPolicyInput) {
  if (input.allowedHostnames.length === 0) {
    reject("Connector host allowlist is required.");
  }

  let parsed: URL;
  try {
    parsed = new URL(input.url);
  } catch {
    reject("Connector URL is invalid.");
  }

  if (parsed.protocol !== "https:") reject("Connector URL must use HTTPS.");
  if (parsed.username || parsed.password) reject("Connector URL must not contain credentials.");
  if (parsed.port && parsed.port !== "443") reject("Connector URL must use the standard HTTPS port.");
  if (parsed.search || parsed.hash) reject("Connector base URL must not contain query or fragment data.");

  const hostname = normalizeHostname(parsed.hostname);
  if (!hostname || LOCALHOST_NAMES.has(hostname)) reject("Local connector endpoints are not permitted.");
  if (isPrivateIpv4(hostname)) reject("Private or link-local connector endpoints are not permitted.");

  const ipCandidate = hostname.startsWith("[") && hostname.endsWith("]")
    ? hostname.slice(1, -1)
    : hostname;
  if (net.isIP(ipCandidate) !== 0) {
    reject("IP-literal connector endpoints are not permitted; use an approved DNS hostname.");
  }

  const allowed = new Set(input.allowedHostnames.map(normalizeHostname));
  if (!allowed.has(hostname)) reject("Connector hostname is not on the approved allowlist.");

  const normalizedPath = parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/$/, "");
  return {
    baseUrl: `${parsed.origin}${normalizedPath}`,
    allowedHostname: hostname,
  } as const;
}

export function buildConnectorUrl(baseUrl: string, path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) {
    reject("Connector request path is invalid.");
  }
  const base = new URL(baseUrl);
  const target = new URL(path, `${base.origin}/`);
  if (normalizeHostname(target.hostname) !== normalizeHostname(base.hostname)) {
    reject("Connector request attempted to leave the configured host.");
  }
  return target.toString();
}
