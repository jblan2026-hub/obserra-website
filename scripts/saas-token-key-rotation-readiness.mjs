import { readFile } from "node:fs/promises";

const token = await readFile("lib/saas-access-token.ts", "utf8");

const checks = [
  ["key ring supports JSON configuration", token.includes("OBSERRA_SAAS_ACCESS_TOKEN_KEYS_JSON")],
  ["active key selection is explicit", token.includes("OBSERRA_SAAS_ACCESS_TOKEN_ACTIVE_KID")],
  ["key identifiers are constrained", token.includes("^[A-Za-z0-9_-]{1,64}$")],
  ["every rotation key requires a 32-character secret", token.includes("secret.length < 32")],
  ["duplicate key identifiers are rejected", token.includes("duplicate key identifiers")],
  ["missing active key fails closed", token.includes("active key was not found")],
  ["issued tokens contain a key identifier", token.includes("`${key.id}.${payload}.${signature(payload, key.secret)}`")],
  ["verification resolves the declared key", token.includes("keyForVerification(keyId)")],
  ["unknown keys are rejected", token.includes('reason: "unknown-key"')],
  ["legacy two-segment tokens remain verifiable", token.includes("parts.length === 2")],
  ["signature comparison remains constant time", token.includes("timingSafeEqual")],
  ["verification enforces maximum token lifetime", token.includes("claims.expiresAt - claims.issuedAt > MAX_TTL_SECONDS")],
  ["health reports active key identity", token.includes("activeKeyId")],
  ["health reports verification key count", token.includes("verificationKeyCount")],
  ["health reports rotation state", token.includes("rotationEnabled")],
  ["health never returns key secrets", !token.includes("secret: active.secret") && !token.includes("keys.map((key) => key.secret")],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
if (failed.length) {
  console.error(`SaaS token key rotation readiness failed with ${failed.length} issue(s).`);
  process.exit(1);
}
console.log(`SaaS token key rotation readiness passed with ${checks.length} controls.`);
