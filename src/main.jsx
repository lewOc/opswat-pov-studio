import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
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
import { exportSelectedSectionsDocx } from "./docxExport";
import {
  attachSectionTemplate,
  conciseGenerationGuidance,
  createSection as createSectionModel,
  emptyPovContext,
  getAiPlan,
  getAiReadiness,
  hasSectionInput,
  libraryGroups,
  sectionTemplates,
  serializeSection,
  serializeSectionForStorage,
  splitPovList
} from "./sectionModel";
import "./styles.css";

const navItems = [
  { label: "PoV Projects", icon: FileText, active: true },
  { label: "Templates", icon: LayoutTemplate },
  { label: "Diagrams", icon: GitBranch },
  { label: "Exports", icon: Download },
  { label: "Settings", icon: Settings }
];

const sectionIconMap = {
  Blocks,
  ClipboardCheck,
  Clock3,
  FileText,
  Gauge,
  GitBranch,
  Layers3,
  ListChecks,
  LockKeyhole,
  Network,
  PanelLeft,
  Pencil,
  Send,
  Settings,
  ShieldCheck,
  Table2,
  Target,
  UserRound
};

const draftStorageKey = "opswat-pov-studio:draft:v1";

function iconForTemplate(template) {
  return sectionIconMap[template.iconKey] || FileText;
}

function withTemplateIcons(template) {
  return { ...template, icon: iconForTemplate(template) };
}

function readSavedDraft() {
  try {
    const raw = window.localStorage.getItem(draftStorageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeSavedDraft(draft) {
  try {
    window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
  } catch {
    // Local persistence is a convenience; app editing should continue if storage is unavailable.
  }
}

function rehydrateSections(savedSections = []) {
  return savedSections
    .map((section) => attachSectionTemplate(section, iconForTemplate))
    .filter(Boolean);
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
    if (payload.target === "rows" && Array.isArray(payload.rows)) {
      const columns = Object.keys(current.rows?.[0] || payload.rows?.[0] || {});
      const rows = normalizeGeneratedRows(payload.rows, columns);
      return {
        ...current,
        rows: rows.length ? rows : current.rows,
        citations: payload.citations || []
      };
    }
    if (payload.target === "lists" && payload.lists && typeof payload.lists === "object") {
      const lists = normalizeGeneratedLists(payload.lists, Object.keys(current.lists || {}));
      return {
        ...current,
        lists: Object.keys(lists).length ? lists : current.lists,
        citations: payload.citations || []
      };
    }
    return current;
  });
}

function normalizeGeneratedRows(rows, columns) {
  if (!Array.isArray(rows) || !columns.length) return [];
  return rows
    .map((row) => {
      if (Array.isArray(row)) {
        return Object.fromEntries(columns.map((column, index) => [column, compactText(row[index], 180)]));
      }
      if (!row || typeof row !== "object") return null;
      const entries = Object.entries(row);
      return Object.fromEntries(
        columns.map((column) => {
          const direct = row[column];
          const loose = entries.find(([key]) => key.toLowerCase().replace(/[^a-z0-9]/g, "") === column.toLowerCase().replace(/[^a-z0-9]/g, ""));
          return [column, compactText(direct ?? loose?.[1] ?? "", 180)];
        })
      );
    })
    .filter((row) => row && Object.values(row).some((value) => String(value || "").trim()));
}

function normalizeGeneratedLists(lists, listNames) {
  if (!lists || typeof lists !== "object" || !listNames.length) return {};
  const entries = Object.entries(lists);
  return Object.fromEntries(
    listNames.map((listName) => {
      const direct = lists[listName];
      const loose = entries.find(([key]) => key.toLowerCase().replace(/[^a-z0-9]/g, "") === listName.toLowerCase().replace(/[^a-z0-9]/g, ""));
      const items = Array.isArray(direct ?? loose?.[1]) ? direct ?? loose?.[1] : [];
      return [listName, items.map((item) => compactText(item, 160)).filter(Boolean).slice(0, 5)];
    })
  );
}

function compactText(value, maxLength = 120) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
}

