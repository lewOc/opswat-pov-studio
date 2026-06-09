import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiHost = "192.168.0.184";
const apiTargets = {
  accountMap: `http://${apiHost}:8010`,
  diagram: `http://${apiHost}:8020`,
  productKnowledge: `http://${apiHost}:8050`,
  relevantExperience: `http://${apiHost}:8030`
};

const productKnowledgeActions = {
  productFit: "/api/product-fit",
  productsSearch: "/api/products/search",
  capabilitiesSearch: "/api/capabilities/search",
  evidenceSearch: "/api/evidence/search"
};

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function readRequestJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function cleanText(value, limit = 140) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length <= limit ? text : `${text.slice(0, limit - 1).trim()}...`;
}

function splitList(value) {
  return String(value || "")
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function productNames(context, productKnowledge) {
  const recommended = (productKnowledge || []).map((item) => item.product).filter(Boolean);
  return [...new Set([...splitList(context.products), ...recommended].filter(Boolean))].slice(0, 4);
}

function productKnowledgeReasons(productKnowledge) {
  return Object.fromEntries((productKnowledge || []).map((item) => [item.product, item.reason]).filter(([product]) => product));
}

function productKnowledgeCapabilities(productKnowledge) {
  return Object.fromEntries(
    (productKnowledge || [])
      .map((item) => [item.product, Array.isArray(item.capabilities) ? item.capabilities.slice(0, 3) : []])
      .filter(([product]) => product)
  );
}

function useCaseNames(context) {
  const discovered = splitList(context.useCases);
  if (discovered.length) return discovered.slice(0, 5);
  if (context.challenges) return [context.challenges].slice(0, 1);
  return ["Validate the agreed OPSWAT proof-of-value workflow"];
}

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function uniqueItems(values) {
  const seen = new Set();
  return values.filter((value) => {
    const key = normalizeKey(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function productUseCaseCandidates(productKnowledge) {
  return (productKnowledge || []).flatMap((item) => [
    ...(Array.isArray(item.useCases) ? item.useCases : []),
    ...(Array.isArray(item.bestFitUseCases) ? item.bestFitUseCases : [])
  ]);
}

function fallbackUseCaseCandidates(context, productKnowledge) {
  const text = `${context.challenges || ""} ${context.useCases || ""} ${context.products || ""} ${(productKnowledge || [])
    .map((item) => item.product)
    .join(" ")}`.toLowerCase();
  const candidates = [
    "Validate malware prevention and policy enforcement evidence",
    "Confirm audit logs and reporting evidence for stakeholder review",
    "Validate exception handling for blocked or unsupported files"
  ];
  if (/usb|removable|media|kiosk/.test(text)) {
    candidates.unshift("Inspect removable media before transfer into OT");
    candidates.push("Validate controlled supplier or contractor media intake");
  }
  if (/transfer|mft|file share|supplier|external/.test(text)) {
    candidates.unshift("Validate secure supplier file transfer workflow");
    candidates.push("Confirm file delivery, quarantine, and release workflow");
  }
  if (/iec|62443|nis2|nerc|compliance|audit/.test(text)) {
    candidates.push("Demonstrate compliance evidence capture for the agreed controls");
  }
  return candidates;
}

function suggestedUseCases(section, context, productKnowledge) {
  const existing = new Set((section.data?.rows || []).map((row) => normalizeKey(row["Use Case"])).filter(Boolean));
  const candidates = uniqueItems([
    ...productUseCaseCandidates(productKnowledge),
    ...splitList(context.useCases),
    ...fallbackUseCaseCandidates(context, productKnowledge)
  ]).filter((item) => !existing.has(normalizeKey(item)));
  return (candidates.length ? candidates : useCaseNames(context)).slice(0, 5);
}

function sentenceList(values, fallback) {
  const items = values.map((value) => cleanText(value, 90)).filter(Boolean);
  if (!items.length) return fallback;
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

function relevantExperienceSummary(relevantExperience) {
  const matches = relevantExperience?.matches || [];
  const strongMatches = matches.filter((match) => match.confidence === "high").slice(0, 2);
  if (!strongMatches.length) return "";
  return `Relevant OPSWAT experience includes similar ${sentenceList(
    strongMatches.map((match) => match.customer_type || match.title),
    "critical infrastructure"
  )} engagements, which can inform practical validation evidence without expanding the PoV scope.`;
}

function contextPhrase(context) {
  return context.industry ? ` within ${context.industry}` : "";
}

function challengeNames(context) {
  const discovered = splitList(context.challenges);
  if (discovered.length) return discovered.slice(0, 4);
  return useCaseNames(context).slice(0, 3);
}

function businessObjectiveForChallenge(challenge) {
  const text = cleanText(challenge, 90);
  if (!text) return "Validate measurable OPSWAT value against the agreed PoV challenge.";
  const lowerFirst = `${text.charAt(0).toLowerCase()}${text.slice(1)}`;
  if (/^(reduce|improve|protect|enable)\b/i.test(text)) {
    return cleanText(`Validate ability to ${lowerFirst} through the PoV.`, 115);
  }
  if (/^(validate|confirm|demonstrate|secure)\b/i.test(text)) {
    return cleanText(`Validate ${lowerFirst} through the PoV.`, 115);
  }
  return cleanText(`Reduce risk associated with ${text}.`, 115);
}

function criterionRefs(context) {
  const useCases = useCaseNames(context);
  return useCases.map((_, index) => `UC-${index + 1}`).slice(0, 5);
}

function generateRows(section, context, productKnowledge, relevantExperience) {
  const products = productNames(context, productKnowledge).join(", ") || "OPSWAT product set";
  const useCases = useCaseNames(context);
  const capabilityMap = productKnowledgeCapabilities(productKnowledge);
  const capabilities = Object.values(capabilityMap).flat().filter(Boolean);

  if (section.exportKey === "sections.businessOutcomes") {
    const challenges = challengeNames(context);
    const capabilityText = sentenceList(
      Object.values(capabilityMap)
        .flat()
        .filter(Boolean)
        .slice(0, 3),
      "agreed OPSWAT controls"
    );
    const rows = challenges.map((challenge, index) => ({
      "Business Objective": businessObjectiveForChallenge(challenge),
      "KPI / Metric": index === 0 ? "Validated workflow evidence" : "Operational acceptance criteria",
      Baseline: "Current process and risk level confirmed during discovery.",
      Target: cleanText(`PoV shows ${capabilityText} can support the agreed workflow.`, 130),
      "Evidence Source": relevantExperience?.matches?.length
        ? "Test results, screenshots, logs, and similar OPSWAT validation patterns."
        : "Test results, screenshots, logs, and stakeholder review."
    }));
    return rows.length
      ? rows.slice(0, 5)
      : [
          {
            "Business Objective": "Validate measurable OPSWAT value against the agreed PoV challenge.",
            "KPI / Metric": "Pass/fail evidence captured",
            Baseline: "Current-state risk confirmed during discovery.",
            Target: "Agreed workflow completed with clear evidence.",
            "Evidence Source": "PoV test results and stakeholder review."
          }
        ];
  }

  if (section.exportKey === "sections.useCases") {
    return suggestedUseCases(section, context, productKnowledge).map((useCase, index) => ({
      ID: `UC-${index + 1}`,
      "Use Case": cleanText(useCase, 90),
      Description: cleanText(`Validate this workflow with captured logs, screenshots, and clear pass/fail evidence.`, 150),
      "Product(s)": products
    }));
  }

  if (section.exportKey === "sections.successCriteria") {
    return useCases.slice(0, 4).map((useCase, index) => ({
      Priority: index === 0 ? "High" : "Medium",
      "Success Criterion": cleanText(`PoV demonstrates ${useCase.toLowerCase()} within the agreed scope.`, 120),
      "Validation Method": relevantExperience?.matches?.length
        ? "Run the agreed workflow and compare evidence to similar OPSWAT validation patterns."
        : "Run the agreed test workflow and capture results.",
      "Threshold / Target": "Pass/fail evidence is available for customer review.",
      Verdict: ""
    }));
  }

  if (section.exportKey === "sections.testData") {
    const firstUseCase = useCases[0] || "the agreed validation workflow";
    return [
      {
        "Data Set": "Representative clean files",
        Purpose: cleanText(`Validate successful processing for ${firstUseCase}.`, 120),
        "Source / Owner": "Customer technical owner",
        "Handling Rules": "Use approved non-sensitive samples only."
      },
      {
        "Data Set": "Blocked or policy-test files",
        Purpose: "Validate detection, policy enforcement, and evidence capture.",
        "Source / Owner": "OPSWAT and customer security team",
        "Handling Rules": "Use controlled samples; do not include live malware unless explicitly approved."
      },
      {
        "Data Set": "Transfer metadata and logs",
        Purpose: "Confirm audit trail, reporting, and review evidence.",
        "Source / Owner": "PoV technical team",
        "Handling Rules": "Share logs through the agreed secure channel."
      },
      {
        "Data Set": "Exception or edge-case samples",
        Purpose: "Validate handling of oversized, encrypted, or unsupported files.",
        "Source / Owner": "Customer and OPSWAT",
        "Handling Rules": "Document expected outcome before testing."
      }
    ].slice(0, Number(section.ai?.maxRows || 5));
  }

  if (section.exportKey === "sections.complianceMapping") {
    const frameworks = splitList(context.compliance).length ? splitList(context.compliance) : ["Customer security policy"];
    const refs = criterionRefs(context);
    return frameworks.slice(0, 5).map((framework, index) => ({
      "Framework / Regulation": framework,
      "Control Reference": "Customer to confirm specific control ID",
      "OPSWAT Capability Demonstrated": cleanText(capabilities[index] || capabilities[0] || "Secure transfer validation and auditable threat prevention", 130),
      "PoV Criterion #": refs[index] || refs[0] || `UC-${index + 1}`
    }));
  }

  if (section.exportKey === "sections.timelineMilestones") {
    return [
      ["Kick-off", "Confirm scope", "Review stakeholders, products, success criteria, and test data.", context.startDate || "TBC"],
      ["Preparation", "Configure environment", "Validate prerequisites, access, and required product configuration.", "TBC"],
      ["Validation", "Run PoV tests", "Execute agreed use cases and record evidence against success criteria.", "TBC"],
      ["Review", "Playback results", "Review findings, risks, and any follow-up actions with the customer.", "TBC"],
      ["Close-out", "Decision and next steps", "Agree outcome, production path, and ownership of next actions.", context.endDate || "TBC"]
    ].map(([Phase, Activity, Description, TargetDate]) => ({
      Phase,
      Activity,
      Description,
      "Target Date": TargetDate
    }));
  }

  if (section.exportKey === "sections.assumptionsDependencies") {
    return [
      ["Customer technical stakeholders are available for PoV workshops and review checkpoints.", "Customer to confirm named contacts before kick-off."],
      ["Target environment access, test systems, and required accounts are available before validation starts.", "Customer technical owner to provision and verify access."],
      ["Representative test files, media, or workflows are approved for PoV use.", "Customer to provide sample set and handling constraints."],
      [`Selected products (${products}) are acceptable for the agreed validation scope.`, "OPSWAT to confirm product fit; customer to confirm scope."],
      ["Any firewall, proxy, DNS, or routing changes required for the PoV are handled in advance.", "Customer network/security teams to approve changes."]
    ].map(([AssumptionDependency, OwnerNotes]) => ({
      "Assumption / Dependency": cleanText(AssumptionDependency, 160),
      "Owner / Notes": cleanText(OwnerNotes, 160)
    }));
  }

  if (section.ai?.target === "Purpose / Description") {
    const knowledgeByProduct = Object.fromEntries((productKnowledge || []).map((item) => [item.product, item.reason]));
    return (section.data?.rows || []).map((row) => {
      const product = row["Product / Module"] || "";
      const capabilities = capabilityMap[product]?.length ? ` Key PoV capabilities: ${capabilityMap[product].join(", ")}.` : "";
      return {
        "Purpose / Description": cleanText(
          `${knowledgeByProduct[product] || `Included to support the agreed ${context.customer || "customer"} PoV validation scope.`}${capabilities}`,
          130
        )
      };
    });
  }

  return [];
}

function generateLists(section, context, productKnowledge, relevantExperience) {
  const products = productNames(context, productKnowledge);
  const productText = products.join(", ") || "selected OPSWAT products";
  const firstUseCase = useCaseNames(context)[0];
  const relevantNote = relevantExperience?.matches?.length ? "Use similar OPSWAT validation evidence patterns where applicable." : "";

  if (section.exportKey === "sections.scope") {
    return {
      "In Scope": [
        `Validate ${firstUseCase.toLowerCase()}.`,
        `Configure and test ${productText} for the agreed PoV workflow.`,
        "Capture evidence against agreed success criteria.",
        relevantNote || "Review results, risks, and recommended next steps."
      ].map((item) => cleanText(item, 150)),
      "Out of Scope": [
        "Production rollout or long-term managed service operation.",
        "Unrelated integrations not required for the agreed use cases.",
        "Remediation of customer environment issues outside OPSWAT configuration.",
        "Commercial negotiation or final procurement approval."
      ]
    };
  }

  if (section.exportKey === "sections.exitCriteria") {
    const firstUseCase = cleanText(useCaseNames(context)[0], 90);
    return {
      "Pass / Fail Rubric": [
        `Pass: agreed use cases including ${firstUseCase} are completed with captured evidence.`,
        "Conditional pass: minor issues are documented with acceptable workaround or remediation plan.",
        "Fail: critical workflow, security, or evidence requirements cannot be demonstrated.",
        "Customer and OPSWAT stakeholders review results and agree the final PoV outcome."
      ],
      "Early-Exit Triggers": [
        "Required environment access or test data is not available in the agreed window.",
        "A blocking security, connectivity, or product configuration issue prevents meaningful testing.",
        "PoV scope changes materially beyond the agreed use cases.",
        "Customer or OPSWAT identifies unacceptable operational or security risk."
      ]
    };
  }

  if (section.exportKey === "sections.technicalPrerequisites") {
    const reasons = productKnowledgeReasons(productKnowledge);
    const productItems = (products.length ? products : ["Selected OPSWAT products"]).slice(0, 4).map((product) =>
      cleanText(`${product}: ${reasons[product] || "confirm sizing, version, licensing, and required deployment access."}`, 160)
    );
    return {
      "Product Prerequisites": [
        ...productItems,
        "Confirm product versions, licence availability, and administrator access before kick-off."
      ].slice(0, 5),
      "Network Requirements": [
        "Confirm required inbound/outbound connectivity between PoV systems.",
        "Validate firewall, proxy, DNS, and certificate requirements before testing.",
        "Confirm access to update services, repositories, or offline update packages.",
        "Agree any isolation, air-gap, or transfer-boundary constraints."
      ],
      "General Pre-Kick-off Checklist": [
        "Confirm customer technical owner and escalation contact.",
        "Prepare representative test files, media, and expected validation evidence.",
        "Agree test window, success criteria, and rollback/cleanup approach.",
        "Confirm how logs, reports, and screenshots will be shared."
      ]
    };
  }

  return {};
}

function generateDraft(section, context, productKnowledge, relevantExperience) {
  if (section.ai?.target === "intro") {
    return cleanText(
      `${context.customer || "The customer"} will validate the agreed OPSWAT workflow in the context of ${context.industry || "the target environment"}. The PoV will focus on practical evidence, operational fit, and measurable outcomes.`,
      220
    );
  }

  if (section.exportKey === "sections.executiveSummary") {
    const customer = context.customer || "the customer";
    const products = sentenceList(splitList(context.products), "the selected OPSWAT solution");
    const useCases = sentenceList(useCaseNames(context), "the agreed proof-of-value use cases");
    const challenge = cleanText(context.challenges, 240) || "the customer's security requirements and operational challenges";
    const compliance = sentenceList(splitList(context.compliance), "applicable compliance requirements");
    const relevant = relevantExperienceSummary(relevantExperience);

    return [
      `This Proof of Value (PoV) document defines the objectives, scope, success criteria, and evaluation framework for ${customer}'s assessment of ${products}. The engagement is structured to demonstrate measurable value in addressing ${challenge}${contextPhrase(context)}.`,
      "Founded in 2002, OPSWAT specializes in the protection of critical infrastructure. Guided by a Zero Trust philosophy, OPSWAT operates on the principle that every file and device represents a potential threat. OPSWAT solutions are designed to enable secure data transfer, controlled device access, malware prevention, and auditable security outcomes across IT and OT environments.",
      `This PoV will demonstrate how OPSWAT can support ${customer}'s identified risk areas by validating ${useCases}. The output will provide practical evidence against the agreed success criteria while supporting ${compliance}.${relevant ? ` ${relevant}` : ""}`
    ].join("\n\n");
  }

  return cleanText(
    `${context.customer || "The customer"} will use this PoV to validate the agreed OPSWAT use cases, confirm success criteria, and capture clear evidence for the next decision point.`,
    220
  );
}

function buildProductFitPayload(context) {
  const problem = [context.challenges, context.useCases, context.products].filter(Boolean).join("\n");
  return {
    problem: problem || "Generate concise OPSWAT proof-of-value product context.",
    industry: context.industry || "",
    workflow: context.useCases || context.challenges || context.products || "",
    compliance_drivers: splitList(context.compliance),
    constraints: splitList([context.challenges, context.products].filter(Boolean).join(", ")),
    products: splitList(context.products),
    top_k: 4,
    max_evidence: 2
  };
}

function buildRelevantExperiencePayload(section, context, productKnowledge) {
  return {
    account_name: context.customer || "",
    industry: context.industry || "",
    use_case_title: useCaseNames(context)[0] || "",
    problem: [context.challenges, context.useCases].filter(Boolean).join("\n"),
    solution: productNames(context, productKnowledge).join(", "),
    products: productNames(context, productKnowledge),
    focus: section.label || section.exportKey || "PoV section generation",
    top_k: 3,
    min_score: 0
  };
}

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = 7000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || payload.detail || `Request failed with ${response.status}`);
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

function normalizeProductFit(payload) {
  const items = payload?.recommended_products || payload?.products || payload?.results || [];
  return items
    .map((item) => ({
      product: item.product || item.name || item.title || item.slug || "",
      reason: item.fit_reason || item.reason || item.summary || item.description || "Relevant to the captured PoV context.",
      confidence: item.confidence || item.score || "",
      capabilities: item.recommended_capabilities || item.capabilities || [],
      useCases: item.best_fit_use_cases || item.use_cases || [],
      buyerProblems: item.buyer_problems || [],
      evidence: item.evidence || []
    }))
    .filter((item) => item.product);
}

function mergeProductKnowledge(existing, fetched) {
  const byProduct = new Map();
  [...(existing || []), ...(fetched || [])].forEach((item) => {
    if (!item?.product) return;
    const current = byProduct.get(item.product) || {};
    byProduct.set(item.product, { ...current, ...item });
  });
  return [...byProduct.values()].slice(0, 4);
}

function normalizeRelevantExperience(payload) {
  const matches = (payload?.matches || payload?.results || [])
    .map((match) => ({
      title: match.title || match.customer_type || "Relevant OPSWAT experience",
      customer_type: match.customer_type || "",
      products: match.products || [],
      relevance: cleanText(match.relevance || match.summary || match.outcome || "", 220),
      source_url: match.source_url || match.source_urls?.[0] || "",
      confidence: match.confidence || "",
      score: match.score || ""
    }))
    .filter((match) => match.title);
  return { matches };
}

function buildCitations(productKnowledge, relevantExperience) {
  const productCitations = (productKnowledge || [])
    .flatMap((item) => (Array.isArray(item.evidence) ? item.evidence.slice(0, 1) : []))
    .map((entry) => ({
      title: entry.title || entry.source_path || "OPSWAT product documentation",
      source: entry.source_path || entry.url || entry.source_url || "",
      type: "Product Knowledge"
    }));
  const experienceCitations = (relevantExperience?.matches || []).slice(0, 3).map((match) => ({
    title: match.title,
    source: match.source_url,
    type: "Relevant Experience"
  }));
  return [...productCitations, ...experienceCitations].filter((item) => item.title).slice(0, 5);
}

async function fetchSectionContext(section, context, productKnowledge) {
  const existingProductKnowledge = productKnowledge || [];
  const shouldFetchRelevant = [
    "sections.businessOutcomes",
    "sections.complianceMapping",
    "sections.executiveSummary",
    "sections.exitCriteria",
    "sections.scope",
    "sections.successCriteria",
    "sections.testData",
    "sections.useCases",
    "sections.technicalPrerequisites"
  ].includes(section.exportKey);

  const productFitRequest = fetchJsonWithTimeout(`${apiTargets.productKnowledge}/api/product-fit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildProductFitPayload(context))
  })
    .then(normalizeProductFit)
    .catch(() => []);

  const relevantRequest = shouldFetchRelevant
    ? productFitRequest
        .then((fetchedProductKnowledge) =>
          fetchJsonWithTimeout(`${apiTargets.relevantExperience}/api/relevant-experience/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(buildRelevantExperiencePayload(section, context, mergeProductKnowledge(existingProductKnowledge, fetchedProductKnowledge)))
          })
        )
        .then(normalizeRelevantExperience)
        .catch(() => ({ matches: [] }))
    : Promise.resolve({ matches: [] });

  const [fetchedProductKnowledge, relevantExperience] = await Promise.all([productFitRequest, relevantRequest]);
  const mergedProductKnowledge = mergeProductKnowledge(existingProductKnowledge, fetchedProductKnowledge);
  return {
    productKnowledge: mergedProductKnowledge,
    relevantExperience,
    citations: buildCitations(mergedProductKnowledge, relevantExperience)
  };
}

async function localSectionGeneration(body) {
  const section = body.section || {};
  const context = body.povContext || body.intake || {};
  const apiContext = await fetchSectionContext(section, context, body.productKnowledge || []);
  const productKnowledge = apiContext.productKnowledge;
  const relevantExperience = apiContext.relevantExperience;
  const target = section.ai?.target || "draft";
  const sources = {
    productKnowledge: productKnowledge.length ? [`${productKnowledge.length} product recommendation(s)`] : [],
    relevantExperience: relevantExperience.matches?.length ? [`${relevantExperience.matches.length} similar experience match(es)`] : [],
    fallback: ["local concise formatter"]
  };

  if (target === "rows" || target === "Purpose / Description") {
    return { target, rows: generateRows(section, context, productKnowledge, relevantExperience), citations: apiContext.citations, sources };
  }
  if (target === "lists") {
    return { target, lists: generateLists(section, context, productKnowledge, relevantExperience), citations: apiContext.citations, sources };
  }
  return { target, draft: generateDraft(section, context, productKnowledge, relevantExperience), citations: apiContext.citations, sources };
}

function localApiBridge() {
  return {
    name: "local-api-bridge",
    configureServer(server) {
      server.middlewares.use("/api/product-knowledge", async (req, res) => {
        if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed." });
        try {
          const body = await readRequestJson(req);
          const endpoint = productKnowledgeActions[body.action || "productFit"];
          if (!endpoint) return sendJson(res, 400, { error: "Unsupported Product Knowledge action." });
          const upstream = await fetch(`${apiTargets.productKnowledge}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body.payload || {})
          });
          return sendJson(res, upstream.status, await upstream.json());
        } catch (error) {
          return sendJson(res, 502, { error: `Product Knowledge API unavailable: ${error.message}` });
        }
      });

      server.middlewares.use("/api/generate-section", async (req, res) => {
        if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed." });
        try {
          const body = await readRequestJson(req);
          return sendJson(res, 200, await localSectionGeneration(body));
        } catch (error) {
          return sendJson(res, 400, { error: `Could not generate local section draft: ${error.message}` });
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), localApiBridge()],
  server: {
    proxy: {
      "/api/account-maps": {
        target: apiTargets.accountMap,
        changeOrigin: true
      },
      "/api/diagrams": {
        target: apiTargets.diagram,
        changeOrigin: true
      },
      "/api/image-diagrams": {
        target: apiTargets.diagram,
        changeOrigin: true
      },
      "/api/prompt-helper": {
        target: apiTargets.diagram,
        changeOrigin: true
      },
      "/api/relevant-experience": {
        target: apiTargets.relevantExperience,
        changeOrigin: true
      }
    }
  }
});
