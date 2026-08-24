import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflows = [
  ".github/workflows/marketplace-v12-stripe-reconcile-request.yml",
  ".github/workflows/marketplace-v12-stripe-binding-reconcile.yml",
];

test("Marketplace reconciliation masks secrets without contaminating command substitution", () => {
  for (const path of workflows) {
    const source = readFileSync(path, "utf8");
    const redirectedMasks = source.match(/echo "::add-mask::\$\{value\}" >&2/g) ?? [];
    assert.equal(redirectedMasks.length, 2, `${path} must redirect both masking commands away from captured stdout`);
    assert.doesNotMatch(source, /echo "::add-mask::\$\{value\}"\s*\n\s*printf/);
    assert.match(source, /printf '%s' "\$\{value\}"/);
  }
});