function buildProductFitPayload(povContext) {
  const problem = [povContext.challenges, povContext.useCases].filter(Boolean).join("\n");
  const workflow = povContext.useCases || povContext.challenges || povContext.products;
  const constraints = splitPovList([povContext.products, povContext.challenges].filter(Boolean).join(", "));

  return {
    problem,
    industry: povContext.industry,
    workflow,
    compliance_drivers: splitPovList(povContext.compliance),
    constraints,
    top_k: 4,
    max_evidence: 2
  };
}

function normalizeProductRecommendations(payload) {
  const items = payload?.recommended_products || payload?.products || payload?.results || [];
  return items
    .map((item) => {
      const evidence = Array.isArray(item.evidence) ? item.evidence : [];
      const evidenceReason = evidence.find((entry) => entry.summary || entry.text || entry.content || entry.title);
      return {
        product: item.product || item.name || item.title || item.slug || "",
        confidence: item.confidence || item.score || "",
        reason: compactText(
          item.reason ||
            item.fit_reason ||
            item.recommendation ||
            item.summary ||
            item.description ||
            evidenceReason?.summary ||
            evidenceReason?.text ||
            evidenceReason?.content ||
            "Potential fit based on the captured PoV context.",
          130
        ),
        evidenceCount: evidence.length
      };
    })
    .filter((item) => item.product);
}

function summarizeProductKnowledge(productKnowledge) {
  const recommendations = productKnowledge?.recommendations || [];
  return recommendations.slice(0, 4).map((item) => ({
    product: item.product,
    reason: item.reason,
    confidence: item.confidence,
    evidenceCount: item.evidenceCount
  }));
}

async function readJsonResponse(response, fallbackError) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return { error: fallbackError };
  }
  try {
    return await response.json();
  } catch {
    return { error: fallbackError };
  }
}

