# OPSWAT PoV Studio

Internal OPSWAT workspace for building customer-specific Proof of Value documents.

The app is designed around modular PoV authoring: a user chooses the sections
that matter for a customer, generates or edits those sections one by one, and
exports a tailored Word document using OPSWAT styling and templates.

## Run

```bash
npm install
npm run dev -- --port 5173
```

Open `http://127.0.0.1:5173/`.

## Current Prototype

- PoV editor layout based on the supplied mockup
- Section library and document outline
- RAG-oriented AI draft assistant UI
- Section generation through a proxied backend endpoint
- Product Knowledge recommendations for concise product scope suggestions
- OPSWAT Word template export for structured PoV sections
- Responsive layout for desktop and narrow preview panes

## Product Direction

PoV Studio should become a modular document assembly system rather than a
generic blank-page AI writer. Each section should have:

- structured inputs
- optional generation or improvement actions
- source/evidence metadata
- review status
- export rendering rules

The SAAB KIOSK/MFT PoV example shows the core section families we need to
support: executive narrative, customer discovery, product scope, prerequisites,
RACI/timeline, success criteria, functional tests, results, diagrams, and
sign-off.

## AI/RAG Configuration

The browser calls `/api/generate-section` in this app. That Cloudflare Pages
Function proxies to the shared RAG service, so Anthropic keys and RAG access
tokens stay out of the browser.

Required environment variables for generation:

```bash
RAG_API_BASE_URL=https://your-rag-service.example.com
RAG_ACCESS_TOKEN=optional-shared-rag-token
```

Product fit suggestions call `/api/product-knowledge`, which proxies selected
Product Knowledge API endpoints from Cloudflare Pages.

Required environment variables for product knowledge:

```bash
PRODUCT_KNOWLEDGE_API_BASE_URL=https://your-product-knowledge-service.example.com
PRODUCT_KNOWLEDGE_ACCESS_TOKEN=optional-shared-product-knowledge-token
```

The RAG backend endpoint used by PoV Studio is:

```text
POST /api/pov/section-draft
```

## Related OPSWAT APIs

See [docs/api-integration.md](docs/api-integration.md) for how the existing
OPSWAT prototype APIs should fit into PoV Studio.

## Development Notes

See [docs/development-plan.md](docs/development-plan.md) for the current review
findings and near-term build priorities.
