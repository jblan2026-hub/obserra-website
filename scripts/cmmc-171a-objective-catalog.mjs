import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogPath = path.join(root, "docs/compliance/CMMC-L2-REV2-OBJECTIVE-CATALOG.json");
const digestPath = path.join(root, "docs/compliance/CMMC-L2-REV2-OBJECTIVE-CATALOG.sha256");
const expectedSourceSha256 = "21bf3acc43f4284f723639b82eb71e3ce597fa3610f7e9dcf5e8484e22bc0f71";
const controlPattern = /^3\.(?:[1-9]|1[0-4])\.\d+$/;
const objectivePattern = /^3\.(?:[1-9]|1[0-4])\.\d+(?:\[[a-z]\])?$/;

function fail(message) {
  console.error(`CMMC objective-catalog gate failed: ${message}`);
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

function numericControlSort(left, right) {
  const a = left.split(".").map(Number);
  const b = right.split(".").map(Number);
  return a[1] - b[1] || a[2] - b[2];
}

function cleanLine(value) {
  return value.replace(/\f/g, " ").replace(/\s+/g, " ").trim();
}

function isPdfNoise(value) {
  return !value || /^(NIST SP 800-171A|_{5,}|CHAPTER THREE|PAGE \d+|This publication is available free of charge|ASSESSING SECURITY REQUIREMENTS)/.test(value);
}

function extractCatalog(text, sourceSha256) {
  if (sourceSha256 !== expectedSourceSha256) {
    fail(`source PDF SHA-256 does not match the pinned NIST SP 800-171A June 2018 artifact (${sourceSha256})`);
  }
  const lines = text.split(/\r?\n/);
  const starts = [];
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^\s+(3\.(?:[1-9]|1[0-4])\.\d+)\s+SECURITY REQUIREMENT\s*$/);
    if (match) starts.push({ controlId: match[1], index });
  }

  const controls = new Map();
  for (let slot = 0; slot < starts.length; slot += 1) {
    const start = starts[slot];
    const end = slot + 1 < starts.length ? starts[slot + 1].index : lines.length;
    const block = lines.slice(start.index, end);
    const assessmentStart = block.findIndex((line) => line.includes("ASSESSMENT OBJECTIVE"));
    const methodsStart = block.findIndex((line, index) => index > assessmentStart && line.includes("POTENTIAL ASSESSMENT METHODS AND OBJECTS"));
    if (assessmentStart < 0 || methodsStart < 0) continue;

    const segment = block
      .slice(assessmentStart + 1, methodsStart)
      .map(cleanLine)
      .filter((line) => !isPdfNoise(line));
    const objectives = [];
    let current = null;
    const escapedControl = start.controlId.replaceAll(".", "\\.");
    const identifiedObjective = new RegExp(`^(${escapedControl}\\[[a-z]\\])\\s*(.*)$`);
    for (const line of segment) {
      const match = line.match(identifiedObjective);
      if (match) {
        current = { objectiveId: match[1], statement: match[2] };
        objectives.push(current);
      } else if (current && !/^Determine if:?$/.test(line)) {
        current.statement = `${current.statement} ${line}`.trim();
      }
    }
    if (objectives.length === 0) {
      const statement = segment.join(" ").replace(/^Determine if:?\s*/, "").trim();
      objectives.push({ objectiveId: start.controlId, statement });
    }
    // The official June 2018 PDF places the text for 3.1.12[b] immediately
    // before its identifier at a page boundary. Reconcile that extraction
    // artifact against the same objective printed in the pinned DoD Level 2
    // Assessment Guide v2.13; do not merge objectives [a] and [b].
    if (
      start.controlId === "3.1.12" &&
      objectives[0]?.statement === "remote access sessions are permitted. the types of permitted remote access are identified." &&
      objectives[1]?.objectiveId === "3.1.12[b]" &&
      objectives[1]?.statement === ""
    ) {
      objectives[0].statement = "remote access sessions are permitted.";
      objectives[1].statement = "the types of permitted remote access are identified.";
    }
    controls.set(start.controlId, objectives);
  }

  const orderedControls = [...controls.entries()]
    .sort(([left], [right]) => numericControlSort(left, right))
    .map(([controlId, objectives]) => ({ controlId, objectives }));
  return {
    schemaVersion: "2.0",
    catalogId: "cmmc-level2-nist-sp-800-171a-june-2018-objectives",
    sourceAuthorityId: "nist-sp-800-171a-june-2018",
    sourcePublication: "NIST SP 800-171A, Assessing Security Requirements for Controlled Unclassified Information, June 2018",
    sourceArtifactSha256: expectedSourceSha256,
    sourceUrl: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-171A.pdf",
    incorporationByReference: "32 CFR 170.2(a)(10)",
    controlCount: orderedControls.length,
    objectiveCount: orderedControls.reduce((count, control) => count + control.objectives.length, 0),
    controls: orderedControls,
  };
}