function App() {
  const savedDraft = useMemo(() => readSavedDraft(), []);
  const [documentStage, setDocumentStage] = useState(savedDraft?.documentStage || "start");
  const [isContextEditing, setIsContextEditing] = useState(false);
  const [activeLibraryGroup, setActiveLibraryGroup] = useState("setup");
  const [sections, setSections] = useState(() => rehydrateSections(savedDraft?.sections));
  const [activeSectionId, setActiveSectionId] = useState(savedDraft?.activeSectionId || null);
  const [isDropActive, setIsDropActive] = useState(false);
  const [draggedSectionId, setDraggedSectionId] = useState(null);
  const [povContext, setPovContext] = useState({ ...emptyPovContext, ...(savedDraft?.povContext || {}) });
  const [productKnowledge, setProductKnowledge] = useState(savedDraft?.productKnowledge || null);
  const [isProductKnowledgeLoading, setIsProductKnowledgeLoading] = useState(false);
  const [productKnowledgeMessage, setProductKnowledgeMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const activeSection = sections.find((section) => section.id === activeSectionId) || null;
  const hydratedTemplates = useMemo(() => sectionTemplates.map(withTemplateIcons), []);
  const visibleLibraryItems = hydratedTemplates.filter((item) => item.group === activeLibraryGroup);
  const addedSectionIds = new Set(sections.map((section) => section.id));
  const activeAiPlan = getAiPlan(activeSection);
  const aiReadiness = getAiReadiness(activeSection, povContext);
  const canGenerateActiveSection = Boolean(activeAiPlan && aiReadiness.ready);
  const canExportSections = sections.length > 0;
  const [isGenerating, setIsGenerating] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState("");
  const projectTitle = povContext.customer.trim() ? `${povContext.customer} PoV` : "New PoV";

  useEffect(() => {
    writeSavedDraft({
      documentStage,
      productKnowledge,
      povContext,
      activeSectionId,
      sections: sections.map(serializeSectionForStorage)
    });
  }, [activeSectionId, documentStage, productKnowledge, povContext, sections]);

  function addSection(sectionId, insertIndex = sections.length) {
    const template = hydratedTemplates.find((item) => item.section === sectionId);
    if (!template || (!template.repeatable && addedSectionIds.has(sectionId))) return;
    const nextSection = attachSectionTemplate(createSectionModel(template, povContext), iconForTemplate);
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

  function updatePovContext(field, value) {
    setPovContext((current) => ({ ...current, [field]: value }));
  }

  function enterEditor() {
    setDocumentStage("editor");
    setIsContextEditing(false);
  }

  async function handleSuggestProductFit() {
    if (isProductKnowledgeLoading) return;
    setIsProductKnowledgeLoading(true);
    setProductKnowledgeMessage("");
    try {
      const response = await fetch("/api/product-knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "productFit",
          payload: buildProductFitPayload(povContext)
        })
      });
      const payload = await readJsonResponse(response, "Product Knowledge API is not configured for this local environment.");
      if (!response.ok) throw new Error(payload.error || "Product Knowledge lookup failed.");
      const recommendations = normalizeProductRecommendations(payload);
      setProductKnowledge({
        generatedAt: new Date().toISOString(),
        recommendations,
        raw: payload
      });
      setProductKnowledgeMessage(
        recommendations.length
          ? `${recommendations.length} concise product recommendation(s) found.`
          : "Product Knowledge returned no product recommendations for this context."
      );
    } catch (error) {
      setProductKnowledgeMessage(error.message || "Product Knowledge API is unavailable.");
    } finally {
      setIsProductKnowledgeLoading(false);
    }
  }

  function handleApplyProductKnowledge() {
    const recommendations = productKnowledge?.recommendations || [];
    if (!recommendations.length) return;
    const template = hydratedTemplates.find((item) => item.exportKey === "sections.productsInScope");
    if (!template) return;

    const rows = recommendations.slice(0, 4).map((item) => ({
      "Product / Module": item.product,
      Version: "",
      "Purpose / Description": item.reason
    }));

    setSections((current) => {
      const existing = current.find((section) => section.template.exportKey === "sections.productsInScope");
      if (existing) {
        return current.map((section) =>
          section.id === existing.id
            ? {
                ...section,
                data: { ...section.data, rows },
                reviewState: "In progress"
              }
            : section
        );
      }
      const nextSection = attachSectionTemplate(createSectionModel(template, povContext), iconForTemplate);
      return [
        ...current,
        {
          ...nextSection,
          data: { ...nextSection.data, rows },
          reviewState: "In progress"
        }
      ];
    });
    setActiveSectionId(template.section);
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
          intake: povContext,
          povContext,
          productKnowledge: summarizeProductKnowledge(productKnowledge),
          generationGuidance: conciseGenerationGuidance
        })
      });
      const payload = await readJsonResponse(response, "AI generation is not configured for this local environment.");
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
            intake={povContext}
            onBack={() => setDocumentStage("start")}
            onChange={updatePovContext}
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
                intake={povContext}
                onBack={() => setIsContextEditing(false)}
                onChange={updatePovContext}
                onSubmit={() => setIsContextEditing(false)}
              />
            ) : (
              <ContextSummary intake={povContext} onEdit={() => setIsContextEditing(true)} />
            )}
            <ProductKnowledgePanel
              isLoading={isProductKnowledgeLoading}
              message={productKnowledgeMessage}
              onApply={handleApplyProductKnowledge}
              onSuggest={handleSuggestProductFit}
              recommendations={productKnowledge?.recommendations || []}
            />
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

function ProductKnowledgePanel({ isLoading, message, onApply, onSuggest, recommendations }) {
  const hasRecommendations = recommendations.length > 0;

  return (
    <div className="product-knowledge-card">
      <div className="product-knowledge-head">
        <span>
          <ShieldCheck size={17} />
          Product Knowledge
        </span>
        <button className="secondary-button compact-text" disabled={isLoading} onClick={onSuggest}>
          <Search size={15} />
          {isLoading ? "Checking" : "Suggest"}
        </button>
      </div>
      {hasRecommendations ? (
        <div className="product-knowledge-list">
          {recommendations.slice(0, 4).map((item) => (
            <article key={item.product}>
              <strong>{item.product}</strong>
              <p>{item.reason}</p>
              <span>
                {item.confidence ? `Confidence ${item.confidence}` : "Recommended fit"}
                {item.evidenceCount ? ` - ${item.evidenceCount} evidence source(s)` : ""}
              </span>
            </article>
          ))}
        </div>
      ) : (
        <p className="product-knowledge-empty">Suggest concise product fit from the customer context before drafting product-led sections.</p>
      )}
      {message && <div className={`product-knowledge-message ${message.includes("failed") || message.includes("unavailable") || message.includes("not configured") ? "error" : ""}`}>{message}</div>}
      <button className="outline-button" disabled={!hasRecommendations} onClick={onApply}>
        <Plus size={16} />
        Apply to Products in Scope
      </button>
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
