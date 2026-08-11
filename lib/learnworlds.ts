import "server-only";

import rawConfiguration from "../config/learnworlds-products.json";

const COURSE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,120}$/;
const PRODUCT_ID_PATTERN = /^[a-zA-Z0-9._:-]{2,200}$/;

export type LearnWorldsProductStatus = "sandbox" | "published" | "coming-soon" | "held";

export type LearnWorldsProduct = {
  courseId: string;
  productId: string;
  publicUrl: string;
  status: LearnWorldsProductStatus;
};

type LearnWorldsConfiguration = {
  schemaVersion: string;
  schoolId: string;
  schoolName: string;
  schoolUrl: string;
  authorDashboardUrl: string;
  customDomain: string;
  domainStatus: string;
  stripeStatus: string;
  apiStatus: string;
  products: LearnWorldsProduct[];
};

function normalized(value: unknown, maximum = 500): string {
  return String(value ?? "").trim().slice(0, maximum);
}

function httpsUrl(value: unknown, label: string): URL {
  const raw = normalized(value, 2000);
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`Invalid LearnWorlds ${label} URL.`);
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
    throw new Error(`LearnWorlds ${label} URL must use HTTPS and contain no credentials.`);
  }
  return parsed;
}

function validateProduct(value: unknown): LearnWorldsProduct {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid LearnWorlds product mapping.");
  }
  const candidate = value as Partial<LearnWorldsProduct>;
  const courseId = normalized(candidate.courseId, 121).toLowerCase();
  const productId = normalized(candidate.productId, 200);
  const publicUrl = httpsUrl(candidate.publicUrl, `product ${courseId || "unknown"}`).toString();
  const status = normalized(candidate.status, 40).toLowerCase() as LearnWorldsProductStatus;
  if (!COURSE_ID_PATTERN.test(courseId)) throw new Error(`Invalid LearnWorlds course ID ${courseId || "missing"}.`);
  if (!PRODUCT_ID_PATTERN.test(productId)) throw new Error(`Invalid LearnWorlds product ID for ${courseId}.`);
  if (!new Set<LearnWorldsProductStatus>(["sandbox", "published", "coming-soon", "held"]).has(status)) {
    throw new Error(`Invalid LearnWorlds product status for ${courseId}.`);
  }
  return { courseId, productId, publicUrl, status };
}

function validateConfiguration(value: unknown): LearnWorldsConfiguration {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("LearnWorlds configuration must be an object.");
  }
  const candidate = value as Partial<LearnWorldsConfiguration>;
  const schoolId = normalized(candidate.schoolId, 160);
  const schoolName = normalized(candidate.schoolName, 240);
  const schoolUrl = httpsUrl(candidate.schoolUrl, "school").origin;
  const authorDashboardUrl = httpsUrl(candidate.authorDashboardUrl, "author dashboard").toString();
  const customDomain = httpsUrl(candidate.customDomain, "custom domain").origin;
  const products = Array.isArray(candidate.products) ? candidate.products.map(validateProduct) : [];
  const duplicate = products.find((product, index) => products.findIndex((item) => item.courseId === product.courseId) !== index);
  if (duplicate) throw new Error(`Duplicate LearnWorlds mapping for ${duplicate.courseId}.`);
  if (!schoolId || !schoolName) throw new Error("LearnWorlds school ID and school name are required.");
  return {
    schemaVersion: normalized(candidate.schemaVersion, 40) || "1.0",
    schoolId,
    schoolName,
    schoolUrl,
    authorDashboardUrl,
    customDomain,
    domainStatus: normalized(candidate.domainStatus, 120),
    stripeStatus: normalized(candidate.stripeStatus, 120),
    apiStatus: normalized(candidate.apiStatus, 120),
    products,
  };
}

const configuration = validateConfiguration(rawConfiguration);
const productsByCourseId = new Map(configuration.products.map((product) => [product.courseId, product]));

export function academyCommerceProvider(): "learnworlds" | "website-stripe" {
  const configured = normalized(process.env.ACADEMY_COMMERCE_PROVIDER, 80).toLowerCase();
  return configured === "learnworlds" ? "learnworlds" : "website-stripe";
}

export function learnWorldsSandboxMode(): boolean {
  return normalized(process.env.LEARNWORLDS_SANDBOX_MODE, 20).toLowerCase() === "true";
}

export function learnWorldsProductForCourse(courseId: string): LearnWorldsProduct | null {
  const normalizedCourseId = normalized(courseId, 121).toLowerCase();
  if (!COURSE_ID_PATTERN.test(normalizedCourseId)) return null;
  return productsByCourseId.get(normalizedCourseId) ?? null;
}

export function learnWorldsEnrollmentUrl(courseId: string): URL | null {
  const product = learnWorldsProductForCourse(courseId);
  if (!product) return null;
  const allowed = product.status === "published" || (product.status === "sandbox" && learnWorldsSandboxMode());
  if (!allowed) return null;
  const target = httpsUrl(product.publicUrl, `product ${product.courseId}`);
  target.searchParams.set("utm_source", "obserra-website");
  target.searchParams.set("utm_medium", "academy-enrollment");
  target.searchParams.set("utm_campaign", product.courseId);
  return target;
}

export function learnWorldsConfigurationStatus() {
  return {
    provider: academyCommerceProvider(),
    sandboxMode: learnWorldsSandboxMode(),
    schoolId: configuration.schoolId,
    schoolName: configuration.schoolName,
    schoolUrl: configuration.schoolUrl,
    customDomain: configuration.customDomain,
    domainStatus: configuration.domainStatus,
    stripeStatus: configuration.stripeStatus,
    apiStatus: configuration.apiStatus,
    mappedProducts: configuration.products.length,
    publishedProducts: configuration.products.filter((product) => product.status === "published").length,
    sandboxProducts: configuration.products.filter((product) => product.status === "sandbox").length,
    apiEnvironmentReady: Boolean(
      normalized(process.env.LEARNWORLDS_API_URL, 2000) &&
      normalized(process.env.LEARNWORLDS_CLIENT_ID, 500) &&
      normalized(process.env.LEARNWORLDS_CLIENT_SECRET, 2000) &&
      normalized(process.env.LEARNWORLDS_ACCESS_TOKEN, 4000),
    ),
  } as const;
}
