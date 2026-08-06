import "server-only";

import { timingSafeEqual } from "node:crypto";

type ServiceCredential = {
  serviceId: string;
  secrets: string[];
  products: string[];
  enabled: boolean;
};

function parseRegistry(): ServiceCredential[] {
  const raw = process.env.OBSERRA_SAAS_SERVICE_CREDENTIALS_JSON?.trim();
  if (!raw) throw new Error("SaaS service credential registry is not configured");

  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed) || parsed.length === 0 || parsed.length > 100) {
    throw new Error("Invalid SaaS service credential registry");
  }

  const seen = new Set<string>();
  return parsed.map((entry) => {
    if (!entry || typeof entry !== "object") throw new Error("Invalid SaaS service credential entry");
    const candidate = entry as Partial<ServiceCredential>;
    const serviceId = typeof candidate.serviceId === "string" ? candidate.serviceId.trim() : "";
    const secrets = Array.isArray(candidate.secrets) ? candidate.secrets.map((value) => String(value).trim()) : [];
    const products = Array.isArray(candidate.products) ? candidate.products.map((value) => String(value).trim()) : [];
    if (!/^[A-Za-z0-9._:@/-]{3,120}$/.test(serviceId) || seen.has(serviceId)) {
      throw new Error("Invalid or duplicate SaaS service ID");
    }
    if (secrets.length === 0 || secrets.length > 3 || secrets.some((secret) => secret.length < 32)) {
      throw new Error("Invalid SaaS service secret set");
    }
    if (products.length === 0 || products.length > 100 || products.some((product) => !/^[A-Za-z0-9._/-]{1,120}$/.test(product))) {
      throw new Error("Invalid SaaS service product allowlist");
    }
    seen.add(serviceId);
    return { serviceId, secrets, products, enabled: candidate.enabled !== false };
  });
}

function secretMatches(provided: string, configured: string) {
  const left = Buffer.from(provided);
  const right = Buffer.from(configured);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function authorizeSaasService(input: { serviceId: string; secret: string; productSlug: string }) {
  const registry = parseRegistry();
  const service = registry.find((candidate) => candidate.serviceId === input.serviceId);
  if (!service || !service.enabled) return { allowed: false as const, reason: "service-not-authorized" as const };
  if (!service.products.includes(input.productSlug)) return { allowed: false as const, reason: "service-product-not-authorized" as const };
  if (!service.secrets.some((secret) => secretMatches(input.secret, secret))) {
    return { allowed: false as const, reason: "service-authentication-required" as const };
  }
  return { allowed: true as const, serviceId: service.serviceId };
}

export function saasServiceCredentialHealth() {
  try {
    const registry = parseRegistry();
    return {
      configured: true,
      serviceCount: registry.length,
      rotationSupported: registry.some((service) => service.secrets.length > 1),
      productBound: true,
      failClosed: true,
    };
  } catch {
    return { configured: false, serviceCount: 0, rotationSupported: false, productBound: true, failClosed: true };
  }
}
