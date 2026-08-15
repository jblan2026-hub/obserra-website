import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const configPath = "lib/florida-class-d-supabase-config.ts";
const source = fs.readFileSync(configPath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  fileName: configPath,
}).outputText;
const moduleRecord = { exports: {} };
vm.runInNewContext(compiled, {
  Buffer,
  URL,
  module: moduleRecord,
  exports: moduleRecord.exports,
  process: { env: {} },
  require(specifier) {
    if (specifier === "server-only") return {};
    throw new Error(`Unexpected test import: ${specifier}`);
  },
});

const {
  floridaClassDServiceRoleKeyAuthorized,
  floridaClassDSupabaseOriginAuthorized,
} = moduleRecord.exports;
const projectRef = "ggkxgjhsbgbifiqrhavr";
const exactOrigin = `https://${projectRef}.supabase.co`;

test("FDACS Supabase origin is pinned to the isolated project", () => {
  assert.equal(floridaClassDSupabaseOriginAuthorized(exactOrigin, projectRef), true);
  assert.equal(floridaClassDSupabaseOriginAuthorized(`${exactOrigin}/`, projectRef), true);
  for (const candidate of [
    "https://attacker.example",
    `https://${projectRef}.supabase.co.attacker.example`,
    `https://attacker.example/${projectRef}.supabase.co`,
    `https://${projectRef}.supabase.co/rest/v1`,
    `https://${projectRef}.supabase.co?next=https://attacker.example`,
    `http://${projectRef}.supabase.co`,
  ]) {
    assert.equal(floridaClassDSupabaseOriginAuthorized(candidate, projectRef), false, candidate);
  }
  assert.equal(floridaClassDSupabaseOriginAuthorized(exactOrigin, "wrong-project"), false);
});

test("FDACS persistence rejects publishable and malformed credentials", () => {
  assert.equal(floridaClassDServiceRoleKeyAuthorized(`sb_secret_${"a".repeat(32)}`), true);
  assert.equal(floridaClassDServiceRoleKeyAuthorized(`sb_publishable_${"a".repeat(32)}`), false);
  assert.equal(floridaClassDServiceRoleKeyAuthorized("anon-key"), false);
});

test("every FDACS direct service-role client uses the pinned egress guard", () => {
  const clients = [
    "acceptance", "completion-documents", "completion-packet", "completion", "exam-admin",
    "exam-monitoring", "exam-retest", "exam", "lias", "live-feed", "live-persistence",
    "live-reporting", "makeup-certification", "makeup", "media", "observer", "persistence",
    "polls", "quality", "recorded-makeup", "scheduling", "student-certificate",
  ];
  for (const client of clients) {
    const clientSource = fs.readFileSync(`lib/florida-class-d-${client}.ts`, "utf8");
    assert.match(clientSource, /floridaClassDSupabase(?:ServerConfig|Origin)Authorized/, client);
    assert.doesNotMatch(clientSource, /!url\.startsWith\("https:\/\/"\)/, client);
  }
});
