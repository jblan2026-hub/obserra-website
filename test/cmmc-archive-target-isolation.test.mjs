import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const archiveScript = fs.readFileSync("scripts/cmmc-archive-release-evidence.mjs", "utf8");
const workflow = fs.readFileSync(".github/workflows/cmmc-evidence-governance.yml", "utf8");

const FDACS_PROJECT_REF = "ggkxgjhsbgbifiqrhavr";
const SHARED_ACADEMY_PROJECT_REF = "nwxnyqlyzyufgoadtqxs";
const CMMC_PAUSED = /TEMPORARILY NON-BLOCKING by owner authorization/.test(workflow);

test("CMMC archive boundary remains isolated while enforcement may be temporarily paused", () => {
  assert.doesNotMatch(
    archiveScript,
    /NEXT_PUBLIC_SUPABASE_URL/,
    "CMMC archive client must not reference the website/FDACS Supabase URL at all",
  );
  assert.doesNotMatch(
    archiveScript,
    /SUPABASE_SERVICE_ROLE_KEY/,
    "CMMC archive client must not reference a shared Supabase service-role credential at all",
  );

  if (CMMC_PAUSED) {
    assert.match(workflow, /No CMMC compliance claim is being made/);
    assert.doesNotMatch(workflow, /OBSERRA_CMMC_ARCHIVE_SERVICE_ROLE_KEY:\s*\$\{\{ secrets\./);
    return;
  }

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
