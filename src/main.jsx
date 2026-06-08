import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  ArrowLeft,
  Bell,
  Blocks,
  Bot,
  Box,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Download,
  FileText,
  Gauge,
  GitBranch,
  HelpCircle,
  Layers3,
  LayoutTemplate,
  ListChecks,
  LockKeyhole,
  MoreHorizontal,
  Network,
  PanelLeft,
  Pencil,
  Plus,
  Search,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Table2,
  Target,
  Trash2,
  UserRound,
  WandSparkles
} from "lucide-react";
import kioskIcon from "./assets/product-icons/kiosk_desktop.png";
import mftIcon from "./assets/product-icons/managed_file_transfer_mft.png";
import transferGuardIcon from "./assets/product-icons/transfer_guard.png";
import otSecurityIcon from "./assets/product-icons/ot_Security.png";
import fileBlueIcon from "./assets/other-icons/file_blue.png";
import usbBlueIcon from "./assets/other-icons/usb_blue.png";
import "./styles.css";

const navItems = [
  { label: "PoV Projects", icon: FileText, active: true },
  { label: "Templates", icon: LayoutTemplate },
  { label: "Diagrams", icon: GitBranch },
  { label: "Exports", icon: Download },
  { label: "Settings", icon: Settings }
];

const libraryGroups = [
  { id: "setup", label: "Setup" },
  { id: "plan", label: "Plan" },
  { id: "validate", label: "Validate" },
  { id: "deliver", label: "Deliver" },
  { id: "close", label: "Close" },
  { id: "assets", label: "Assets" }
];

