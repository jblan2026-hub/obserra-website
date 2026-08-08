import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sourcePath = path.join(root, "app", "apps", "appsData.ts");
const policyPath = path.join(root, "config", "application-market-intelligence-policy.json");
const outputDir = path.join(root, "release", "application-market-intelligence");

const source = fs.readFileSync(sourcePath, "utf8");
const policy = JSON.parse(fs.readFileSync(policyPath, "utf8"));
const appPattern = /slug:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?status:\s*"([^"]+)"[\s\S]*?category:\s*"([^"]+)"[\s\S]*?features:\s*\[([^\]]*)\][\s\S]*?integrations:\s*\[([^\]]*)\][\s\S]*?deployment:\s*\[([^\]]*)\]/g;

function quotedList(value) {
  return [...value.matchAll(/"([^"]+)"/g)].map((entry) => entry[1]);
}

function round(value, increment = 5000) {
  return Math.max(increment, Math.round(value / increment) * increment);
}

function pricingMotion(app) {
  if (app.status === "Pilot") return "fixed-term-paid-pilot";
  if (app.category === "Identity") return "per-seat-annual";
  if (app.category === "Cybersecurity" && /asset|vulnerability|cloud/i.test(app.name)) return "asset-volume-annual";
  if (/third party|vendor/i.test(app.name)) return "vendor-volume-annual";
  return "annual-platform";
}

const apps = [];
for (const match of source.matchAll(appPattern)) {
  apps.push({
    slug: match[1],
    name: match[2],
    status: match[3],
    category: match[4],
    features: quotedList(match[5]),
    integrations: quotedList(match[6]),
    deployment: quotedList(match[7]),
  });
}

if (!apps.length) throw new Error("No application records were parsed.");
fs.mkdirSync(outputDir, { recursive: true });

const portfolio = apps.map((app) => {
  const band = policy.internalPlanningBandsUsdAnnual[app.category];
  if (!band) throw new Error(`${app.slug}: no planning band configured for ${app.category}`);

  const deploymentPremium = Math.max(0, ...app.deployment.map((model) => policy.adjustments[model] ?? 0));
  const integrationPremium = Math.max(0, app.integrations.length - 2) * policy.adjustments.integrationAfterFirstTwo;
  const complexityMultiplier = 1 + deploymentPremium + integrationPremium;
  const lifecycleMultiplier = app.status === "Pilot"
    ? policy.adjustments.pilotMultiplier
    : app.status === "Coming Soon"
      ? policy.adjustments.comingSoonMultiplier
      : 1;

  const annualFloor = round(band.floor * complexityMultiplier);
  const annualTarget = round(band.target * complexityMultiplier);
  const annualCeiling = round(band.ceiling * complexityMultiplier);
  const pilotTarget = app.status === "Pilot" ? round(band.target * complexityMultiplier * lifecycleMultiplier) : null;

  return {
    slug: app.slug,
    name: app.name,
    category: app.category,
    marketplaceStatus: app.status,
    recommendedPricingMotion: pricingMotion(app),
    internalAnnualPlanningBandUsd: app.status === "Coming Soon" ? null : {
      floor: annualFloor,
      target: annualTarget,
      ceiling: annualCeiling
    },
    internalPaidPilotTargetUsd: pilotTarget,
    drivers: {
      deploymentModels: app.deployment,
      integrationCount: app.integrations.length,
      featureCount: app.features.length,
      deploymentPremium,
      integrationPremium
    },
    productionMutationAllowed: false,
    ownerApprovalRequired: true,
    confidence: "planning"
  };
});

fs.writeFileSync(path.join(outputDir, "portfolio-pricing-plan.json"), JSON.stringify({
  schemaVersion: "1.0",
  generatedAt: new Date().toISOString(),
  legalEntity: policy.owner,
  applications: portfolio
}, null, 2));

console.log(`[Application Market Brain] generated governed pricing guidance for ${portfolio.length} application(s).`);
