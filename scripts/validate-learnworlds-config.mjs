import fs from "node:fs";

const path = "config/learnworlds-products.json";
const configuration = JSON.parse(fs.readFileSync(path, "utf8"));
const findings = [];
const courseIdPattern = /^[a-z0-9][a-z0-9-]{1,120}$/;
const productIdPattern = /^[a-zA-Z0-9._:-]{2,200}$/;

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

if (configuration.schemaVersion !== "1.0") findings.push("schema-version:unsupported");
if (configuration.schoolId !== "6a7a693d353feb69c94c7654") findings.push("school-id:mismatch");
if (configuration.schoolName !== "Obserra EPI Academy") findings.push("school-name:mismatch");
httpsUrl(configuration.schoolUrl, "school-url");
httpsUrl(configuration.authorDashboardUrl, "author-dashboard-url");
httpsUrl(configuration.customDomain, "custom-domain");

const products = Array.isArray(configuration.products) ? configuration.products : [];
if (!Array.isArray(configuration.products)) findings.push("products:not-array");
const courseIds = new Set();
const productIds = new Set();
for (const [index, product] of products.entries()) {
  const prefix = `product-${index + 1}`;
  if (!courseIdPattern.test(String(product?.courseId ?? ""))) findings.push(`${prefix}:invalid-course-id`);
  if (!productIdPattern.test(String(product?.productId ?? ""))) findings.push(`${prefix}:invalid-product-id`);
  httpsUrl(product?.publicUrl, `${prefix}:public-url`);
  if (!["sandbox", "published", "coming-soon", "held"].includes(String(product?.status ?? ""))) {
    findings.push(`${prefix}:invalid-status`);
  }
  if (courseIds.has(product.courseId)) findings.push(`${prefix}:duplicate-course-id`);
  if (productIds.has(product.productId)) findings.push(`${prefix}:duplicate-product-id`);
  courseIds.add(product.courseId);
  productIds.add(product.productId);
}

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
}, null, 2));
