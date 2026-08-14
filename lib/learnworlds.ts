import "server-only";

import rawConfiguration from "../config/learnworlds-products.json";

const COURSE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,120}$/;
const PRODUCT_ID_PATTERN = /^[a-zA-Z0-9._:-]{2,200}$/;
const PACKAGE_ID_PATTERN = /^package_[a-zA-Z0-9._:-]{4,200}$/;

export type LearnWorldsProductStatus = "sandbox" | "published" | "coming-soon" | "held";

export type LearnWorldsProduct = {
  courseId: string;
  learnWorldsCourseId: string;
  productId: string;
  packageId: string;
  publicUrl: string;
  checkoutUrl: string;
  cartUrl: string;
  status: LearnWorldsProductStatus;
};

type LearnWorldsConfiguration = {
  schemaVersion: string;
  schoolId: string;
  schoolName: string;
  schoolUrl: string;
  authorDashboardUrl: string;
  apiUrl: string;
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

function normalizedPath(url: URL): string {
  return url.pathname.replace(/\/+$/, "") || "/";
}

function requireAllowedHost(url: URL, allowedHosts: Set<string>, label: string) {
  if (!allowedHosts.has(url.hostname.toLowerCase())) {
    throw new Error(`LearnWorlds ${label} URL must use the governed school or Academy hostname.`);
  }
}

function validateCommerceUrl({
  url,
  label,
  expectedPath,
  learnWorldsCourseId,
  packageId,
}: {
  url: URL;
  label: string;
  expectedPath: "/payment" | "/cart";
  learnWorldsCourseId: string;
  packageId: string;
}) {
  if (normalizedPath(url) !== expectedPath) {
    throw new Error(`LearnWorlds ${label} URL must use ${expectedPath}.`);
  }
  if (url.searchParams.get("product_id") !== learnWorldsCourseId) {
    throw new Error(`LearnWorlds ${label} URL product_id does not match the governed course ID.`);
  }
  if (url.searchParams.get("type") !== "course") {
    throw new Error(`LearnWorlds ${label} URL must identify a course product.`);
  }
  if (url.searchParams.get("packageId") !== packageId) {
    throw new Error(`LearnWorlds ${label} URL packageId does not match the governed package.`);
  }
}

function validateProduct(value: unknown, allowedHosts: Set<string>): LearnWorldsProduct {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid LearnWorlds product mapping.");
  }
  const candidate = value as Partial<LearnWorldsProduct>;
  const courseId = normalized(candidate.courseId, 121).toLowerCase();
  const learnWorldsCourseId = normalized(candidate.learnWorldsCourseId, 121).toLowerCase();
  const productId = normalized(candidate.productId, 200);
  const packageId = normalized(candidate.packageId, 208);
  const publicUrl = httpsUrl(candidate.publicUrl, `public product ${courseId || "unknown"}`);
  const checkoutUrl = httpsUrl(candidate.checkoutUrl, `checkout ${courseId || "unknown"}`);
  const cartUrl = httpsUrl(candidate.cartUrl, `cart ${courseId || "unknown"}`);
  const status = normalized(candidate.status, 40).toLowerCase() as LearnWorldsProductStatus;

  if (!COURSE_ID_PATTERN.test(courseId)) {
    throw new Error(`Invalid Obserra course ID ${courseId || "missing"}.`);
  }
  if (!COURSE_ID_PATTERN.test(learnWorldsCourseId)) {
    throw new Error(`Invalid LearnWorlds course ID for ${courseId}.`);
  }
  if (!PRODUCT_ID_PATTERN.test(productId)) {
    throw new Error(`Invalid LearnWorlds store product ID for ${courseId}.`);
  }
  if (!PACKAGE_ID_PATTERN.test(packageId)) {
    throw new Error(`Invalid LearnWorlds package ID for ${courseId}.`);
  }
  if (!new Set<LearnWorldsProductStatus>(["sandbox", "published", "coming-soon", "held"]).has(status)) {
    throw new Error(`Invalid LearnWorlds product status for ${courseId}.`);
  }

  for (const [url, label] of [
    [publicUrl, `public product ${courseId}`],
    [checkoutUrl, `checkout ${courseId}`],
    [cartUrl, `cart ${courseId}`],
  ] as const) {
    requireAllowedHost(url, allowedHosts, label);
  }

  if (normalizedPath(publicUrl) !== `/course/${learnWorldsCourseId}`) {
    throw new Error(`LearnWorlds public URL does not match the governed course ID for ${courseId}.`);
  }
  validateCommerceUrl({
    url: checkoutUrl,
    label: `checkout ${courseId}`,
    expectedPath: "/payment",
    learnWorldsCourseId,
    packageId,
  });
  validateCommerceUrl({
    url: cartUrl,
    label: `cart ${courseId}`,
    expectedPath: "/cart",
    learnWorldsCourseId,
    packageId,
  });

  return {
    courseId,
    learnWorldsCourseId,
    productId,
    packageId,
    publicUrl: publicUrl.toString(),
    checkoutUrl: checkoutUrl.toString(),
    cartUrl: cartUrl.toString(),
    status,
  };
}

