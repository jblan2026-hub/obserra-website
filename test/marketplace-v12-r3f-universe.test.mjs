import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const root = new URL("..", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("capability universe primary renderer is real R3F with bounded instanced catalog geometry", async () => {
  const [experience, packageJson] = await Promise.all([
    read("app/ai-marketplace/MarketplaceExperience.tsx"),
    read("package.json"),
  ]);
  assert.match(packageJson, /"three": "0\.185\.1"/);
  assert.match(packageJson, /"@react-three\/fiber": "9\.7\.0"/);
  assert.match(packageJson, /"@react-three\/drei": "10\.7\.8"/);
  assert.match(experience, /from "@react-three\/fiber"/);
  assert.match(experience, /<Canvas /);
  assert.match(experience, /<Instances /);
  assert.match(experience, /<Instance /);
  assert.match(experience, /catalogSpatialGraph/);
  assert.match(experience, /relationship_product_ids/);
  assert.match(experience, /<OrbitControls enableDamping/);
  assert.match(experience, /enablePan enableZoom/);
  assert.match(experience, /maxDistance=\{30\}/);
  assert.doesNotMatch(experience, /StaticCapabilityMap/);
  assert.doesNotMatch(experience, /getContext\("webgl/);
});

test("3D nodes expose catalog name, family, level and product-route deep links", async () => {
  const experience = await read("app/ai-marketplace/MarketplaceExperience.tsx");
  assert.match(experience, /CatalogNodeLabels/);
  assert.match(experience, /point\.node\.name/);
  assert.match(experience, /point\.node\.family/);
  assert.match(experience, /point\.node\.proficiency/);
  assert.match(experience, /href={`\/ai-marketplace\/\$\{encodeURIComponent\(point\.node\.slug\)\}`}/);
  assert.match(experience, /router\.push\(`\/ai-marketplace\/\$\{encodeURIComponent\(node\.slug\)\}`\)/);
  assert.match(experience, /marketplace-scene-cluster/);
});

test("R3F universe degrades only after a real error and monitors context restoration", async () => {
  const experience = await read("app/ai-marketplace/MarketplaceExperience.tsx");
  assert.match(experience, /CapabilitySceneBoundary/);
  assert.match(experience, /webglcontextlost/);
  assert.match(experience, /webglcontextrestored/);
  assert.match(experience, /setRenderer\("recovering"\)/);
  assert.match(experience, /setRenderer\("ready"\)/);
  assert.match(experience, /SemanticSpatialFallback/);
  assert.match(experience, /semantic 2\.5D catalog map/);
});

test("scene endpoint keeps catalog archetype and proficiency attached to each rendered node", async () => {
  const catalog = await read("lib/marketplace-v12-catalog.ts");
  assert.match(catalog, /proficiency:card\.proficiency/);
  assert.match(catalog, /object_archetype:card\.visualization\.object_archetype\?\?"orb"/);
});
