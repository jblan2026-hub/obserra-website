import fs from "node:fs";

const path = "config/learnworlds-products.json";
const configuration = JSON.parse(fs.readFileSync(path, "utf8"));
const findings = [];
const courseIdPattern = /^[a-z0-9][a-z0-9-]{1,120}$/;
const productIdPattern = /^[a-zA-Z0-9._:-]{2,200}$/;
const packageIdPattern = /^package_[a-zA-Z0-9._:-]{4,200}$/;

function httpsUrl(value, label) {
  try {
    const parsed = new URL(String(value ?? ""));
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
      findings.push(`${label}:must-be-credential-free-https`);
    }
    return parsed;
  } catch {
    findings.push(`${label}:invalid-url`);
    return null;
  }
}

function normalizedPath(url) {
  return url.pathname.replace(/\/+$/, "") || "/";
}

function requireAllowedHost(url, allowedHosts, label) {
  if (url && !allowedHosts.has(url.hostname.toLowerCase())) {
    findings.push(`${label}:unapproved-host`);
  }
}

function validateCommerceUrl(url, expectedPath, courseId, packageId, prefix) {
  if (!url) return;
  if (normalizedPath(url) !== expectedPath) findings.push(`${prefix}:invalid-path`);
  if (url.searchParams.get("product_id") !== courseId) findings.push(`${prefix}:course-id-mismatch`);
  if (url.searchParams.get("type") !== "course") findings.push(`${prefix}:invalid-type`);
  if (url.searchParams.get("packageId") !== packageId) findings.push(`${prefix}:package-id-mismatch`);
}

if (configuration.schemaVersion !== "1.0") findings.push("schema-version:unsupported");
if (configuration.schoolId !== "6a7a693d353feb69c94c7654") findings.push("school-id:mismatch");
if (configuration.schoolName !== "Obserra EPI Academy") findings.push("school-name:mismatch");
const schoolUrl = httpsUrl(configuration.schoolUrl, "school-url");
const authorDashboardUrl = httpsUrl(configuration.authorDashboardUrl, "author-dashboard-url");
const customDomain = httpsUrl(configuration.customDomain, "custom-domain");
const allowedHosts = new Set(
  [schoolUrl?.hostname, customDomain?.hostname].filter(Boolean).map((host) => host.toLowerCase()),
);
requireAllowedHost(authorDashboardUrl, allowedHosts, "author-dashboard-url");

const products = Array.isArray(configuration.products) ? configuration.products : [];
if (!Array.isArray(configuration.products)) findings.push("products:not-array");
const courseIds = new Set();
const productIds = new Set();
const packageIds = new Set();
for (const [index, product] of products.entries()) {
  const prefix = `product-${index + 1}`;
  const courseId = String(product?.courseId ?? "");
  const learnWorldsCourseId = String(product?.learnWorldsCourseId ?? "");
  const productId = String(product?.productId ?? "");
  const packageId = String(product?.packageId ?? "");
  if (!courseIdPattern.test(courseId)) findings.push(`${prefix}:invalid-course-id`);
  if (!courseIdPattern.test(learnWorldsCourseId)) findings.push(`${prefix}:invalid-learnworlds-course-id`);
  if (!productIdPattern.test(productId)) findings.push(`${prefix}:invalid-product-id`);
  if (!packageIdPattern.test(packageId)) findings.push(`${prefix}:invalid-package-id`);

  const publicUrl = httpsUrl(product?.publicUrl, `${prefix}:public-url`);
  const checkoutUrl = httpsUrl(product?.checkoutUrl, `${prefix}:checkout-url`);
  const cartUrl = httpsUrl(product?.cartUrl, `${prefix}:cart-url`);
  requireAllowedHost(publicUrl, allowedHosts, `${prefix}:public-url`);
  requireAllowedHost(checkoutUrl, allowedHosts, `${prefix}:checkout-url`);
  requireAllowedHost(cartUrl, allowedHosts, `${prefix}:cart-url`);

  if (publicUrl && normalizedPath(publicUrl) !== `/course/${learnWorldsCourseId}`) {
    findings.push(`${prefix}:public-url-course-id-mismatch`);
  }
  validateCommerceUrl(checkoutUrl, "/payment", learnWorldsCourseId, packageId, `${prefix}:checkout-url`);
  validateCommerceUrl(cartUrl, "/cart", learnWorldsCourseId, packageId, `${prefix}:cart-url`);

  if (!["sandbox", "published", "coming-soon", "held"].includes(String(product?.status ?? ""))) {
    findings.push(`${prefix}:invalid-status`);
  }
  if (courseIds.has(courseId)) findings.push(`${prefix}:duplicate-course-id`);
  if (productIds.has(productId)) findings.push(`${prefix}:duplicate-product-id`);
  if (packageIds.has(packageId)) findings.push(`${prefix}:duplicate-package-id`);
  courseIds.add(courseId);
  productIds.add(productId);
  packageIds.add(packageId);
}

const canary = products.find((product) => product.courseId === "cybersecurity-foundations");
if (!canary) findings.push("canary:mapping-missing");
else if (!["sandbox", "published"].includes(canary.status)) findings.push("canary:not-routable");

const serialized = JSON.stringify(configuration);
for (const marker of [
  /client[_-]?secret/i,
  /access[_-]?token/i,
  /stripe[_-]?secret/i,
  /webhook[_-]?secret/i,
  /api[_-]?key/i,
]) {
  if (marker.test(serialized)) findings.push(`secret-marker:${marker.source}`);
}

if (findings.length) {
  console.error(JSON.stringify({ passed: false, path, findings }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  passed: true,
  path,
  schoolId: configuration.schoolId,
  mappedProducts: products.length,
  sandboxProducts: products.filter((product) => product.status === "sandbox").length,
  publishedProducts: products.filter((product) => product.status === "published").length,
  canaryCourseId: canary.courseId,
  canaryLearnWorldsCourseId: canary.learnWorldsCourseId,
  canaryProductId: canary.productId,
  canaryPackageId: canary.packageId,
}, null, 2));