function validateConfiguration(value: unknown): LearnWorldsConfiguration {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("LearnWorlds configuration must be an object.");
  }
  const candidate = value as Partial<LearnWorldsConfiguration>;
  const schoolId = normalized(candidate.schoolId, 160);
  const schoolName = normalized(candidate.schoolName, 240);
  const schoolUrl = httpsUrl(candidate.schoolUrl, "school");
  const authorDashboardUrl = httpsUrl(candidate.authorDashboardUrl, "author dashboard");
  const apiUrl = httpsUrl(candidate.apiUrl, "API");
  const customDomain = httpsUrl(candidate.customDomain, "custom domain");
  const allowedHosts = new Set([
    schoolUrl.hostname.toLowerCase(),
    customDomain.hostname.toLowerCase(),
  ]);
  requireAllowedHost(authorDashboardUrl, allowedHosts, "author dashboard");
  requireAllowedHost(apiUrl, allowedHosts, "API");
  if (normalizedPath(apiUrl) !== "/admin/api") {
    throw new Error("LearnWorlds API URL must use the governed /admin/api path.");
  }

  const products = Array.isArray(candidate.products)
    ? candidate.products.map((product) => validateProduct(product, allowedHosts))
    : [];
  const duplicateCourse = products.find(
    (product, index) => products.findIndex((item) => item.courseId === product.courseId) !== index,
  );
  const duplicateProduct = products.find(
    (product, index) => products.findIndex((item) => item.productId === product.productId) !== index,
  );
  const duplicatePackage = products.find(
    (product, index) => products.findIndex((item) => item.packageId === product.packageId) !== index,
  );
  if (duplicateCourse) throw new Error(`Duplicate LearnWorlds mapping for ${duplicateCourse.courseId}.`);
  if (duplicateProduct) throw new Error(`Duplicate LearnWorlds store product ID ${duplicateProduct.productId}.`);
  if (duplicatePackage) throw new Error(`Duplicate LearnWorlds package ID ${duplicatePackage.packageId}.`);
  if (!schoolId || !schoolName) throw new Error("LearnWorlds school ID and school name are required.");

  return {
    schemaVersion: normalized(candidate.schemaVersion, 40) || "1.0",
    schoolId,
    schoolName,
    schoolUrl: schoolUrl.origin,
    authorDashboardUrl: authorDashboardUrl.toString(),
    apiUrl: apiUrl.toString(),
    customDomain: customDomain.origin,
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

export function learnWorldsApiUrl(): URL {
  const configured = normalized(process.env.LEARNWORLDS_API_URL, 2000);
  const target = httpsUrl(configured || configuration.apiUrl, "API");
  const allowedHosts = new Set([
    new URL(configuration.schoolUrl).hostname.toLowerCase(),
    new URL(configuration.customDomain).hostname.toLowerCase(),
  ]);
  requireAllowedHost(target, allowedHosts, "API");
  if (normalizedPath(target) !== "/admin/api") {
    throw new Error("LearnWorlds API URL must use the governed /admin/api path.");
  }
  return target;
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
  const target = httpsUrl(product.checkoutUrl, `checkout ${product.courseId}`);
  target.searchParams.set("utm_source", "obserra-website");
  target.searchParams.set("utm_medium", "academy-enrollment");
  target.searchParams.set("utm_campaign", product.courseId);
  return target;
}

export function learnWorldsConfigurationStatus() {
  let apiUrlReady = false;
  try {
    apiUrlReady = Boolean(learnWorldsApiUrl());
  } catch {
    apiUrlReady = false;
  }
  return {
    provider: academyCommerceProvider(),
    sandboxMode: learnWorldsSandboxMode(),
    schoolId: configuration.schoolId,
    schoolName: configuration.schoolName,
    schoolUrl: configuration.schoolUrl,
    apiUrl: configuration.apiUrl,
    customDomain: configuration.customDomain,
    domainStatus: configuration.domainStatus,
    stripeStatus: configuration.stripeStatus,
    apiStatus: configuration.apiStatus,
    mappedProducts: configuration.products.length,
    publishedProducts: configuration.products.filter((product) => product.status === "published").length,
    sandboxProducts: configuration.products.filter((product) => product.status === "sandbox").length,
    apiEnvironmentReady: Boolean(
      apiUrlReady &&
      normalized(process.env.LEARNWORLDS_CLIENT_ID, 500) &&
      normalized(process.env.LEARNWORLDS_CLIENT_SECRET, 2000) &&
      normalized(process.env.LEARNWORLDS_ACCESS_TOKEN, 4000),
    ),
  } as const;
}