function validate(catalog) {
  if (catalog?.schemaVersion !== "2.0") fail("schemaVersion must be 2.0");
  if (catalog?.sourceAuthorityId !== "nist-sp-800-171a-june-2018") fail("objective source authority is not the incorporated June 2018 publication");
  if (catalog?.sourceArtifactSha256 !== expectedSourceSha256) fail("objective source artifact SHA-256 does not match the pinned official publication");
  if (catalog?.incorporationByReference !== "32 CFR 170.2(a)(10)") fail("objective catalog is not bound to the correct incorporation-by-reference citation");
  if (!Array.isArray(catalog?.controls) || catalog.controls.length !== 110 || catalog.controlCount !== 110) {
    fail("objective catalog must contain exactly 110 CMMC Level 2 Rev. 2 controls");
  }
  const controls = new Set();
  const objectives = new Set();
  for (const control of catalog.controls) {
    if (!controlPattern.test(control?.controlId ?? "") || controls.has(control.controlId)) {
      fail(`invalid or duplicate control identifier: ${control?.controlId ?? "missing"}`);
    }
    controls.add(control.controlId);
    if (!Array.isArray(control.objectives) || control.objectives.length === 0) {
      fail(`control ${control.controlId} has no assessment objectives`);
    }
    for (const objective of control.objectives) {
      if (!objectivePattern.test(objective?.objectiveId ?? "") || !objective.objectiveId.startsWith(control.controlId)) {
        fail(`control ${control.controlId} has an invalid objective identifier`);
      }
      if (objectives.has(objective.objectiveId)) fail(`duplicate assessment objective: ${objective.objectiveId}`);
      if (typeof objective.statement !== "string" || objective.statement.trim().length < 5) {
        fail(`assessment objective ${objective.objectiveId} has no authoritative determination statement`);
      }
      objectives.add(objective.objectiveId);
    }
  }
  if (objectives.size !== 320 || catalog.objectiveCount !== 320) {
    fail(`objective catalog must contain exactly 320 determination statements; found ${objectives.size}`);
  }
  return { controls, objectives };
}

const extractIndex = process.argv.indexOf("--extract-text");
if (extractIndex >= 0) {
  const textPath = process.argv[extractIndex + 1];
  const pdfIndex = process.argv.indexOf("--source-pdf");
  const pdfPath = pdfIndex >= 0 ? process.argv[pdfIndex + 1] : null;
  if (!textPath || !pdfPath || !process.argv.includes("--write")) {
    fail("extraction requires --extract-text <pdftotext-output> --source-pdf <official-pdf> --write");
  }
  const sourceBytes = fs.readFileSync(pdfPath);
  const catalog = extractCatalog(fs.readFileSync(textPath, "utf8"), sha256(sourceBytes));
  validate(catalog);
  fs.mkdirSync(path.dirname(catalogPath), { recursive: true });
  const serialized = `${JSON.stringify(catalog, null, 2)}\n`;
  fs.writeFileSync(catalogPath, serialized, "utf8");
  fs.writeFileSync(digestPath, `${sha256(serialized)}  ${path.basename(catalogPath)}\n`, "utf8");
  console.log(`Generated the pinned 110-control, 320-objective NIST SP 800-171A June 2018 catalog.`);
  process.exit(0);
}

if (!process.argv.includes("--check")) fail("use --check or the controlled extraction arguments");
const raw = read(catalogPath);
const catalog = json(catalogPath, "objective catalog");
validate(catalog);
const expectedDigest = `${sha256(raw)}  ${path.basename(catalogPath)}\n`;
if (read(digestPath) !== expectedDigest) fail("objective-catalog digest has drifted");
console.log("CMMC objective catalog passed: 110 Rev. 2 controls and 320 June 2018 assessment objectives are pinned and complete.");
