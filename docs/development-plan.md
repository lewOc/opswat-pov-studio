# Development Plan

This file captures the current review notes so the GitHub repo starts with a
clear dev direction.

## Product Goal

PoV Studio generates customer-specific Proof of Value documents. Users should
choose the sections they need, generate or edit them one at a time, review the
content, and export a polished OPSWAT Word document.

The SAAB KIOSK/MFT PoV example shows the app needs to support a real modular
document, including:

- revision control and engagement metadata
- executive summary and purpose narrative
- business objectives and scope
- product-specific solution blocks
- infrastructure details and prerequisites
- stakeholders, RACI, timeline, and cadence
- success criteria
- functional tests and results
- diagrams and captions
- conclusion and sign-off

## Immediate Priorities

1. Expand Word export so every selected section can render, not only setup
   sections.
2. Make section data reactive to PoV Intake updates, with clear overwrite rules
   for fields the user has edited manually.
3. Normalize local and deployed generation paths so `/api/generate-section`
   behaves the same in development and production.
4. Replace the deterministic diagram placeholder with Diagram API integration.
5. Fix layout polish issues in the section library tabs and narrow viewports.
6. Introduce a stable section model: inputs, generated draft, sources, review
   status, and export renderer.

## Known Review Findings

- Current DOCX export only includes cover, executive summary, products in scope,
  and customer environment.
- Intake values are copied into a section only when the section is created.
- The dev proxy bypasses the Cloudflare function and rewrites directly to an
  upstream endpoint.
- Several visible controls are intentionally disabled placeholders.
- The library group tabs define five columns for six groups.
- The app is desktop-first and needs a deliberate responsive strategy.

## Working Branch Strategy

- `main`: deployable baseline.
- `dev`: active integration branch for product build-out.
- Feature branches should be cut from `dev` for larger units of work.
