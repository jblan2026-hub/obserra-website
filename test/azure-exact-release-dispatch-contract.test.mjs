import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("owner dispatch and Azure promotion remain pinned to one reviewed main SHA", async () => {
  const workflow = await read(".github/workflows/azure-production-deploy.yml");
  const bootstrap = await read("scripts/obserra-owner-bootstrap.sh");

  assert.match(workflow, /expected_release_sha:/);
  assert.match(workflow, /ref: \$\{\{ env\.OBSERRA_APPROVED_RELEASE_SHA \}\}/);
  assert.match(workflow, /\^\[0-9a-f\]\{40\}\$/);
  assert.match(workflow, /git rev-parse HEAD.*OBSERRA_APPROVED_RELEASE_SHA/);
  assert.match(workflow, /git rev-parse origin\/main.*OBSERRA_APPROVED_RELEASE_SHA/);
  assert.match(workflow, /main moved during staging verification/);
  assert.doesNotMatch(workflow, /OBSERRA_RELEASE_SHA="\$\{GITHUB_SHA\}"/);
  assert.doesNotMatch(workflow, /--arg sha "\$\{GITHUB_SHA\}"/);

  assert.match(bootstrap, /git branch --show-current.*main/);
  assert.match(bootstrap, /approved_release_sha="\$\(git rev-parse HEAD\)"/);
  assert.match(bootstrap, /approved_release_sha.*git rev-parse origin\/main/);
  assert.match(bootstrap, /--field expected_release_sha="\$\{approved_release_sha\}"/);
});
