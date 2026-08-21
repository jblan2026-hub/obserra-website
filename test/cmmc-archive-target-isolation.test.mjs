import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const archiveScript = fs.readFileSync("scripts/cmmc-archive-release-evidence.mjs", "utf8");
const workflow = fs.readFileSync(".github/workflows/cmmc-evidence-governance.yml", "utf8");

const FDACS_PROJECT_REF = "ggkxgjhsbgbifiqrhavr";
const SHARED_ACADEMY_PROJECT_REF = "nwxnyqlyzyufgoadtqxs";

test("live CMMC archive requires dedicated archive credentials with no generic Supabase fallback", () => {
  assert.doesNotMatch(
    archiveScript,
    /OBSERRA_CMMC_ARCHIVE_URL\s*\|\|\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL/,
    "CMMC archive URL must never fall back to the website/FDACS Supabase URL",
  );
  assert.doesNotMatch(
    archiveScript,
    /OBSERRA_CMMC_ARCHIVE_SERVICE_ROLE_KEY\s*\|\|\s*process\.env\.SUPABASE_SERVICE_ROLE_KEY/,
    "CMMC archive credential must never fall back to a shared Supabase service role",
  );
  assert.match(
    workflow,
    /OBSERRA_CMMC_ARCHIVE_URL:\s*\$\{\{ secrets\.OBSERRA_CMMC_ARCHIVE_URL \}\}/,
  );
  assert.match(
    workflow,
    /OBSERRA_CMMC_ARCHIVE_SERVICE_ROLE_KEY:\s*\$\{\{ secrets\.OBSERRA_CMMC_ARCHIVE_SERVICE_ROLE_KEY \}\}/,
  );
});

test("live CMMC archive explicitly rejects known shared Supabase project boundaries", () => {
  assert.match(archiveScript, new RegExp(FDACS_PROJECT_REF));
  assert.match(archiveScript, new RegExp(SHARED_ACADEMY_PROJECT_REF));
  assert.match(archiveScript, /dedicated CMMC archive project/i);
  assert.match(archiveScript, /new URL\(archiveUrl\)/);
});
