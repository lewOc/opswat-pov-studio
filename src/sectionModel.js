export const libraryGroups = [
  { id: "setup", label: "Setup" },
  { id: "plan", label: "Plan" },
  { id: "validate", label: "Validate" },
  { id: "deliver", label: "Deliver" },
  { id: "close", label: "Close" },
  { id: "assets", label: "Assets" }
];

export const sectionTemplates = [
  {
    group: "assets",
    section: "Diagram",
    label: "Diagram Generator",
    detail: "Generate an OPSWAT-style architecture or workflow diagram.",
    iconKey: "GitBranch",
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
    iconKey: "FileText",
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
    iconKey: "PanelLeft",
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
    iconKey: "ShieldCheck",
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
    iconKey: "Layers3",
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
    iconKey: "Target",
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
    iconKey: "ClipboardCheck",
    type: "checklist",
    exportKey: "sections.scope",
    purpose: "Define what the PoV will and will not cover.",
    requiredFields: ["In-scope items", "Out-of-scope items"],
    lists: ["In Scope", "Out of Scope"],
    ai: {
      mode: "checklist",
      target: "lists",
      maxItemsPerList: 5,
      instructions:
        "Generate concise PoV scope boundaries as checklist items. In Scope should describe the validation work OPSWAT will perform. Out of Scope should prevent overreach, production rollout assumptions, and unrelated integrations.",
      outputLists: ["In Scope", "Out of Scope"]
    }
  },
  {
    group: "plan",
    section: "6",
    label: "Assumptions & Dependencies",
    detail: "Dependencies, owners, and impact notes.",
    iconKey: "ListChecks",
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
    iconKey: "Clock3",
    type: "timeline",
    exportKey: "sections.timelineMilestones",
    purpose: "Define PoV phases, activities, descriptions, and target dates.",
    requiredFields: ["Phase", "Activity", "Description", "Target Date"],
    columns: ["Phase", "Activity", "Description", "Target Date"],
    ai: {
      mode: "table",
      target: "rows",
      maxRows: 5,
      instructions:
        "Generate a concise PoV delivery timeline as table rows. Use the supplied start/end dates when available. Keep activities practical and tied to scope, validation, review, and close-out.",
      outputColumns: ["Phase", "Activity", "Description", "Target Date"]
    }
  },
  {
    group: "plan",
    section: "13",
    label: "Governance, Communication & Escalation",
    detail: "Cadence, channels, escalation path, and SLAs.",
    iconKey: "Network",
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
    iconKey: "Table2",
    type: "table",
    exportKey: "sections.successCriteria",
    purpose: "Define measurable criteria, validation methods, thresholds, and verdicts.",
    requiredFields: ["Priority", "Success Criterion", "Validation Method", "Threshold / Target"],
    columns: ["Priority", "Success Criterion", "Validation Method", "Threshold / Target", "Verdict"],
    ai: {
      mode: "table",
      target: "rows",
      maxRows: 5,
      instructions:
        "Generate concise, measurable PoV success criteria as table rows. Link criteria to the captured use cases, products, and customer outcomes. Keep each cell short and leave Verdict blank for later review.",
      outputColumns: ["Priority", "Success Criterion", "Validation Method", "Threshold / Target", "Verdict"]
    }
  },
  {
    group: "validate",
    section: "8",
    label: "Exit Criteria & Failure Definition",
    detail: "Pass, conditional pass, fail, and early exit.",
    iconKey: "Gauge",
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
    iconKey: "GitBranch",
    type: "table",
    exportKey: "sections.useCases",
    purpose: "List the PoV validation scenarios and associated products.",
    requiredFields: ["Use Case", "Description", "Product(s)"],
    columns: ["ID", "Use Case", "Description", "Product(s)"],
    ai: {
      mode: "table",
      target: "rows",
      maxRows: 5,
      instructions:
        "Generate concise PoV validation use cases as table rows. Each row should describe a concrete proof-of-value task, not a broad product capability. Keep descriptions short and action-oriented.",
      outputColumns: ["ID", "Use Case", "Description", "Product(s)"]
    }
  },
  {
    group: "validate",
    section: "10",
    label: "Test Data & Sample Set Definition",
    detail: "Data sets, ownership, volume, handling.",
    iconKey: "FileText",
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
    iconKey: "LockKeyhole",
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
    iconKey: "UserRound",
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
    iconKey: "Table2",
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
    iconKey: "Settings",
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
    iconKey: "LockKeyhole",
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
    iconKey: "ClipboardCheck",
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
    iconKey: "Gauge",
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
    iconKey: "Send",
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
    iconKey: "ListChecks",
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
    iconKey: "Pencil",
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
    iconKey: "Blocks",
    type: "appendix",
    exportKey: "sections.appendix",
    purpose: "Collect product references, test repository notes, glossary additions, and change log entries.",
    requiredFields: ["Product references", "Test file repository", "Glossary", "Change log"]
  }
];

