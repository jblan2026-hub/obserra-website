import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const identity = fs.readFileSync("lib/legal-identity.ts", "utf8");
const layout = fs.readFileSync("app/layout.tsx", "utf8");
const home = fs.readFileSync("app/page.tsx", "utf8");
const services = fs.readFileSync("app/services/page.tsx", "utf8");
const serviceDetail = fs.readFileSync("app/services/[serviceId]/page.tsx", "utf8");
const eios = fs.readFileSync("app/eios/page.tsx", "utf8");
const trust = fs.readFileSync("app/trust/page.tsx", "utf8");
const apps = fs.readFileSync("app/apps/page.tsx", "utf8");
const academy = fs.readFileSync("app/academy/page.tsx", "utf8");
const chrome = fs.readFileSync("app/components/enterprise/EnterpriseChrome.tsx", "utf8");

test("public corporate identity is Obserra EPI LLC while legal identity remains unchanged", () => {
  assert.match(identity, /PUBLIC_BRAND_NAME = "Obserra EPI LLC"/);
  assert.match(identity, /LEGAL_ENTITY_NAME = "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC"/);
  assert.match(identity, /BRAND_PREFIX = "Obserra EPI"/);
});

test("public metadata template uses the owned short corporate identity", () => {
  assert.match(layout, /template: `%s \| \$\{PUBLIC_BRAND_NAME\}`/);
  assert.match(layout, /siteName: PUBLIC_BRAND_NAME/);
  assert.match(layout, /alternateName: PUBLIC_BRAND_NAME/);
});

test("priority public pages avoid embedding the full legal entity in search titles", () => {
  for (const source of [home, services, serviceDetail, eios, trust, apps, academy]) {
    assert.doesNotMatch(source, /title:\s*`[^`]*\$\{LEGAL_ENTITY_NAME\}/);
  }
});

test("enterprise header displays Obserra EPI LLC rather than a generic Obserra label", () => {
  assert.match(chrome, /ent-header__legal-name">\{PUBLIC_BRAND_NAME\}/);
  assert.doesNotMatch(chrome, /ent-header__legal-name">Obserra EPI</);
});
