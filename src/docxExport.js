import JSZip from "jszip";
import { saveAs } from "file-saver";

const docxColors = {
  blue: "1363DF",
  navy: "061B3A",
  muted: "5E6D84",
  line: "D9E2F1",
  headerFill: "EEF4FF"
};

const opswatTemplatePath = "/templates/opswat_word_doc.docx";
const simplonNorm = "Simplon Norm";
const simplonNormBold = "Simplon Norm Bold";

function getRowValue(section, fieldName) {
  const row = section?.data?.rows?.find((item) => item.Field === fieldName);
  return row?.Value?.trim() || "";
}

function getEngagementRows(section) {
  return ["Client", "Engagement Type", "OPSWAT Account Executive", "OPSWAT Solutions Engineer", "PoV Duration", "Document Version", "Classification"].map(
    (field) => [field, getRowValue(section, field)]
  );
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function paragraphXml(text, options = {}) {
  const style = options.style ? `<w:pStyle w:val="${options.style}"/>` : "";
  const spacing = `<w:spacing w:after="${options.after ?? 160}" w:line="${options.line ?? 276}" w:lineRule="auto"/>`;
  const font = options.bold ? simplonNormBold : simplonNorm;
  const bold = options.bold ? "<w:b/>" : "";
  const size = options.size || 22;
  const color = options.color || docxColors.navy;

  return `
    <w:p>
      <w:pPr>${style}${spacing}</w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/>
          ${bold}
          <w:color w:val="${color}"/>
          <w:sz w:val="${size}"/>
          <w:szCs w:val="${size}"/>
        </w:rPr>
        <w:t xml:space="preserve">${escapeXml(text)}</w:t>
      </w:r>
    </w:p>`;
}

function headingXml(text, level = 4) {
  return paragraphXml(text, {
    style: `Heading${level}`,
    size: level <= 2 ? 28 : 22,
    bold: true,
    color: docxColors.blue,
    after: 160
  });
}

function bodyXml(text) {
  return paragraphXml(text, {
    style: "BodyText",
    size: 20,
    color: docxColors.navy,
    after: 180
  });
}

function tableCellXml(text, options = {}) {
  const font = options.bold ? simplonNormBold : simplonNorm;
  const bold = options.bold ? "<w:b/>" : "";
  const shading = options.shading ? `<w:shd w:val="clear" w:color="auto" w:fill="${options.shading}"/>` : "";
  const width = options.width || 4200;
  const color = options.color || docxColors.navy;

  return `
    <w:tc>
      <w:tcPr>
        <w:tcW w:w="${width}" w:type="dxa"/>
        ${shading}
        <w:tcMar>
          <w:top w:w="140" w:type="dxa"/>
          <w:left w:w="180" w:type="dxa"/>
          <w:bottom w:w="140" w:type="dxa"/>
          <w:right w:w="180" w:type="dxa"/>
        </w:tcMar>
        <w:vAlign w:val="center"/>
      </w:tcPr>
      <w:p>
        <w:pPr><w:spacing w:after="0" w:line="252" w:lineRule="auto"/></w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/>
            ${bold}
            <w:color w:val="${color}"/>
            <w:sz w:val="20"/>
            <w:szCs w:val="20"/>
          </w:rPr>
          <w:t xml:space="preserve">${escapeXml(text)}</w:t>
        </w:r>
      </w:p>
    </w:tc>`;
}

function tableXml(rows, columnWidths, options = {}) {
  return `
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="${columnWidths.reduce((sum, width) => sum + width, 0)}" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="8" w:space="0" w:color="${docxColors.line}"/>
          <w:left w:val="single" w:sz="8" w:space="0" w:color="${docxColors.line}"/>
          <w:bottom w:val="single" w:sz="8" w:space="0" w:color="${docxColors.line}"/>
          <w:right w:val="single" w:sz="8" w:space="0" w:color="${docxColors.line}"/>
          <w:insideH w:val="single" w:sz="8" w:space="0" w:color="${docxColors.line}"/>
          <w:insideV w:val="single" w:sz="8" w:space="0" w:color="${docxColors.line}"/>
        </w:tblBorders>
        <w:tblCellMar>
          <w:top w:w="0" w:type="dxa"/>
          <w:left w:w="0" w:type="dxa"/>
          <w:bottom w:w="0" w:type="dxa"/>
          <w:right w:w="0" w:type="dxa"/>
        </w:tblCellMar>
      </w:tblPr>
      <w:tblGrid>
        ${columnWidths.map((width) => `<w:gridCol w:w="${width}"/>`).join("")}
      </w:tblGrid>
      ${rows
        .map(
          (row, rowIndex) => `
            <w:tr>
              ${row
                .map((value, cellIndex) =>
                  tableCellXml(value, {
                    width: columnWidths[cellIndex],
                    bold: options.headerRow ? rowIndex === 0 : cellIndex === 0,
                    shading: options.headerRow ? (rowIndex === 0 ? docxColors.headerFill : "") : cellIndex === 0 ? docxColors.headerFill : ""
                  })
                )
                .join("")}
            </w:tr>`
        )
        .join("")}
    </w:tbl>`;
}

function engagementTableXml(rows) {
  return tableXml(rows, [2900, 5500]);
}

function sectionByExportKey(sections, exportKey) {
  return sections.find((section) => section.template.exportKey === exportKey);
}

function nonEmptyRows(section) {
  return section?.data?.rows?.filter((row) => Object.values(row).some((value) => value.trim())) || [];
}

function textBlockXml(text) {
  return String(text || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => bodyXml(line))
    .join("");
}

function selectedSectionTitle(section) {
  if (section.template.section === "Cover") return section.title;
  if (section.template.type === "diagram") return section.title;
  return `${section.template.section}. ${section.title}`;
}

function columnWidthsFor(columns) {
  const count = columns.length;
  if (count === 1) return [8400];
  if (count === 2) return [2900, 5500];
  if (count === 3) return [1800, 2800, 3800];
  if (count === 4) return [1250, 2350, 2400, 2400];
  if (count === 5) return [2000, 1600, 1600, 1600, 1600];
  const width = Math.floor(8400 / Math.max(count, 1));
  return columns.map(() => width);
}

function tableSectionXml(section) {
  const columns = section.template.columns || [];
  if (!columns.length) return "";
  const rows = nonEmptyRows(section).map((row) => columns.map((column) => row[column]?.trim() || ""));
  if (!rows.length) return tableXml([columns], columnWidthsFor(columns), { headerRow: true });
  return tableXml([columns, ...rows], columnWidthsFor(columns), { headerRow: true });
}

function checklistSectionXml(section) {
  return Object.entries(section.data.lists)
    .map(([listName, items]) => {
      const listItems = items.map((item) => item.trim()).filter(Boolean);
      return `
        ${headingXml(listName, 6)}
        ${listItems.length ? listItems.map((item) => bodyXml(`- ${item}`)).join("") : bodyXml("TBC")}`;
    })
    .join("");
}

function diagramSectionXml(section) {
  const { caption, context, generated, pattern } = section.data;
  return `
    ${bodyXml(caption?.trim() || "Diagram caption TBC")}
    ${tableXml(
      [
        ["Field", "Value"],
        ["Pattern", pattern === "mft" ? "Managed file transfer" : "Kiosk / sheep dip"],
        ["Status", generated ? "Preview generated in PoV Studio" : "Diagram not generated yet"],
        ["Context", context?.trim() || "TBC"]
      ],
      [2200, 6200],
      { headerRow: true }
    )}`;
}

function signoffSectionXml(section) {
  const rows = section.data.representatives.map((rep) => [
    rep.party,
    ["Name", rep.name, "Title", rep.title, "Date", rep.date].filter(Boolean).join("  ")
  ]);
  return tableXml(rows, [3200, 5200]);
}

function appendixSectionXml(section) {
  const fields = [
    ["Product References", section.data.references],
    ["Test File Repository", section.data.repository],
    ["Glossary", section.data.glossary],
    ["Document Change Log", section.data.changeLog]
  ];
  return fields
    .filter(([, value]) => value?.trim())
    .map(([label, value]) => `${headingXml(label, 6)}${textBlockXml(value)}`)
    .join("");
}

function selectedSectionContentXml(section) {
  const { data, template } = section;
  if (template.type === "narrative") return textBlockXml(data.draft || data.notes || "TBC");
  if (template.type === "checklist") return checklistSectionXml(section);
  if (template.type === "diagram") return diagramSectionXml(section);
  if (template.type === "signoff") return signoffSectionXml(section);
  if (template.type === "appendix") return appendixSectionXml(section) || bodyXml("TBC");

  const intro = data.intro?.trim() ? textBlockXml(data.intro) : "";
  return `${intro}${tableSectionXml(section)}`;
}

function selectedSectionXml(section) {
  if (section.template.exportKey === "cover.engagementDetails") {
    return `
      ${headingXml("Engagement Details", 4)}
      ${engagementTableXml(getEngagementRows(section))}`;
  }
  return `
    ${headingXml(selectedSectionTitle(section), 4)}
    ${selectedSectionContentXml(section)}`;
}

function buildTemplateDocumentXml(originalXml, sections) {
  const bodyOpen = originalXml.match(/^[\s\S]*?<w:body>/)?.[0];
  if (!bodyOpen) throw new Error("The OPSWAT Word template is missing a document body.");
  const sectPr = originalXml.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/g)?.[0] || "";
  const engagementSection = sectionByExportKey(sections, "cover.engagementDetails");
  const clientName = getRowValue(engagementSection, "Client");
  const selectedSectionsXml = sections.map((section) => selectedSectionXml(section)).join("");

  return `${bodyOpen}
    ${paragraphXml(`${clientName ? `${clientName} ` : ""}OPSWAT Proof of Value Plan & Success Criteria`, {
      style: "Title",
      size: 32,
      bold: true,
      color: docxColors.blue,
      after: 80
    })}
    ${paragraphXml("Critical Infrastructure Protection", {
      style: "Subtitle",
      size: 22,
      color: docxColors.muted,
      after: 360
    })}
    ${selectedSectionsXml}
    ${sectPr}
  </w:body></w:document>`;
}

export async function exportSelectedSectionsDocx(sections) {
  if (!sections.length) throw new Error("Add at least one section before exporting.");
  const engagementSection = sectionByExportKey(sections, "cover.engagementDetails");
  const clientName = getRowValue(engagementSection, "Client") || "PoV";
  const filenameClient = clientName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "pov";

  const templateResponse = await fetch(opswatTemplatePath);
  if (!templateResponse.ok) throw new Error("Unable to load OPSWAT Word template.");

  const zip = await JSZip.loadAsync(await templateResponse.arrayBuffer());
  const originalDocumentXml = await zip.file("word/document.xml").async("string");
  zip.file("word/document.xml", buildTemplateDocumentXml(originalDocumentXml, sections));

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  });
  saveAs(blob, `${filenameClient}-opswat-pov.docx`);
}
