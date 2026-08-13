import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const libDir = path.join(root, "lib");
const regulatedPattern = /^florida-class-d.*\.ts$/;
const hardcodedSupabasePattern = /https:\/\/[a-z0-9-]+\.supabase\.co/gi;
const publicSecretPattern = /NEXT_PUBLIC_[A-Z0-9_]*(?:SECRET|SERVICE_ROLE|API_KEY|TOKEN|PASSWORD)/g;

const files = fs.readdirSync(libDir)
  .filter((name) => regulatedPattern.test(name))
  .sort();

const findings = [];

for (const name of files) {
  const filePath = path.join(libDir, name);
  const source = fs.readFileSync(filePath, "utf8");
  const hardcodedUrls = [...source.matchAll(hardcodedSupabasePattern)].map((match) => match[0]);
  const publicSecrets = [...source.matchAll(publicSecretPattern)].map((match) => match[0]);

  if (hardcodedUrls.length || publicSecrets.length) {
    findings.push({
      file: `lib/${name}`,
      hardcodedSupabaseUrls: [...new Set(hardcodedUrls)],
      publicSecretNames: [...new Set(publicSecrets)],
    });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  regulatedFilesInspected: files.length,
  filesWithFindings: findings.length,
  findings,
  productionRule: "Regulated server modules must use explicit protected runtime configuration and must not embed Supabase project URLs or public secret environment names.",
};

console.log(JSON.stringify(report, null, 2));

if (process.argv.includes("--enforce") && findings.length > 0) {
  console.error(`Runtime isolation audit failed: ${findings.length} regulated file(s) require remediation.`);
  process.exit(1);
}
