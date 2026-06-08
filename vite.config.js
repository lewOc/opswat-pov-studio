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

function useCaseNames(context) {
  const discovered = splitList(context.useCases);
  if (discovered.length) return discovered.slice(0, 5);
  if (context.challenges) return [context.challenges].slice(0, 1);
  return ["Validate the agreed OPSWAT proof-of-value workflow"];
}

function generateRows(section, context, productKnowledge) {
  const products = productNames(context, productKnowledge).join(", ") || "OPSWAT product set";
  const useCases = useCaseNames(context);

  if (section.exportKey === "sections.useCases") {
    return useCases.map((useCase, index) => ({
      ID: `UC-${index + 1}`,
      "Use Case": cleanText(useCase, 90),
      Description: cleanText(`Validate that ${useCase.toLowerCase()} can be completed with clear evidence and audit output.`, 150),
      "Product(s)": products
    }));
  }

  if (section.exportKey === "sections.successCriteria") {
    return useCases.slice(0, 4).map((useCase, index) => ({
      Priority: index === 0 ? "High" : "Medium",
      "Success Criterion": cleanText(`PoV demonstrates ${useCase.toLowerCase()} within the agreed scope.`, 120),
      "Validation Method": "Run the agreed test workflow and capture results.",
      "Threshold / Target": "Pass/fail evidence is available for customer review.",
      Verdict: ""
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
      return {
        "Purpose / Description": cleanText(
          knowledgeByProduct[product] || `Included to support the agreed ${context.customer || "customer"} PoV validation scope.`,
          130
        )
      };
    });
  }

  return [];
}

function generateLists(section, context, productKnowledge) {
  const products = productNames(context, productKnowledge);
  const productText = products.join(", ") || "selected OPSWAT products";
  const firstUseCase = useCaseNames(context)[0];

  if (section.exportKey === "sections.scope") {
    return {
      "In Scope": [
        `Validate ${firstUseCase.toLowerCase()}.`,
        `Configure and test ${productText} for the agreed PoV workflow.`,
        "Capture evidence against agreed success criteria.",
        "Review results, risks, and recommended next steps."
      ].map((item) => cleanText(item, 150)),
      "Out of Scope": [
        "Production rollout or long-term managed service operation.",
        "Unrelated integrations not required for the agreed use cases.",
        "Remediation of customer environment issues outside OPSWAT configuration.",
        "Commercial negotiation or final procurement approval."
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

function generateDraft(section, context) {
  if (section.ai?.target === "intro") {
    return cleanText(
      `${context.customer || "The customer"} will validate the agreed OPSWAT workflow in the context of ${context.industry || "the target environment"}. The PoV will focus on practical evidence, operational fit, and measurable outcomes.`,
      220
    );
  }
  return cleanText(
    `${context.customer || "The customer"} will use this PoV to validate the agreed OPSWAT use cases, confirm success criteria, and capture clear evidence for the next decision point.`,
    220
  );
}

function localSectionGeneration(body) {
  const section = body.section || {};
  const context = body.povContext || body.intake || {};
  const productKnowledge = body.productKnowledge || [];
  const target = section.ai?.target || "draft";

  if (target === "rows" || target === "Purpose / Description") {
    return { target, rows: generateRows(section, context, productKnowledge), citations: [], sources: { dev: ["local deterministic generator"] } };
  }
  if (target === "lists") {
    return { target, lists: generateLists(section, context, productKnowledge), citations: [], sources: { dev: ["local deterministic generator"] } };
  }
  return { target, draft: generateDraft(section, context), citations: [], sources: { dev: ["local deterministic generator"] } };
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
          return sendJson(res, 200, localSectionGeneration(body));
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
