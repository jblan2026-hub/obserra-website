import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const AZURE_LOGIN_V301_SHA = "f5d393ae46f8fde4be8b75f32e3fc50e654ad0ca";
const WORKFLOWS = [
  ".github/workflows/bootstrap-marketplace-v12-azure-source.yml",
  ".github/workflows/marketplace-v12-protected-delivery.yml",
];

test("Marketplace production workflows pin Azure login to the reviewed immutable v3.0.1 commit", () => {
  for (const path of WORKFLOWS) {
    const source = fs.readFileSync(path, "utf8");
    assert.match(source, new RegExp(`azure/login@${AZURE_LOGIN_V301_SHA}`), path);
    assert.doesNotMatch(source, /azure\/login@v3\.0\.1/, path);
  }
});
