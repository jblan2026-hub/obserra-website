import "server-only";

import { buildGovernanceExport } from "./governance-evidence";

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[^\x20-\x7E]/g, "?");
}

function wrap(text: string, width = 96) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (!word) continue;
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function buildLines() {
  const data = buildGovernanceExport();
  const lines: string[] = [
    data.title,
    data.company,
    `Generated: ${data.generatedAt}`,
    "",
    `Total controls: ${data.summary.totalControls}`,
    `Implemented controls: ${data.summary.implementedControls}`,
    `Planned controls: ${data.summary.plannedControls}`,
    `Coverage: ${data.summary.coveragePercent}%`,
    `Evidence references: ${data.summary.evidenceReferences}`,
    `Validation commands: ${data.summary.validationCommands}`,
    `Auditable documents: ${data.summary.auditableDocuments}`,
    "",
    "FRAMEWORK COVERAGE",
  ];

  for (const [framework, summary] of Object.entries(data.summary.byFramework)) {
    lines.push(`${framework}: ${summary.implemented}/${summary.total} implemented; ${summary.partial} partial; ${summary.planned} planned`);
  }

  lines.push("", "CONTROL EVIDENCE");
  for (const control of data.controls) {
    lines.push(...wrap(`${control.framework} ${control.controlId} [${control.status.toUpperCase()}] ${control.capability}`));
    lines.push(...wrap(`Evidence: ${control.evidence.join(", ")}`, 100));
    lines.push(...wrap(`Tests: ${control.tests.join(", ")}`, 100));
    lines.push("");
  }

  lines.push("AUDITABLE DOCUMENTS");
  for (const document of data.documents) {
    lines.push(...wrap(`${document.category} | ${document.title} | ${document.source}`));
    lines.push(...wrap(document.description));
    lines.push("");
  }

  lines.push("DISCLAIMERS");
  for (const disclaimer of data.disclaimers) lines.push(...wrap(disclaimer));
  return lines;
}

export function generateGovernancePdf() {
  const lines = buildLines();
  const pageLineCount = 46;
  const pages: string[][] = [];
  for (let index = 0; index < lines.length; index += pageLineCount) pages.push(lines.slice(index, index + pageLineCount));

  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  const pageObjectIds = pages.map((_, index) => 4 + index * 2);
  objects.push(`<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`);
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  pages.forEach((pageLines, pageIndex) => {
    const pageObjectId = 4 + pageIndex * 2;
    const contentObjectId = pageObjectId + 1;
    objects[pageObjectId - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectId} 0 R >>`;
    const text = pageLines.map((line, lineIndex) => {
      const y = 754 - lineIndex * 15;
      const fontSize = lineIndex === 0 && pageIndex === 0 ? 14 : 8.5;
      return `BT /F1 ${fontSize} Tf 42 ${y} Td (${escapePdfText(line)}) Tj ET`;
    }).join("\n");
    objects[contentObjectId - 1] = `<< /Length ${Buffer.byteLength(text, "utf8")} >>\nstream\n${text}\nendstream`;
  });

  let output = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets[index + 1] = Buffer.byteLength(output, "utf8");
    output += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(output, "utf8");
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) {
    output += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(output, "utf8");
}