const sectionTemplates = [
  {
    group: "assets",
    section: "Diagram",
    label: "Diagram Generator",
    detail: "Generate an OPSWAT-style architecture or workflow diagram.",
    icon: GitBranch,
    type: "diagram",
    repeatable: true,
    exportKey: "assets.diagram",
    purpose: "Create a reusable diagram block that can be placed anywhere in the PoV document.",
    requiredFields: ["Diagram context", "Diagram pattern", "Caption"]
  },
  {
    group: "setup",
    section: "Cover",
    label: "Engagement Details",
    detail: "Customer, dates, version, classification.",
    icon: FileText,
    type: "table",
    exportKey: "cover.engagementDetails",
    purpose: "Capture the document metadata shown on the cover page.",
    requiredFields: ["Client", "Engagement Type", "AE", "SE", "PoV Duration", "Classification"],
    columns: ["Field", "Value"],
    rows: ["Client", "Engagement Type", "OPSWAT Account Executive", "OPSWAT Solutions Engineer", "PoV Duration", "Document Version", "Classification"]
  },
  {
    group: "setup",
    section: "1",
    label: "Executive Summary",
    detail: "Objectives, scope, and value summary.",
    icon: PanelLeft,
    type: "narrative",
    exportKey: "sections.executiveSummary",
    purpose: "Summarize the customer's drivers, the proposed OPSWAT value, and how the PoV will be run.",
    requiredFields: ["Customer security requirement", "Operational challenge", "PoV duration", "Value statement"],
    ai: { mode: "draft", target: "draft" }
  },
  {
    group: "setup",
    section: "2",
    label: "OPSWAT Products in Scope",
    detail: "Product modules, versions, and purpose.",
    icon: ShieldCheck,
    type: "table",
    exportKey: "sections.productsInScope",
    purpose: "List the OPSWAT products and modules included in the evaluation.",
    requiredFields: ["Product / Module", "Version", "Purpose / Description"],
    columns: ["Product / Module", "Version", "Purpose / Description"],
    ai: { mode: "table", target: "Purpose / Description" }
  },
  {
    group: "setup",
    section: "3",
    label: "Customer Environment & Infrastructure",
    detail: "Environment overview and infrastructure details.",
    icon: Layers3,
    type: "table",
    exportKey: "sections.customerEnvironment",
    purpose: "Describe the customer environment and collect infrastructure parameters.",
    requiredFields: ["Environment overview", "Operating systems", "Network architecture", "Existing security stack"],
    introLabel: "Environment Overview",
    columns: ["Parameter", "Details"],
    rows: ["Deployment location", "Operating system(s)", "Internet connectivity", "Authentication", "Other relevant context"],
    ai: { mode: "intro", target: "intro" }
  },
  {
    group: "plan",
    section: "4",
    label: "Business Challenges, Objectives & Value Outcomes",
    detail: "Challenges, outcomes, and KPIs.",
    icon: Target,
    type: "table",
    exportKey: "sections.businessOutcomes",
    purpose: "Link discovery pain points to measurable value outcomes and evidence sources.",
    requiredFields: ["Business challenge", "Business objective", "KPI / Metric", "Baseline", "Target", "Evidence Source"],
    introLabel: "Business Challenges",
    columns: ["Business Objective", "KPI / Metric", "Baseline", "Target", "Evidence Source"]
  },
  {
    group: "plan",
    section: "5",
    label: "Scope",
    detail: "In-scope and out-of-scope boundaries.",
    icon: ClipboardCheck,
    type: "checklist",
    exportKey: "sections.scope",
    purpose: "Define what the PoV will and will not cover.",
    requiredFields: ["In-scope items", "Out-of-scope items"],
    lists: ["In Scope", "Out of Scope"]
  },
  {
    group: "plan",
    section: "6",
    label: "Assumptions & Dependencies",
    detail: "Dependencies, owners, and impact notes.",
    icon: ListChecks,
    type: "table",
    exportKey: "sections.assumptionsDependencies",
    purpose: "Track assumptions that affect PoV timeline or success.",
    requiredFields: ["Assumption / Dependency", "Owner / Notes"],
    columns: ["Assumption / Dependency", "Owner / Notes"]
  },
  {
    group: "plan",
    section: "12",
    label: "PoV Timeline & Milestones",
    detail: "Phases, activities, dates, and close-out.",
    icon: Clock3,
    type: "timeline",
    exportKey: "sections.timelineMilestones",
    purpose: "Define PoV phases, activities, descriptions, and target dates.",
    requiredFields: ["Phase", "Activity", "Description", "Target Date"],
    columns: ["Phase", "Activity", "Description", "Target Date"]
  },
  {
    group: "plan",
    section: "13",
    label: "Governance, Communication & Escalation",
    detail: "Cadence, channels, escalation path, and SLAs.",
    icon: Network,
    type: "table",
    exportKey: "sections.governanceEscalation",
    purpose: "Capture operating cadence, collaboration channels, and escalation contacts.",
    requiredFields: ["Cadence / Channel", "Escalation level", "Contacts", "SLA"],
    introLabel: "Cadence & Channels",
    columns: ["Mechanism / Level", "Description / Contact", "SLA / Use"]
  },
  {
    group: "validate",
    section: "7",
    label: "Success Criteria",
    detail: "Verdicts, priorities, and success matrix.",
    icon: Table2,
    type: "table",
    exportKey: "sections.successCriteria",
    purpose: "Define measurable criteria, validation methods, thresholds, and verdicts.",
    requiredFields: ["Priority", "Success Criterion", "Validation Method", "Threshold / Target"],
    columns: ["Priority", "Success Criterion", "Validation Method", "Threshold / Target", "Verdict"]
  },
  {
    group: "validate",
    section: "8",
    label: "Exit Criteria & Failure Definition",
    detail: "Pass, conditional pass, fail, and early exit.",
    icon: Gauge,
    type: "checklist",
    exportKey: "sections.exitCriteria",
    purpose: "Define pass/fail rubric and early-exit triggers.",
    requiredFields: ["Pass criteria", "Conditional pass criteria", "Fail criteria", "Early-exit triggers"],
    lists: ["Pass / Fail Rubric", "Early-Exit Triggers"]
  },
  {
    group: "validate",
    section: "9",
    label: "Use Cases to Be Validated",
    detail: "Use-case IDs, descriptions, and products.",
    icon: GitBranch,
    type: "table",
    exportKey: "sections.useCases",
    purpose: "List the PoV validation scenarios and associated products.",
    requiredFields: ["Use Case", "Description", "Product(s)"],
    columns: ["ID", "Use Case", "Description", "Product(s)"]
  },
  {
    group: "validate",
    section: "10",
    label: "Test Data & Sample Set Definition",
    detail: "Data sets, ownership, volume, handling.",
    icon: FileText,
    type: "table",
    exportKey: "sections.testData",
    purpose: "Define representative test data, source owners, and handling rules.",
    requiredFields: ["Data Set", "Purpose", "Source / Owner", "Handling rules"],
    introLabel: "Volume targets and handling rules",
    columns: ["Data Set", "Purpose", "Source / Owner"]
  },
  {
    group: "validate",
    section: "11",
    label: "Compliance & Control Mapping",
    detail: "Framework controls mapped to capabilities.",
    icon: LockKeyhole,
    type: "table",
    exportKey: "sections.complianceMapping",
    purpose: "Map customer frameworks and controls to demonstrated OPSWAT capabilities.",
    requiredFields: ["Framework / Regulation", "Control Reference", "OPSWAT Capability", "PoV Criterion #"],
    columns: ["Framework / Regulation", "Control Reference", "OPSWAT Capability Demonstrated", "PoV Criterion #"]
  },
  {
    group: "deliver",
    section: "14",
    label: "Roles & Responsibilities",
    detail: "OPSWAT and customer stakeholders.",
    icon: UserRound,
    type: "table",
    exportKey: "sections.rolesResponsibilities",
    purpose: "Capture stakeholder names and responsibilities.",
    requiredFields: ["Role", "Name", "Responsibilities"],
    columns: ["Role", "Name", "Responsibilities"]
  },
  {
    group: "deliver",
    section: "15",
    label: "RACI Matrix",
    detail: "Responsibility assignment across activities.",
    icon: Table2,
    type: "matrix",
    exportKey: "sections.raciMatrix",
    purpose: "Assign Responsible, Accountable, Consulted, and Informed roles for key tasks.",
    requiredFields: ["Activity / Task", "Customer Tech", "Customer Mgr", "OPSWAT Tech", "OPSWAT Mgr"],
    columns: ["Activity / Task", "Customer Tech", "Customer Mgr", "OPSWAT Tech", "OPSWAT Mgr"]
  },
  {
    group: "deliver",
    section: "16",
    label: "Technical Prerequisites & Installation Requirements",
    detail: "Prerequisites, ports, URLs, and checklists.",
    icon: Settings,
    type: "checklist",
    exportKey: "sections.technicalPrerequisites",
    purpose: "Collect product prerequisites, network requirements, and pre-kick-off checklist items.",
    requiredFields: ["Product prerequisites", "Network requirements", "General checklist"],
    lists: ["Product Prerequisites", "Network Requirements", "General Pre-Kick-off Checklist"]
  },
  {
    group: "deliver",
    section: "17",
    label: "Data Handling, Confidentiality & Security",
    detail: "Data, malware samples, logs, credentials.",
    icon: LockKeyhole,
    type: "table",
    exportKey: "sections.dataHandlingSecurity",
    purpose: "Define how customer data, malware samples, logs, credentials, and retention are handled.",
    requiredFields: ["Topic", "Handling"],
    columns: ["Topic", "Handling"]
  },
  {
    group: "deliver",
    section: "18",
    label: "Training & Knowledge Transfer",
    detail: "Sessions, audiences, and outcomes.",
    icon: ClipboardCheck,
    type: "table",
    exportKey: "sections.trainingKnowledgeTransfer",
    purpose: "Define training sessions, intended audiences, and outcomes.",
    requiredFields: ["Session", "Audience", "Outcome"],
    columns: ["Session", "Audience", "Outcome"]
  },
  {
    group: "deliver",
    section: "19",
    label: "Risk & Issue Log",
    detail: "Risks, likelihood, impact, mitigation.",
    icon: Gauge,
    type: "table",
    exportKey: "sections.riskIssueLog",
    purpose: "Track PoV risks and issues with likelihood, impact, and mitigation.",
    requiredFields: ["Risk / Issue", "Likelihood", "Impact", "Mitigation"],
    columns: ["Risk / Issue", "Likelihood", "Impact", "Mitigation"]
  },
  {
    group: "close",
    section: "20",
    label: "Post-PoV Next Steps & Conversion Plan",
    detail: "Commercial, deployment, readiness, support.",
    icon: Send,
    type: "table",
    exportKey: "sections.nextStepsConversion",
    purpose: "Define the path from a successful PoV into production.",
    requiredFields: ["Workstream", "Activity"],
    columns: ["Workstream", "Activity"]
  },
  {
    group: "close",
    section: "21",
    label: "Decommissioning & Wind-Down",
    detail: "Cleanup and licence/data handling.",
    icon: ListChecks,
    type: "checklist",
    exportKey: "sections.decommissioning",
    purpose: "Capture close-out cleanup tasks for software, data, licences, accounts, and firewall rules.",
    requiredFields: ["Wind-down tasks"],
    lists: ["Wind-Down Tasks"]
  },
  {
    group: "close",
    section: "22",
    label: "PoV Agreement & Sign-Off",
    detail: "OPSWAT and customer acknowledgement.",
    icon: Pencil,
    type: "signoff",
    exportKey: "sections.signoff",
    purpose: "Collect OPSWAT and customer sign-off fields.",
    requiredFields: ["OPSWAT Representative", "Customer Representative"]
  },
  {
    group: "close",
    section: "23",
    label: "Appendix",
    detail: "References, repository, glossary, change log.",
    icon: Blocks,
    type: "appendix",
    exportKey: "sections.appendix",
    purpose: "Collect product references, test repository notes, glossary additions, and change log entries.",
    requiredFields: ["Product references", "Test file repository", "Glossary", "Change log"]
  }
];

