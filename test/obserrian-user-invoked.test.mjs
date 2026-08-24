import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const guide = fs.readFileSync("app/ObserraGuide.tsx", "utf8");

test("Obserrian stays user-invoked on public pages", () => {
  assert.match(guide, /const \[open, setOpen\] = useState\(false\);/);
  assert.match(guide, /onClick=\{\(\) => setOpen\(\(value\) => !value\)\}/);
  assert.doesNotMatch(guide, /setTimeout\(\(\) => setOpen\(true\)/);
  assert.doesNotMatch(guide, /obserrian-auto-open-dismissed/);
});
