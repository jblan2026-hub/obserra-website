import assert from "node:assert/strict";
import fs from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { pathToFileURL } from "node:url";
import test from "node:test";

const legalIdentity = pathToFileURL(`${process.cwd()}/lib/legal-identity.ts`).href;
const source = stripTypeScriptTypes(fs.readFileSync("lib/application-origin.ts", "utf8"))
  .replace('from "./legal-identity"', `from ${JSON.stringify(legalIdentity)}`);
const { applicationOrigin } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);

test("keeps the current host until the separate application origin is explicitly configured", () => {
  assert.equal(applicationOrigin({}), "https://www.obserrallc.com");
  assert.equal(applicationOrigin({ OBSERRA_APPLICATION_ORIGIN: "  " }), "https://www.obserrallc.com");
  assert.equal(applicationOrigin({ OBSERRA_APPLICATION_ORIGIN: "https://platform.obserrallc.com/" }), "https://platform.obserrallc.com");
});

test("rejects host confusion, credentials, insecure transport, and URL components", () => {
  for (const url of [
    "http://platform.obserrallc.com", "https://platform.obserrallc.com.attacker.example",
    "https://app.obserrallc.com", "https://attacker.example", "https://user:pass@platform.obserrallc.com",
    "https://platform.obserrallc.com:8443", "https://platform.obserrallc.com/checkout",
    "https://platform.obserrallc.com?redirect=https://attacker.example", "https://platform.obserrallc.com#fragment",
  ]) assert.throws(() => applicationOrigin({ OBSERRA_APPLICATION_ORIGIN: url }), undefined, url);
});