const emptyRow = (columns) => Object.fromEntries(columns.map((column) => [column, ""]));

function splitIntakeList(value) {
  return String(value || "")
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createSectionData(template) {
  if (template.type === "diagram") {
    return {
      context: "",
      caption: "",
      pattern: "kiosk",
      generated: false
    };
  }
  if (template.type === "narrative") return { notes: "", draft: "", citations: [] };
  if (template.type === "checklist") return { lists: Object.fromEntries(template.lists.map((list) => [list, [""]])) };
  if (template.type === "timeline" || template.type === "matrix" || template.type === "table") {
    return {
      intro: "",
      rows: template.rows
        ? template.rows.map((label) => ({ ...emptyRow(template.columns), [template.columns[0]]: label }))
        : [emptyRow(template.columns)]
    };
  }
  if (template.type === "signoff") {
    return {
      representatives: [
        { party: "OPSWAT Representative", name: "", title: "", date: "" },
        { party: "Customer Representative", name: "", title: "", date: "" }
      ]
    };
  }
  return { references: "", repository: "", glossary: "", changeLog: "" };
}

function hydrateSectionDataFromIntake(template, data, intake) {
  if (template.exportKey === "cover.engagementDetails") {
    return {
      ...data,
      rows: data.rows.map((row) => {
        const valueByField = {
          Client: intake.customer,
          "Engagement Type": "Proof of Value (PoV)",
          "OPSWAT Account Executive": intake.accountExecutive,
          "OPSWAT Solutions Engineer": intake.solutionsEngineer,
          "PoV Duration": [intake.startDate, intake.endDate].filter(Boolean).join(" - "),
          "Document Version": "v1.0",
          Classification: "Confidential"
        };
        return { ...row, Value: valueByField[row.Field] || row.Value };
      })
    };
  }
  if (template.exportKey === "sections.executiveSummary") {
    return {
      ...data,
      notes: [intake.customer && `Customer: ${intake.customer}`, intake.industry && `Industry: ${intake.industry}`, intake.challenges && `Business challenges: ${intake.challenges}`, intake.useCases && `Use cases discussed: ${intake.useCases}`, intake.products && `Products in scope: ${intake.products}`, intake.compliance && `Compliance drivers: ${intake.compliance}`]
        .filter(Boolean)
        .join("\n")
    };
  }
  if (template.exportKey === "sections.productsInScope") {
    const products = splitIntakeList(intake.products);
    if (!products.length) return data;
    return {
      ...data,
      rows: products.map((product) => ({
        "Product / Module": product,
        Version: "",
        "Purpose / Description": ""
      }))
    };
  }
  if (template.exportKey === "sections.customerEnvironment") {
    return {
      ...data,
      intro: [intake.customer && `${intake.customer} operates in the ${intake.industry || "specified"} sector.`, intake.challenges && `Key discovery context: ${intake.challenges}`]
        .filter(Boolean)
        .join(" "),
      rows: data.rows.map((row) =>
        row.Parameter === "Other relevant context" && intake.compliance
          ? { ...row, Details: `Compliance drivers: ${intake.compliance}` }
          : row
      )
    };
  }
  if (template.exportKey === "sections.useCases") {
    const useCases = splitIntakeList(intake.useCases);
    if (!useCases.length) return data;
    return {
      ...data,
      rows: useCases.map((useCase, index) => ({
        ID: `UC-${index + 1}`,
        "Use Case": useCase,
        Description: "",
        "Product(s)": intake.products || ""
      }))
    };
  }
  return data;
}

function hasSectionInput(section) {
  const { data, template } = section;
  if (template.type === "diagram") return Boolean(data.context.trim());
  if (template.type === "narrative") return Boolean(data.notes.trim() || data.draft.trim());
  if (template.type === "checklist") return Object.values(data.lists).flat().some((item) => item.trim());
  if (template.type === "signoff") return data.representatives.some((rep) => rep.name.trim() || rep.title.trim() || rep.date.trim());
  if (template.type === "appendix") return Object.values(data).some((value) => value.trim());
  return Boolean(data.intro?.trim()) || data.rows.some((row) => Object.values(row).some((value) => value.trim()));
}

const docxColors = {
  blue: "1363DF",
  navy: "061B3A",
  muted: "5E6D84",
  line: "D9E2F1",
  headerFill: "EEF4FF",
  white: "FFFFFF"
};

const opswatTemplatePath = "/templates/opswat_word_doc.docx";
const simplonNorm = "Simplon Norm";
const simplonNormBold = "Simplon Norm Bold";

function getRowValue(section, fieldName) {
  const row = section?.data?.rows?.find((item) => item.Field === fieldName);
  return row?.Value?.trim() || "";
}

function getTableValue(section, firstColumnValue, columnName) {
  const firstColumn = section?.template?.columns?.[0];
  const row = section?.data?.rows?.find((item) => item[firstColumn] === firstColumnValue);
  return row?.[columnName]?.trim() || "";
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

async function exportSelectedSectionsDocx(sections) {
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

const emptyIntake = {
  customer: "",
  industry: "",
  products: "",
  challenges: "",
  useCases: "",
  compliance: "",
  startDate: "",
  endDate: "",
  accountExecutive: "",
  solutionsEngineer: "",
  tone: ""
};

function getAiPlan(section) {
  if (!section?.template?.ai) return null;
  return section.template.ai;
}

function getAiReadiness(section, intake) {
  if (!section) return { ready: false, reason: "Select a setup section first." };
  const plan = getAiPlan(section);
  if (!plan) return { ready: false, reason: "This section is structured manually and does not need AI drafting." };
  if (!intake.customer.trim()) return { ready: false, reason: "Add the customer name in PoV Intake." };
  if (!intake.industry.trim()) return { ready: false, reason: "Add the customer industry in PoV Intake." };
  if (section.template.exportKey === "sections.executiveSummary" && !intake.challenges.trim()) {
    return { ready: false, reason: "Add business challenges before drafting the executive summary." };
  }
  if (section.template.exportKey === "sections.productsInScope") {
    const hasProducts = intake.products.trim() || section.data.rows.some((row) => row["Product / Module"]?.trim());
    if (!hasProducts) return { ready: false, reason: "Add products in scope in PoV Intake or the product table." };
  }
  if (section.template.exportKey === "sections.customerEnvironment" && !intake.challenges.trim() && !section.data.rows.some((row) => row.Details?.trim())) {
    return { ready: false, reason: "Add environment details or business context before drafting the overview." };
  }
  return { ready: true, reason: "Ready to generate this section." };
}

function serializeSection(section) {
  return {
    id: section.id,
    title: section.title,
    exportKey: section.template.exportKey,
    type: section.template.type,
    ai: section.template.ai,
    columns: section.template.columns || [],
    data: section.data
  };
}

function applyGeneratedSection(sectionId, payload, updateSectionData) {
  updateSectionData(sectionId, (current) => {
    if (payload.target === "draft") {
      return { ...current, draft: payload.draft || current.draft, citations: payload.citations || [] };
    }
    if (payload.target === "intro") {
      return { ...current, intro: payload.draft || current.intro, citations: payload.citations || [] };
    }
    if (payload.target === "Purpose / Description" && Array.isArray(payload.rows)) {
      return {
        ...current,
        rows: current.rows.map((row, index) => ({
          ...row,
          "Purpose / Description": payload.rows[index]?.["Purpose / Description"] || row["Purpose / Description"]
        })),
        citations: payload.citations || []
      };
    }
    return current;
  });
}

function App() {
  const [documentStage, setDocumentStage] = useState("start");
  const [isContextEditing, setIsContextEditing] = useState(false);
  const [activeLibraryGroup, setActiveLibraryGroup] = useState("setup");
  const [sections, setSections] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [isDropActive, setIsDropActive] = useState(false);
  const [draggedSectionId, setDraggedSectionId] = useState(null);
  const [intake, setIntake] = useState(emptyIntake);
  const [isExporting, setIsExporting] = useState(false);

  const activeSection = sections.find((section) => section.id === activeSectionId) || null;
  const visibleLibraryItems = sectionTemplates.filter((item) => item.group === activeLibraryGroup);
  const addedSectionIds = new Set(sections.map((section) => section.id));
  const activeAiPlan = getAiPlan(activeSection);
  const aiReadiness = getAiReadiness(activeSection, intake);
  const canGenerateActiveSection = Boolean(activeAiPlan && aiReadiness.ready);
  const canExportSections = sections.length > 0;
  const [isGenerating, setIsGenerating] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState("");
  const projectTitle = intake.customer.trim() ? `${intake.customer} PoV` : "New PoV";

  function createSection(template) {
    const id = template.repeatable ? `${template.section}-${crypto.randomUUID()}` : template.section;
    const baseData = createSectionData(template);
    return {
      id,
      title: template.label,
      subtitle: template.detail,
      icon: template.icon,
      template,
      data: hydrateSectionDataFromIntake(template, baseData, intake),
      reviewState: "Not started"
    };
  }

  function addSection(sectionId, insertIndex = sections.length) {
    const template = sectionTemplates.find((item) => item.section === sectionId);
    if (!template || (!template.repeatable && addedSectionIds.has(sectionId))) return;
    const nextSection = createSection(template);
    setSections((current) => {
      const next = [...current];
      next.splice(insertIndex, 0, nextSection);
      return next;
    });
    setActiveSectionId(nextSection.id);
  }

  function removeSection(sectionId) {
    setSections((current) => current.filter((section) => section.id !== sectionId));
    setActiveSectionId((current) => (current === sectionId ? null : current));
  }

  function moveSection(sourceIndex, targetIndex) {
    if (sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0) return;
    setSections((current) => {
      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  }

  function updateSectionData(sectionId, updater) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              data: typeof updater === "function" ? updater(section.data) : updater,
              reviewState: "In progress"
            }
          : section
      )
    );
  }

  function handleLibraryDragStart(event, sectionId) {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/x-pov-section", sectionId);
  }

  function handleDocumentDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDropActive(true);
  }

  function handleDocumentDrop(event) {
    event.preventDefault();
    setIsDropActive(false);
    const sectionId = event.dataTransfer.getData("application/x-pov-section");
    if (sectionId) addSection(sectionId);
  }

  function handleRowDragStart(event, index) {
    setDraggedSectionId(sections[index].id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-pov-row-index", String(index));
  }

  function handleRowDrop(event, targetIndex) {
    event.preventDefault();
    const sourceIndex = Number(event.dataTransfer.getData("application/x-pov-row-index"));
    if (Number.isInteger(sourceIndex)) moveSection(sourceIndex, targetIndex);
    setDraggedSectionId(null);
  }

  function handleDropToEnd(event) {
    event.preventDefault();
    const sourceIndex = Number(event.dataTransfer.getData("application/x-pov-row-index"));
    const sectionId = event.dataTransfer.getData("application/x-pov-section");
    if (Number.isInteger(sourceIndex)) moveSection(sourceIndex, sections.length - 1);
    if (sectionId) addSection(sectionId);
    setDraggedSectionId(null);
    setIsDropActive(false);
  }

  function updateIntake(field, value) {
    setIntake((current) => ({ ...current, [field]: value }));
  }

  function enterEditor() {
    setDocumentStage("editor");
    setIsContextEditing(false);
  }

  async function handleGenerateSection() {
    if (!activeSection || !canGenerateActiveSection || isGenerating) return;
    setIsGenerating(true);
    setAssistantMessage("");
    try {
      const response = await fetch("/api/generate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: serializeSection(activeSection),
          intake
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "AI generation failed.");
      applyGeneratedSection(activeSection.id, payload, updateSectionData);
      setAssistantMessage(payload.citations?.length ? `Draft generated with ${payload.citations.length} retrieved source reference(s).` : "Draft generated.");
    } catch (error) {
      setAssistantMessage(error.message || "AI generation is unavailable.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleExport() {
    if (!canExportSections || isExporting) return;
    setIsExporting(true);
    try {
      await exportSelectedSectionsDocx(sections);
    } catch (error) {
      console.error(error);
      window.alert("The OPSWAT Word export could not be created. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="opswat-wordmark">OPSWAT.</span>
          <span className="brand-subtitle">PoV Studio</span>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button className={`nav-item ${item.active ? "active" : ""}`} key={item.label}>
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <button className="support">
          <HelpCircle size={20} />
          <span>Help & Support</span>
          <ChevronDown size={16} />
        </button>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="project-title">
            <button className="icon-button" aria-label="Back">
              <ArrowLeft size={19} />
            </button>
            <h1>{projectTitle}</h1>
            <span className="version-pill">{documentStage === "editor" ? "Structured Draft" : "Document Setup"}</span>
          </div>
          <div className="top-actions">
            <label className="environment-select">
              <span>Environment</span>
              <select value="" disabled>
                <option value="">None</option>
              </select>
            </label>
            <div className="search-box">
              <Search size={18} />
              <input aria-label="Search" />
            </div>
            <button className="icon-button notification empty" aria-label="Notifications">
              <Bell size={19} />
            </button>
            <div className="profile empty-profile">
              <div className="avatar">--</div>
              <div>
                <strong>Not signed in</strong>
                <span>No role assigned</span>
              </div>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        {documentStage !== "editor" ? (
          <DocumentSetup
            intake={intake}
            onBack={() => setDocumentStage("start")}
            onChange={updateIntake}
            onCreate={() => setDocumentStage("context")}
            onSubmit={enterEditor}
            stage={documentStage}
          />
        ) : (
        <section className="editor">
          <div className="editor-main">
            <div className="toolbar">
              <div className="toolbar-group">
                <button className="view-button" disabled>
                  View
                  <strong>Outline</strong>
                  <ChevronDown size={15} />
                </button>
              </div>
              <div className="toolbar-group">
                <button className="secondary-button" disabled>
                  <Gauge size={17} />
                  Preview
                </button>
                <button className="secondary-button" disabled>
                  <Share2 size={17} />
                  Share
                </button>
                <button className="icon-button" aria-label="More options">
                  <MoreHorizontal size={19} />
                </button>
                <button className={`primary-button ${canExportSections ? "" : "disabled"}`} disabled={!canExportSections || isExporting} onClick={handleExport}>
                  {isExporting ? "Exporting" : "Export"}
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>

            <div className="content-grid">
              <SectionLibrary
                activeGroup={activeLibraryGroup}
                addedSectionIds={addedSectionIds}
                onAddSection={addSection}
                onDragStart={handleLibraryDragStart}
                onGroupChange={setActiveLibraryGroup}
                visibleItems={visibleLibraryItems}
              />
              <section
                className={`document-panel ${isDropActive ? "drop-active" : ""}`}
                onDragLeave={() => setIsDropActive(false)}
                onDragOver={handleDocumentDragOver}
                onDrop={handleDocumentDrop}
              >
                {sections.length === 0 ? (
                  <div className="empty-state">
                    <FileText size={36} />
                    <strong>No sections added</strong>
                    <span>Drag sections from the library into this area to structure the document.</span>
                  </div>
                ) : (
                  <div className="structured-workspace">
                    <div className="sections-list" aria-label="Added document sections">
                      {sections.map((section, index) => (
                        <SectionRow
                          active={section.id === activeSectionId}
                          dragging={section.id === draggedSectionId}
                          index={index}
                          key={section.id}
                          onClick={() => setActiveSectionId(section.id)}
                          onDragStart={(event) => handleRowDragStart(event, index)}
                          onDrop={(event) => handleRowDrop(event, index)}
                          onRemove={() => removeSection(section.id)}
                          section={section}
                        />
                      ))}
                      <div className="drop-to-end" onDragOver={(event) => event.preventDefault()} onDrop={handleDropToEnd}>
                        Drop here to add another section
                      </div>
                    </div>
                    <SectionEditor section={activeSection} onUpdate={updateSectionData} />
                  </div>
                )}
              </section>
            </div>
          </div>

          <aside className="assistant-panel">
            <div className="assistant-title">
              <span className="assistant-mark">
                <Bot size={22} />
              </span>
              <div>
                <h2>PoV Context</h2>
                <p>{canGenerateActiveSection ? "Selected section can use this context" : aiReadiness.reason}</p>
              </div>
            </div>
            {isContextEditing ? (
              <PovContextForm
                compact
                intake={intake}
                onBack={() => setIsContextEditing(false)}
                onChange={updateIntake}
                onSubmit={() => setIsContextEditing(false)}
              />
            ) : (
              <ContextSummary intake={intake} onEdit={() => setIsContextEditing(true)} />
            )}
            <div className="assistant-copy">
              <strong>Generate selected section</strong>
              <span>{activeSection ? activeSection.title : "No section selected"}</span>
            </div>
            <button className={`generate-button ${canGenerateActiveSection ? "" : "disabled"}`} disabled={!canGenerateActiveSection || isGenerating} onClick={handleGenerateSection}>
              {isGenerating ? "Generating Section" : "Generate With Context"}
              <WandSparkles size={18} />
            </button>
            {assistantMessage && <div className={`assistant-message ${assistantMessage.includes("unavailable") || assistantMessage.includes("failed") ? "error" : ""}`}>{assistantMessage}</div>}
            <div className="assistant-actions">
              <button disabled>
                <Sparkles size={16} />
                Generate Full Draft
              </button>
              <button disabled>
                <Network size={16} />
                Add Diagram
              </button>
            </div>
            <button className="outline-button" disabled>
              <Send size={16} />
              Send to Review
            </button>
            <div className="tip-box neutral">
              <Sparkles size={18} />
              <div>
                <strong>Context-aware drafting</strong>
                <p>Customer details, use cases, products, compliance drivers, and tone are sent with future AI operations.</p>
              </div>
            </div>
          </aside>
        </section>
        )}
      </main>
    </div>
  );
}

function SectionLibrary({ activeGroup, addedSectionIds, onAddSection, onDragStart, onGroupChange, visibleItems }) {
  return (
    <aside className="section-library">
      <div className="panel-heading">
        <div>
          <h2>Section Library</h2>
          <p>{sectionTemplates.length} template sections available</p>
        </div>
        <button className="icon-button compact" aria-label="Close library">
          <ChevronDown size={16} />
        </button>
      </div>
      <div className="library-group-tabs" aria-label="Template section groups">
        {libraryGroups.map((group) => (
          <button className={group.id === activeGroup ? "active" : ""} key={group.id} onClick={() => onGroupChange(group.id)}>
            {group.label}
          </button>
        ))}
      </div>
      <div className="library-group-summary">
        <strong>{libraryGroups.find((group) => group.id === activeGroup)?.label}</strong>
        <span>{visibleItems.length} sections</span>
      </div>
      <div className="library-list">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isAdded = !item.repeatable && addedSectionIds.has(item.section);
          return (
            <button
              className={`library-card ${isAdded ? "added" : ""}`}
              draggable={!isAdded}
              key={item.label}
              onDragStart={(event) => onDragStart(event, item.section)}
              onDoubleClick={() => onAddSection(item.section)}
              title={isAdded ? "Already added" : "Drag or double-click to add"}
            >
              <span className="template-section-number">{item.section}</span>
              <span>
                <strong>{item.label}</strong>
                <em>{item.detail}</em>
              </span>
              {isAdded ? <span className="added-pill">Added</span> : <Icon size={18} />}
            </button>
          );
        })}
      </div>
      <button className="template-import">
        <FileText size={18} />
        Import from template
        <ChevronDown size={16} />
      </button>
    </aside>
  );
}

function DocumentSetup({ intake, onBack, onChange, onCreate, onSubmit, stage }) {
  if (stage === "start") {
    return (
      <section className="document-setup">
        <div className="setup-start">
          <span className="setup-icon">
            <FileText size={32} />
          </span>
          <div>
            <h2>Create a customer PoV document</h2>
            <p>Start by capturing the customer context that will guide section suggestions, AI drafting, diagrams, and final export.</p>
          </div>
          <button className="primary-button setup-create" onClick={onCreate}>
            <Plus size={18} />
            Create New Document
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="document-setup">
      <div className="setup-form-panel">
        <div className="setup-form-heading">
          <div>
            <h2>PoV Context</h2>
            <p>This context will travel with every future AI operation in the document.</p>
          </div>
          <button className="secondary-button" onClick={onBack}>
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
        <PovContextForm intake={intake} onBack={onBack} onChange={onChange} onSubmit={onSubmit} />
      </div>
    </section>
  );
}

function PovContextForm({ compact = false, intake, onBack, onChange, onSubmit }) {
  const shortFields = [
    ["customer", "Customer"],
    ["industry", "Industry"],
    ["products", "Products in scope"],
    ["compliance", "Compliance drivers"],
    ["startDate", "PoV start date"],
    ["endDate", "PoV end date"],
    ["accountExecutive", "Account Executive"],
    ["solutionsEngineer", "Solutions Engineer"]
  ];
  const longFields = [
    ["challenges", "Business challenges"],
    ["useCases", "Use cases discussed"]
  ];

  return (
    <div className={`context-form ${compact ? "compact" : ""}`}>
      <div className="context-form-grid">
        {shortFields.map(([field, label]) => (
          <label className="field" key={field}>
            <span>{label}</span>
            <div className="input-shell">
              <Box size={17} />
              <input aria-label={label} value={intake[field]} onChange={(event) => onChange(field, event.target.value)} />
            </div>
          </label>
        ))}
      </div>
      {longFields.map(([field, label]) => (
        <label className="field wide" key={field}>
          <span>{label}</span>
          <div className="input-shell textarea-shell">
            <Box size={17} />
            <textarea aria-label={label} value={intake[field]} onChange={(event) => onChange(field, event.target.value)} />
          </div>
        </label>
      ))}
      <label className="field">
        <span>Tone</span>
        <select value={intake.tone} onChange={(event) => onChange("tone", event.target.value)}>
          <option value="">None</option>
          <option>Professional</option>
          <option>Executive</option>
          <option>Technical</option>
        </select>
      </label>
      <div className="context-form-actions">
        {compact && (
          <button className="secondary-button" onClick={onBack}>
            Cancel
          </button>
        )}
        <button className="primary-button" onClick={onSubmit}>
          {compact ? "Save Context" : "Continue to Editor"}
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  );
}

function ContextSummary({ intake, onEdit }) {
  const summaryItems = [
    ["Customer", intake.customer],
    ["Industry", intake.industry],
    ["Products", intake.products],
    ["Use cases", intake.useCases],
    ["Compliance", intake.compliance],
    ["Tone", intake.tone]
  ].filter(([, value]) => value?.trim());

  return (
    <div className="context-summary">
      <div className="context-summary-head">
        <strong>{intake.customer || "Untitled PoV"}</strong>
        <button className="secondary-button compact-text" onClick={onEdit}>
          <Pencil size={15} />
          Edit
        </button>
      </div>
      {summaryItems.length ? (
        <div className="context-summary-list">
          {summaryItems.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <p>{value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="context-empty">Add customer context before generating section content.</p>
      )}
    </div>
  );
}

function SectionRow({ active, dragging, index, onClick, onDragStart, onDrop, onRemove, section }) {
  const Icon = section.icon;
  const hasInput = hasSectionInput(section);
  return (
    <article
      className={`section-row ${active ? "active" : ""} ${dragging ? "dragging" : ""}`}
      onClick={onClick}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      <div className="row-top">
        <button className="drag-handle" draggable aria-label={`Move ${section.title}`} onDragStart={onDragStart}>
          ::
        </button>
        <button className="section-number">{index + 1}</button>
        <div className="section-copy">
          <strong>{section.title}</strong>
          <span>
            Template {section.template.section} · {section.template.type} · {section.template.exportKey}
          </span>
        </div>
        <span className={`review-pill ${hasInput ? "started" : ""}`}>{hasInput ? "Input" : "Empty"}</span>
        <span className="status pending">
          <Icon size={17} />
        </span>
        <button
          className="icon-button compact"
          draggable={false}
          aria-label={`Remove ${section.title}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onRemove();
          }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}

function SectionEditor({ section, onUpdate }) {
  if (!section) {
    return (
      <div className="section-editor empty-editor">
        <PanelLeft size={32} />
        <strong>Select a section</strong>
        <span>Choose a section from the document outline to edit its structured inputs.</span>
      </div>
    );
  }

  const { template } = section;
  return (
    <div className="section-editor">
      <div className="editor-heading">
        <div>
          <span className="template-section-number">{template.section}</span>
          <div>
            <h2>{template.label}</h2>
            <p>{template.purpose}</p>
          </div>
        </div>
        <span className="type-pill">{template.type}</span>
      </div>

      <div className="required-fields">
        <strong>Required inputs</strong>
        <div>
          {template.requiredFields.map((field) => (
            <span key={field}>{field}</span>
          ))}
        </div>
      </div>

      {template.type === "narrative" && <NarrativeEditor section={section} onUpdate={onUpdate} />}
      {template.type === "diagram" && <DiagramEditor section={section} onUpdate={onUpdate} />}
      {(template.type === "table" || template.type === "timeline" || template.type === "matrix") && (
        <TableSectionEditor section={section} onUpdate={onUpdate} />
      )}
      {template.type === "checklist" && <ChecklistEditor section={section} onUpdate={onUpdate} />}
      {template.type === "signoff" && <SignoffEditor section={section} onUpdate={onUpdate} />}
      {template.type === "appendix" && <AppendixEditor section={section} onUpdate={onUpdate} />}
    </div>
  );
}

function NarrativeEditor({ section, onUpdate }) {
  return (
    <div className="structured-form">
      <label className="form-field wide">
        <span>Source notes for this section</span>
        <textarea
          value={section.data.notes}
          onChange={(event) => onUpdate(section.id, { ...section.data, notes: event.target.value })}
        />
      </label>
      <label className="form-field wide">
        <span>Reviewed draft</span>
        <textarea
          value={section.data.draft}
          onChange={(event) => onUpdate(section.id, { ...section.data, draft: event.target.value })}
        />
      </label>
    </div>
  );
}

function TableSectionEditor({ section, onUpdate }) {
  const { template, data } = section;
  const isEngagementDetails = template.exportKey === "cover.engagementDetails";
  const gridTemplateColumns = isEngagementDetails
    ? `minmax(190px, 0.7fr) minmax(240px, 1fr)`
    : `repeat(${template.columns.length}, minmax(130px, 1fr)) 36px`;

  function updateCell(rowIndex, column, value) {
    onUpdate(section.id, (current) => ({
      ...current,
      rows: current.rows.map((row, index) => (index === rowIndex ? { ...row, [column]: value } : row))
    }));
  }

  function addRow() {
    onUpdate(section.id, (current) => ({ ...current, rows: [...current.rows, emptyRow(template.columns)] }));
  }

  function removeRow(rowIndex) {
    onUpdate(section.id, (current) => ({ ...current, rows: current.rows.filter((_, index) => index !== rowIndex) }));
  }

  return (
    <div className="structured-form">
      {template.introLabel && (
        <label className="form-field wide">
          <span>{template.introLabel}</span>
          <textarea value={data.intro} onChange={(event) => onUpdate(section.id, { ...data, intro: event.target.value })} />
        </label>
      )}
      <div className="structured-table">
        <div className="structured-table-head" style={{ gridTemplateColumns }}>
          {template.columns.map((column) => (
            <strong key={column}>{column}</strong>
          ))}
          {!isEngagementDetails && <span />}
        </div>
        {data.rows.map((row, rowIndex) => (
          <div className="structured-table-row" key={rowIndex} style={{ gridTemplateColumns }}>
            {template.columns.map((column) => (
              <input key={column} disabled={isEngagementDetails && column === "Field"} value={row[column] || ""} onChange={(event) => updateCell(rowIndex, column, event.target.value)} />
            ))}
            {!isEngagementDetails && (
              <button className="icon-button compact" aria-label="Remove row" onClick={() => removeRow(rowIndex)}>
                <Trash2 size={15} />
              </button>
            )}
          </div>
        ))}
      </div>
      {!isEngagementDetails && (
        <button className="add-row-button" onClick={addRow}>
          <Plus size={16} />
          Add row
        </button>
      )}
    </div>
  );
}

function DiagramEditor({ section, onUpdate }) {
  const { data } = section;
  const canGenerate = Boolean(data.context.trim());

  function update(field, value) {
    onUpdate(section.id, { ...data, [field]: value, generated: field === "context" || field === "pattern" ? false : data.generated });
  }

  function generatePreview() {
    if (!canGenerate) return;
    onUpdate(section.id, { ...data, generated: true });
  }

  return (
    <div className="diagram-editor">
      <div className="diagram-controls">
        <label className="form-field wide">
          <span>Diagram context</span>
          <textarea
            value={data.context}
            onChange={(event) => update("context", event.target.value)}
            placeholder="Describe the workflow, systems, data sources, OPSWAT products, trust boundaries, and target users."
          />
        </label>
        <div className="diagram-control-grid">
          <label className="form-field">
            <span>Diagram pattern</span>
            <select value={data.pattern} onChange={(event) => update("pattern", event.target.value)}>
              <option value="kiosk">Kiosk / Sheep dip</option>
              <option value="mft">Managed file transfer</option>
            </select>
          </label>
          <label className="form-field">
            <span>Figure caption</span>
            <input value={data.caption} onChange={(event) => update("caption", event.target.value)} placeholder="Figure title" />
          </label>
        </div>
        <button className="add-row-button" disabled={!canGenerate} onClick={generatePreview}>
          <WandSparkles size={16} />
          Generate diagram preview
        </button>
      </div>
      <DiagramPreview context={data.context} generated={data.generated} caption={data.caption} pattern={data.pattern} />
    </div>
  );
}

function DiagramPreview({ caption, context, generated, pattern }) {
  if (!generated) {
    return (
      <div className="diagram-preview empty-diagram-preview">
        <GitBranch size={34} />
        <strong>No diagram generated</strong>
        <span>Enter context and generate a preview. AI/RAG can later replace this deterministic preview with a sourced diagram plan.</span>
      </div>
    );
  }

  return (
    <div className="diagram-preview">
      <h3>{pattern === "mft" ? "MFT Prerequisites" : "KIOSK Prerequisites"}</h3>
      {pattern === "mft" ? <MftDiagram context={context} /> : <KioskDiagram context={context} />}
      <p className="figure-caption">{caption || (pattern === "mft" ? "Figure: Managed File Transfer Deployment Example" : "Figure: Simple Sheep Dip Example")}</p>
    </div>
  );
}

function KioskDiagram({ context }) {
  const note = context.trim().slice(0, 80);
  return (
    <div className="kiosk-diagram opswat-diagram">
      <DiagramNode title="Removable Media" icon={usbBlueIcon} />
      <DiagramArrow />
      <DocumentDecision tone="warning" label="Review" />
      <DiagramArrow />
      <ProductBlock title="MetaDefender Kiosk" icon={kioskIcon} />
      <div className="split-flow">
        <div>
          <DiagramArrow />
          <DocumentDecision tone="success" label="Clean" />
        </div>
        <div>
          <DiagramArrow />
          <DocumentDecision tone="danger" label="Blocked" />
        </div>
      </div>
      <DiagramNode title="Scanned Media" icon={fileBlueIcon} />
      <AirGap label="Air Gap" />
      <DiagramNode title="Engineering Workstation / SCADA" icon={otSecurityIcon} />
      {note && <span className="diagram-context-note">{note}</span>}
    </div>
  );
}

function MftDiagram({ context }) {
  const note = context.trim().slice(0, 90);
  return (
    <div className="mft-diagram opswat-diagram">
      <div className="diagram-column">
        <span className="diagram-zone-label">External</span>
        <DiagramNode title="Guest Users" icon={UserRound} />
        <DiagramNode title="Ad-hoc File Share" icon={FileText} />
        <DiagramNode title="External SFTP" icon={Network} />
      </div>
      <div className="diagram-column narrow-column">
        <DocumentDecision tone="success" label="Files encrypted" />
        <DocumentDecision tone="success" label="Files encrypted" />
        <DocumentDecision tone="success" label="Files encrypted" />
      </div>
      <AirGap label="Network Border" />
      <div className="diagram-product-stack">
        <ProductBlock title="MetaDefender Managed File Transfer" icon={mftIcon} />
        <ProductBlock title="MetaDefender Core" icon={transferGuardIcon} />
      </div>
      <div className="diagram-column wide-column">
        <span className="diagram-zone-label">Departments</span>
        <DiagramNode title="Review File" icon={FileText} />
        <DiagramNode title="Internal Users" icon={UserRound} />
        <DiagramNode title="Internal Share" icon={FileText} />
      </div>
      {note && <span className="diagram-context-note">{note}</span>}
    </div>
  );
}

function ProductBlock({ icon, title }) {
  return (
    <div className="product-block">
      <img src={icon} alt="" />
      <span>MetaDefender</span>
      <strong>{title.replace("MetaDefender ", "")}</strong>
    </div>
  );
}

function DiagramNode({ icon: IconOrImage, title }) {
  const isImage = typeof IconOrImage === "string";
  return (
    <div className="diagram-node">
      {isImage ? <img src={IconOrImage} alt="" /> : <IconOrImage size={24} />}
      <strong>{title}</strong>
    </div>
  );
}

function DocumentDecision({ label, tone }) {
  return (
    <div className={`document-decision ${tone}`}>
      <FileText size={26} />
      <span>{tone === "danger" ? "x" : tone === "warning" ? "!" : "✓"}</span>
      <strong>{label}</strong>
    </div>
  );
}

function DiagramArrow() {
  return <div className="diagram-arrow" />;
}

function AirGap({ label }) {
  return <div className="air-gap">{label}</div>;
}

function ChecklistEditor({ section, onUpdate }) {
  function updateItem(listName, itemIndex, value) {
    onUpdate(section.id, (current) => ({
      ...current,
      lists: {
        ...current.lists,
        [listName]: current.lists[listName].map((item, index) => (index === itemIndex ? value : item))
      }
    }));
  }

  function addItem(listName) {
    onUpdate(section.id, (current) => ({
      ...current,
      lists: { ...current.lists, [listName]: [...current.lists[listName], ""] }
    }));
  }

  function removeItem(listName, itemIndex) {
    onUpdate(section.id, (current) => ({
      ...current,
      lists: { ...current.lists, [listName]: current.lists[listName].filter((_, index) => index !== itemIndex) }
    }));
  }

  return (
    <div className="checklist-editor">
      {Object.entries(section.data.lists).map(([listName, items]) => (
        <div className="checklist-group" key={listName}>
          <h3>{listName}</h3>
          {items.map((item, index) => (
            <div className="checklist-row" key={index}>
              <input value={item} onChange={(event) => updateItem(listName, index, event.target.value)} />
              <button className="icon-button compact" aria-label="Remove item" onClick={() => removeItem(listName, index)}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button className="add-row-button" onClick={() => addItem(listName)}>
            <Plus size={16} />
            Add item
          </button>
        </div>
      ))}
    </div>
  );
}

function SignoffEditor({ section, onUpdate }) {
  function updateRepresentative(index, field, value) {
    onUpdate(section.id, (current) => ({
      ...current,
      representatives: current.representatives.map((rep, repIndex) => (repIndex === index ? { ...rep, [field]: value } : rep))
    }));
  }

  return (
    <div className="signoff-grid">
      {section.data.representatives.map((rep, index) => (
        <div className="signoff-card" key={rep.party}>
          <h3>{rep.party}</h3>
          {["name", "title", "date"].map((field) => (
            <label className="form-field" key={field}>
              <span>{`${rep.party} ${field}`}</span>
              <input value={rep[field]} onChange={(event) => updateRepresentative(index, field, event.target.value)} />
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}

function AppendixEditor({ section, onUpdate }) {
  const fields = [
    ["references", "Product References"],
    ["repository", "Test File Repository"],
    ["glossary", "Glossary Additions"],
    ["changeLog", "Document Change Log"]
  ];

  return (
    <div className="structured-form">
      {fields.map(([field, label]) => (
        <label className="form-field wide" key={field}>
          <span>{label}</span>
          <textarea value={section.data[field]} onChange={(event) => onUpdate(section.id, { ...section.data, [field]: event.target.value })} />
        </label>
      ))}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
