import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogPath = path.join(root, "docs/compliance/CMMC-REV3-OBJECTIVE-CATALOG.json");
const digestPath = path.join(root, "docs/compliance/CMMC-REV3-OBJECTIVE-CATALOG.sha256");
const expectedSourceSha256 = "946d963707cdaba19901c49d5c89517adb00844fe5d101e9dac7febc68e34cfa";
const controlPattern = /^03\.(?:0[1-9]|1[0-7])\.\d{2}$/;
const objectivePattern = /^A\.03\.(?:0[1-9]|1[0-7])\.\d{2}(?:\[\d+\]|\.[A-Za-z0-9.]+(?:\[\d+\])?)?$/;

function fail(message) {
  console.error(`CMMC Rev. 3 objective-catalog gate failed: ${message}`);
  process.exit(1);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`required file is missing: ${path.relative(root, file)}`);
  return fs.readFileSync(file, "utf8");
}

function json(file, label) {
  try {
    return JSON.parse(read(file));
  } catch (error) {
    fail(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function cleanLine(value) {
  return value
    .replace(/\f/g, " ")
    .replace(/NIST SP 800-171Ar3\s+Assessing CUI Security Requirements/g, " ")
    .replace(/May 2024/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractCatalog(text, sourceSha256) {
  if (sourceSha256 !== expectedSourceSha256) {
    fail(`source PDF SHA-256 does not match the pinned NIST SP 800-171A Revision 3 artifact (${sourceSha256})`);
  }
  const lines = text.split(/\r?\n/);
  const firstRequirement = lines.findIndex((line) => /^03\.01\.01 Account Management/.test(line));
  if (firstRequirement < 0) fail("could not locate the first Rev. 3 assessment procedure");

  const headings = [];
  for (let index = firstRequirement; index < lines.length; index += 1) {
    const match = lines[index].match(/^(03\.(?:0[1-9]|1[0-7])\.\d{2})\s+(.+?)\s*$/);
    if (match) headings.push({ controlId: match[1], title: match[2].trim(), index });
  }
  const activeHeadings = headings.filter((heading) =>
    heading.title !== "Withdrawn" &&
    lines.slice(heading.index + 1, heading.index + 5).some((line) => line.includes("ASSESSMENT OBJECTIVE")),
  );

  const controls = [];
  for (const heading of activeHeadings) {
    const nextHeading = headings.find((candidate) => candidate.index > heading.index);
    const block = lines.slice(heading.index, nextHeading?.index ?? lines.length);
    const assessmentStart = block.findIndex((line) => line.includes("ASSESSMENT OBJECTIVE"));
    const methodsStart = block.findIndex((line, index) => index > assessmentStart && line.includes("ASSESSMENT METHODS AND OBJECTS"));
    if (assessmentStart < 0 || methodsStart < 0) fail(`assessment block is incomplete for ${heading.controlId}`);
    const segment = block
      .slice(assessmentStart + 1, methodsStart)
      .map(cleanLine)
      .filter((line) => line && !/^(\d+|Determine if:?)$/.test(line));
    const objectives = [];
    let current = null;
    for (const line of segment) {
      const match = line.match(/^(A\.03\.\d{2}\.\d{2}(?:\[\d+\]|\.[A-Za-z0-9.]+(?:\[\d+\])?)?):\s*(.*)$/);
      if (match) {
        current = { objectiveId: match[1], statement: match[2] };
        objectives.push(current);
      } else if (current) {
        current.statement = `${current.statement} ${line}`.trim();
      }
    }
    controls.push({ controlId: heading.controlId, title: heading.title, objectives });
  }

  return {
    schemaVersion: "2.0",
    catalogId: "nist-sp-800-171a-revision-3-objectives",
    sourceAuthorityId: "nist-sp-800-171ar3-2024-05",
    sourcePublication: "NIST SP 800-171A Revision 3, Assessing Security Requirements for Controlled Unclassified Information, May 2024",
    sourceArtifactSha256: expectedSourceSha256,
    sourceUrl: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-171Ar3.pdf",
    relationshipToCmmcLevel2: "supplemental_forward_engineering_assessment_crosswalk_not_incorporated_by_32_cfr_part_170",
    controlCount: controls.length,
    objectiveCount: controls.reduce((count, control) => count + control.objectives.length, 0),
    controls,
  };
}

function validate(catalog) {
  if (catalog?.schemaVersion !== "2.0") fail("schemaVersion must be 2.0");
  if (catalog?.sourceAuthorityId !== "nist-sp-800-171ar3-2024-05") fail("source authority must be the pinned May 2024 Revision 3 assessment publication");
  if (catalog?.sourceArtifactSha256 !== expectedSourceSha256) fail("source artifact SHA-256 is not the pinned official Revision 3 assessment publication");
  if (catalog?.relationshipToCmmcLevel2 !== "supplemental_forward_engineering_assessment_crosswalk_not_incorporated_by_32_cfr_part_170") {
    fail("Revision 3 must remain explicitly supplemental to the current 32 CFR Part 170 assessment baseline");
  }
  if (!Array.isArray(catalog?.controls) || catalog.controls.length !== 97 || catalog.controlCount !== 97) {
    fail("Rev. 3 objective catalog must contain exactly 97 active requirements");
  }
  const controls = new Set();
  const objectives = new Set();
  for (const control of catalog.controls) {
    if (!controlPattern.test(control?.controlId ?? "") || controls.has(control.controlId)) {
      fail(`invalid or duplicate Rev. 3 control: ${control?.controlId ?? "missing"}`);
    }
    controls.add(control.controlId);
    if (typeof control.title !== "string" || control.title.trim().length < 2) fail(`control ${control.controlId} has no title`);
    if (!Array.isArray(control.objectives) || control.objectives.length === 0) fail(`control ${control.controlId} has no objectives`);
    for (const objective of control.objectives) {
      if (!objectivePattern.test(objective?.objectiveId ?? "") || !objective.objectiveId.startsWith(`A.${control.controlId}`)) {
        fail(`control ${control.controlId} has an invalid objective identifier`);
      }
      if (objectives.has(objective.objectiveId)) fail(`duplicate Rev. 3 objective: ${objective.objectiveId}`);
      if (typeof objective.statement !== "string" || objective.statement.trim().length < 5) fail(`objective ${objective.objectiveId} has no statement`);
      objectives.add(objective.objectiveId);
    }
  }
  if (objectives.size !== 510 || catalog.objectiveCount !== 510) {
    fail(`Rev. 3 objective catalog must contain exactly 510 determination statements; found ${objectives.size}`);
  }
}

const extractIndex = process.argv.indexOf("--extract-text");
if (extractIndex >= 0) {
  const textPath = process.argv[extractIndex + 1];
  const pdfIndex = process.argv.indexOf("--source-pdf");
  const pdfPath = pdfIndex >= 0 ? process.argv[pdfIndex + 1] : null;
  if (!textPath || !pdfPath || !process.argv.includes("--write")) {
    fail("extraction requires --extract-text <pdftotext-output> --source-pdf <official-pdf> --write");
  }
  const catalog = extractCatalog(fs.readFileSync(textPath, "utf8"), sha256(fs.readFileSync(pdfPath)));
  validate(catalog);
  fs.mkdirSync(path.dirname(catalogPath), { recursive: true });
  const serialized = `${JSON.stringify(catalog, null, 2)}\n`;
  fs.writeFileSync(catalogPath, serialized, "utf8");
  fs.writeFileSync(digestPath, `${sha256(serialized)}  ${path.basename(catalogPath)}\n`, "utf8");
  console.log("Generated the pinned 97-control, 510-objective NIST SP 800-171A Revision 3 catalog.");
  process.exit(0);
}

if (!process.argv.includes("--check")) fail("use --check or the controlled extraction arguments");
const raw = read(catalogPath);
validate(json(catalogPath, "Rev. 3 objective catalog"));
if (read(digestPath) !== `${sha256(raw)}  ${path.basename(catalogPath)}\n`) fail("Rev. 3 objective-catalog digest has drifted");
console.log("CMMC Rev. 3 objective catalog passed: 97 requirements and 510 May 2024 assessment objectives are pinned and complete.");