export const emptyPovContext = {
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

export const conciseGenerationGuidance = {
  style: "concise, practical, and section-specific",
  maxWords: 140,
  rules: [
    "Only write content needed for the selected PoV section.",
    "Prefer short bullets or compact table entries over long prose.",
    "When the section is a table, return table rows that match the requested columns.",
    "When the section is a checklist, return checklist items grouped by the requested list names.",
    "Focus on the proof-of-value task, validation steps, success measures, and customer context.",
    "Avoid broad marketing copy, long product background, and repeated context already captured elsewhere.",
    "Do not generate a full-document narrative when a single section is requested."
  ]
};

const emptyRow = (columns) => Object.fromEntries(columns.map((column) => [column, ""]));

export function templateById(templateId) {
  return sectionTemplates.find((template) => template.exportKey === templateId || template.section === templateId) || null;
}

export function splitPovList(value) {
  return String(value || "")
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function createSectionData(template) {
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

export function hydrateSectionDataFromContext(template, data, povContext) {
  if (template.exportKey === "cover.engagementDetails") {
    return {
      ...data,
      rows: data.rows.map((row) => {
        const valueByField = {
          Client: povContext.customer,
          "Engagement Type": "Proof of Value (PoV)",
          "OPSWAT Account Executive": povContext.accountExecutive,
          "OPSWAT Solutions Engineer": povContext.solutionsEngineer,
          "PoV Duration": [povContext.startDate, povContext.endDate].filter(Boolean).join(" - "),
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
      notes: [povContext.customer && `Customer: ${povContext.customer}`, povContext.industry && `Industry: ${povContext.industry}`, povContext.challenges && `Business challenges: ${povContext.challenges}`, povContext.useCases && `Use cases discussed: ${povContext.useCases}`, povContext.products && `Products in scope: ${povContext.products}`, povContext.compliance && `Compliance drivers: ${povContext.compliance}`]
        .filter(Boolean)
        .join("\n")
    };
  }
  if (template.exportKey === "sections.productsInScope") {
    const products = splitPovList(povContext.products);
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
      intro: [povContext.customer && `${povContext.customer} operates in the ${povContext.industry || "specified"} sector.`, povContext.challenges && `Key discovery context: ${povContext.challenges}`]
        .filter(Boolean)
        .join(" "),
      rows: data.rows.map((row) =>
        row.Parameter === "Other relevant context" && povContext.compliance
          ? { ...row, Details: `Compliance drivers: ${povContext.compliance}` }
          : row
      )
    };
  }
  if (template.exportKey === "sections.useCases") {
    const useCases = splitPovList(povContext.useCases);
    if (!useCases.length) return data;
    return {
      ...data,
      rows: useCases.map((useCase, index) => ({
        ID: `UC-${index + 1}`,
        "Use Case": useCase,
        Description: "",
        "Product(s)": povContext.products || ""
      }))
    };
  }
  return data;
}

export function createSection(template, povContext) {
  const id = template.repeatable ? `${template.section}-${crypto.randomUUID()}` : template.section;
  const baseData = createSectionData(template);
  return {
    id,
    templateId: template.exportKey,
    title: template.label,
    subtitle: template.detail,
    data: hydrateSectionDataFromContext(template, baseData, povContext),
    generatedContent: {},
    sources: [],
    reviewState: "Not started"
  };
}

export function hasSectionInput(section) {
  const { data, template } = section;
  if (template.type === "diagram") return Boolean(data.context.trim());
  if (template.type === "narrative") return Boolean(data.notes.trim() || data.draft.trim());
  if (template.type === "checklist") return Object.values(data.lists).flat().some((item) => item.trim());
  if (template.type === "signoff") return data.representatives.some((rep) => rep.name.trim() || rep.title.trim() || rep.date.trim());
  if (template.type === "appendix") return Object.values(data).some((value) => value.trim());
  return Boolean(data.intro?.trim()) || data.rows.some((row) => Object.values(row).some((value) => value.trim()));
}

export function getAiPlan(section) {
  if (!section?.template?.ai) return null;
  return section.template.ai;
}

export function getAiReadiness(section, povContext) {
  if (!section) return { ready: false, reason: "Select a setup section first." };
  const plan = getAiPlan(section);
  if (!plan) return { ready: false, reason: "This section is structured manually and does not need AI drafting." };
  if (!povContext.customer.trim()) return { ready: false, reason: "Add the customer name in PoV Context." };
  if (!povContext.industry.trim()) return { ready: false, reason: "Add the customer industry in PoV Context." };
  if (section.template.exportKey === "sections.executiveSummary" && !povContext.challenges.trim()) {
    return { ready: false, reason: "Add business challenges before drafting the executive summary." };
  }
  if (section.template.exportKey === "sections.productsInScope") {
    const hasProducts = povContext.products.trim() || section.data.rows.some((row) => row["Product / Module"]?.trim());
    if (!hasProducts) return { ready: false, reason: "Add products in scope in PoV Context or the product table." };
  }
  if (section.template.exportKey === "sections.customerEnvironment" && !povContext.challenges.trim() && !section.data.rows.some((row) => row.Details?.trim())) {
    return { ready: false, reason: "Add environment details or business context before drafting the overview." };
  }
  if (section.template.exportKey === "sections.useCases" && !povContext.useCases.trim() && !povContext.challenges.trim()) {
    return { ready: false, reason: "Add use cases or business challenges before generating validation rows." };
  }
  if (section.template.exportKey === "sections.successCriteria" && !povContext.useCases.trim() && !povContext.challenges.trim()) {
    return { ready: false, reason: "Add use cases or business challenges before generating success criteria." };
  }
  if (section.template.exportKey === "sections.scope" && !povContext.useCases.trim() && !povContext.challenges.trim()) {
    return { ready: false, reason: "Add use cases or business challenges before generating scope boundaries." };
  }
  if (section.template.exportKey === "sections.timelineMilestones" && !povContext.useCases.trim() && !povContext.challenges.trim()) {
    return { ready: false, reason: "Add use cases or business challenges before generating a PoV timeline." };
  }
  return { ready: true, reason: "Ready to generate this section." };
}

export function serializeSection(section) {
  return {
    id: section.id,
    templateId: section.templateId,
    title: section.title,
    exportKey: section.template.exportKey,
    type: section.template.type,
    ai: section.template.ai,
    columns: section.template.columns || [],
    lists: section.template.lists || [],
    data: section.data
  };
}

export function serializeSectionForStorage(section) {
  return {
    id: section.id,
    templateId: section.templateId || section.template?.exportKey,
    title: section.title,
    subtitle: section.subtitle,
    data: section.data,
    generatedContent: section.generatedContent || {},
    sources: section.sources || [],
    reviewState: section.reviewState || "Not started"
  };
}

export function attachSectionTemplate(section, iconForTemplate = () => null) {
  const template = templateById(section.templateId || section.template?.exportKey || section.template?.section || section.id);
  if (!template) return null;
  return {
    ...section,
    templateId: template.exportKey,
    title: section.title || template.label,
    subtitle: section.subtitle || template.detail,
    icon: iconForTemplate(template),
    template
  };
}
