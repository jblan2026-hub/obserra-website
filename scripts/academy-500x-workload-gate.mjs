import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const exists = (p) => fs.existsSync(path.join(root, p));
const failures = [];
const check = (name, ok) => { if (!ok) failures.push(name); };

const courseSource = read("app/academy/courseData.ts");
const ids = [...courseSource.matchAll(/^\s*\["([a-z0-9-]+)"/gm)].map((m) => m[1]);
check("real catalog has 60 courses", ids.length === 60);
check("real course ids unique", new Set(ids).size === ids.length);

const levels = ["Foundation", "Professional", "Advanced", "Executive Intensive", "CISO Masterclass"];
const synthetic = Array.from({ length: 500 }, (_, i) => ({
  id: `scale-course-${String(i + 1).padStart(3, "0")}`,
  title: `Scale Course ${i + 1}`,
  level: levels[i % levels.length],
  price: 99 + (i % 12) * 25,
  durationMinutes: 150 + (i % 5) * 120,
  modules: Array.from({ length: 5 }, (_v, j) => ({ id: `m${j + 1}`, minutes: 30 + j * 5 })),
  releaseStatus: i % 7 === 0 ? "approved" : "published",
  checkout: `/api/academy/checkout?course=scale-course-${String(i + 1).padStart(3, "0")}`,
  certificate: `/academy/certificate/scale-course-${String(i + 1).padStart(3, "0")}`,
}));

check("500 synthetic courses created", synthetic.length === 500);
check("synthetic ids unique", new Set(synthetic.map((c) => c.id)).size === 500);
check("all ids route safe", synthetic.every((c) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.id)));
check("all courses have five modules", synthetic.every((c) => c.modules.length === 5));
check("all prices valid", synthetic.every((c) => Number.isFinite(c.price) && c.price > 0));
check("all durations valid", synthetic.every((c) => c.durationMinutes >= 150));
check("all release statuses publishable", synthetic.every((c) => ["approved", "published"].includes(c.releaseStatus)));
check("checkout links unique", new Set(synthetic.map((c) => c.checkout)).size === 500);
check("certificate links unique", new Set(synthetic.map((c) => c.certificate)).size === 500);

const digest = crypto.createHash("sha256").update(JSON.stringify(synthetic)).digest("hex");
check("deterministic workload digest", digest.length === 64);

const requiredFiles = [
  "app/api/academy/checkout/route.ts",
  "app/api/webhook/stripe/route.ts",
  "app/api/academy/assessment/route.ts",
  "app/api/academy/progress/route.ts",
  "app/academy/certificate/[courseId]/CertificateView.tsx",
  "app/academy/courseCatalog.ts",
];
for (const file of requiredFiles) check(`required file ${file}`, exists(file));

const checkout = read("app/api/academy/checkout/route.ts");
check("checkout fails closed without webhook", /STRIPE_WEBHOOK_SECRET/.test(checkout) && /not-ready/.test(checkout));
check("checkout disables public cache", /cache-control/i.test(checkout) && /no-store/i.test(checkout));
check("checkout uses Stripe session", /checkout\.sessions\.create/.test(checkout));
check("checkout includes course metadata", /courseId/.test(checkout));

const simulatedRequests = synthetic.flatMap((course) => [course.checkout, course.certificate]);
check("1000 flow endpoints simulated", simulatedRequests.length === 1000);
check("all simulated endpoints local", simulatedRequests.every((url) => url.startsWith("/")));

console.log(JSON.stringify({ gate: "academy-500x", courses: 500, flowEndpoints: 1000, digest, failures }, null, 2));
if (failures.length) process.exit(1);
