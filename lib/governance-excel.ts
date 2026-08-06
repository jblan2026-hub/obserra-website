import "server-only";

import { buildGovernanceExport } from "./governance-evidence";

function xml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cell(value: unknown, style = "Body") {
  const numeric = typeof value === "number" && Number.isFinite(value);
  return `<Cell ss:StyleID="${style}"><Data ss:Type="${numeric ? "Number" : "String"}">${xml(value)}</Data></Cell>`;
}

function row(values: unknown[], style?: string) {
  return `<Row>${values.map((value) => cell(value, style)).join("")}</Row>`;
}

function worksheet(name: string, headers: string[], rows: unknown[][]) {
  const widths = headers.map((header, index) => {
    const longest = Math.max(header.length, ...rows.map((entry) => String(entry[index] ?? "").length));
    return Math.min(420, Math.max(90, longest * 6.2));
  });
  return `<Worksheet ss:Name="${xml(name.slice(0, 31))}"><Table>${widths.map((width) => `<Column ss:AutoFitWidth="0" ss:Width="${width}"/>`).join("")}${row(headers, "Header")}${rows.map((entry) => row(entry)).join("")}</Table><WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><FreezePanes/><FrozenNoSplit/><SplitHorizontal>1</SplitHorizontal><TopRowBottomPane>1</TopRowBottomPane><ProtectObjects>False</ProtectObjects><ProtectScenarios>False</ProtectScenarios></WorksheetOptions><AutoFilter x:Range="R1C1:R${rows.length + 1}C${headers.length}" xmlns="urn:schemas-microsoft-com:office:excel"/></Worksheet>`;
}

export function generateGovernanceExcel() {
  const data = buildGovernanceExport();
  const controlsByFramework = new Map<string, typeof data.controls>();
  for (const control of data.controls) {
    const items = controlsByFramework.get(control.framework) ?? [];
    items.push(control);
    controlsByFramework.set(control.framework, items);
  }

  const sheets: string[] = [];
  sheets.push(worksheet("Executive Summary", ["Metric", "Value"], [
    ["Company", data.company],
    ["Generated At", data.generatedAt],
    ["Total Controls", data.summary.totalControls],
    ["Implemented Controls", data.summary.implementedControls],
    ["Planned Controls", data.summary.plannedControls],
    ["Coverage Percent", data.summary.coveragePercent],
    ["Evidence References", data.summary.evidenceReferences],
    ["Validation Commands", data.summary.validationCommands],
    ["Auditable Documents", data.summary.auditableDocuments],
    ...Object.entries(data.summary.byFramework).flatMap(([framework, values]) => [
      [`${framework} Total`, values.total],
      [`${framework} Implemented`, values.implemented],
      [`${framework} Partial`, values.partial],
      [`${framework} Planned`, values.planned],
    ]),
  ]));

  for (const [framework, controls] of controlsByFramework) {
    sheets.push(worksheet(framework, ["Control ID", "Status", "Category / Domain", "Implementation Capability", "Evidence References", "Validation Commands", "CSF Outcomes", "SSDF Practices", "GDPR Articles", "ISO 27701 Alignment"], controls.map((control) => [
      control.controlId,
      control.status,
      control.category ?? control.domain ?? "",
      control.capability,
      control.evidence.join("\n"),
      control.tests.join("\n"),
      control.csf?.join(", ") ?? "",
      control.ssdf?.join(", ") ?? "",
      control.gdpr?.join(", ") ?? "",
      control.iso27701 ?? "",
    ])));
  }

  sheets.push(worksheet("Evidence Inventory", ["Document ID", "Category", "Title", "Evidence Type", "Source", "Description", "Exportable"], data.documents.map((document) => [
    document.id,
    document.category,
    document.title,
    document.evidenceType,
    document.source,
    document.description,
    document.exportable ? "Yes" : "No",
  ])));

  sheets.push(worksheet("Audit Notes", ["Type", "Statement"], data.disclaimers.map((statement) => ["Disclaimer", statement])));

  const workbook = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Author>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</Author><Title>Obserra Governance Crosswalk</Title><Created>${xml(data.generatedAt)}</Created></DocumentProperties><Styles><Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Top" ss:WrapText="1"/><Font ss:FontName="Aptos" ss:Size="10"/></Style><Style ss:ID="Header"><Alignment ss:Vertical="Center" ss:WrapText="1"/><Font ss:FontName="Aptos" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#0B1F33" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#D4AF37"/></Borders></Style><Style ss:ID="Body"><Alignment ss:Vertical="Top" ss:WrapText="1"/><Font ss:FontName="Aptos" ss:Size="10" ss:Color="#111827"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/></Borders></Style></Styles>${sheets.join("")}</Workbook>`;
  return Buffer.from(workbook, "utf8");
}
