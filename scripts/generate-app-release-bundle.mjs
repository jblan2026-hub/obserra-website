import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = fs.readFileSync(path.join(root, "app", "apps", "appsData.ts"), "utf8");
const appPattern = /slug:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?status:\s*"([^"]+)"[\s\S]*?category:\s*"([^"]+)"[\s\S]*?deployment:\s*\[([^\]]+)\]/g;
const apps = [];
for (const match of source.matchAll(appPattern)) {
  apps.push({
    slug: match[1],
    name: match[2],
    status: match[3],
    category: match[4],
    deployment: [...match[5].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]),
  });
}
if (!apps.length) throw new Error("No marketplace applications were parsed from appsData.ts");

const outputRoot = path.resolve(process.argv[2] || path.join(root, "release", "Obserra-Application-Release-Bundle"));
fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });

const catalog = [];
for (const app of apps) {
  const finalDir = path.join(outputRoot, app.slug, "FINAL");
  fs.mkdirSync(finalDir, { recursive: true });
  const manifest = {
    schemaVersion: "1.0",
    publisher: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
    product: { slug: app.slug, name: app.name, category: app.category, status: app.status },
    release: { version: "0.1.0", channel: "production", artifactStatus: "awaiting-signed-artifact" },
    commerce: {
      subscriptionRequired: true,
      allowedSubscriptionStatuses: ["active", "trialing"],
      deniedSubscriptionStatuses: ["past_due", "unpaid", "canceled", "incomplete", "incomplete_expired", "paused"],
      sourceOfTruth: "Stripe",
    },
    delivery: {
      deploymentModels: app.deployment,
      websiteProductPath: `/apps/${app.slug}`,
      subscriptionPath: `/apps/${app.slug}/subscribe`,
      saasLaunchPath: `/api/apps/access?app=${app.slug}`,
      downloadPath: `/api/apps/download?app=${app.slug}`,
      billingPortalPath: "/api/apps/billing-portal",
    },
  };
  fs.writeFileSync(path.join(finalDir, "release-manifest.json"), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(finalDir, "SUBSCRIPTION-POLICY.md"), `# ${app.name} Subscription Policy\n\nAccess is granted only while Stripe reports an active or trialing subscription. Access, launch, and downloads are denied when payment is past due, unpaid, canceled, incomplete, expired, or paused. Revalidation occurs before each controlled delivery action.\n`);
  fs.writeFileSync(path.join(finalDir, "DEPLOYMENT-PROFILE.md"), `# ${app.name} Deployment Profile\n\nSupported models: ${app.deployment.join(", ")}\n\n- SaaS: provisioned and launched through the Obserra customer portal.\n- Private Cloud: customer-specific managed environment after implementation approval.\n- Hybrid: governed combination of Obserra-hosted control plane and customer-hosted components.\n- On-Premises: signed package delivered only after entitlement, licensing, and deployment approval.\n`);
  fs.writeFileSync(path.join(finalDir, "RELEASE-CHECKLIST.md"), `# Final Release Checklist\n\n- [ ] Production artifact built and signed\n- [ ] Malware and dependency scans passed\n- [ ] SBOM attached\n- [ ] Version and checksum recorded\n- [ ] Stripe product and prices configured\n- [ ] SaaS launch target configured when applicable\n- [ ] Download artifact URL configured when applicable\n- [ ] Entitlement enforcement tested\n- [ ] Installation and rollback guidance validated\n- [ ] Release approved for customer delivery\n`);
  fs.writeFileSync(path.join(finalDir, "README.md"), `# ${app.name} FINAL Release\n\nThis directory is the controlled final-release location for ${app.name}. It intentionally contains release governance metadata rather than an unsigned placeholder binary. Add only validated, signed, customer-deliverable artifacts.\n`);
  catalog.push(manifest);
}

fs.writeFileSync(path.join(outputRoot, "release-catalog.json"), JSON.stringify({ generatedAt: new Date().toISOString(), applications: catalog }, null, 2));
fs.writeFileSync(path.join(outputRoot, "README.md"), `# Obserra Application Release Bundle\n\nGenerated from the website marketplace catalog. Each application has an isolated FINAL folder containing its release manifest, deployment profile, subscription policy, and release checklist.\n\nGenerate locally with:\n\n\`\`\`powershell\npnpm run release:apps -- "$env:USERPROFILE\\Desktop\\Obserra-Application-Release-Bundle"\n\`\`\`\n`);
console.log(`Generated ${apps.length} application release folders at ${outputRoot}`);
