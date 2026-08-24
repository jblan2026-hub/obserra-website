import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const guide = fs.readFileSync("app/ObserraGuide.tsx", "utf8");
const panel = fs.readFileSync("app/ObserraGuidePanel.tsx", "utf8");

test("Obserrian stays user-invoked on public pages", () => {
  assert.match(guide, /const \[open, setOpen\] = useState\(false\);/);
  assert.match(guide, /onClick=\{\(\) => setOpen\(\(value\) => !value\)\}/);
  assert.doesNotMatch(guide, /setTimeout\(\(\) => setOpen\(true\)/);
  assert.doesNotMatch(guide, /obserrian-auto-open-dismissed/);
});

test("Obserrian defers the heavy advisor panel until the launcher is opened", () => {
  assert.match(guide, /dynamic\(\(\) => import\("\.\/ObserraGuidePanel"\)/);
  assert.match(guide, /ssr:\s*false/);
  assert.match(guide, /open \? <ObserraGuidePanel onClose=/);
  assert.doesNotMatch(guide, /function response\(/);
  assert.doesNotMatch(guide, /function pageContext\(/);
  assert.match(panel, /function response\(/);
  assert.match(panel, /function pageContext\(/);
  assert.match(panel, /export default function ObserraGuidePanel/);
});
