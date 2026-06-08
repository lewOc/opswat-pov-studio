# API Integration Notes

PoV Studio should use existing OPSWAT APIs where they match the authoring job.
Do not force an API into a section when deterministic app logic or a new
purpose-built service would be cleaner.

## Product Knowledge API

Repository: `lewOc/opswat-product-knowledge-api`

Best fit:

- product scope suggestions
- capability descriptions
- product evidence and citations
- success criteria suggestions
- compliance/control mapping
- technical prerequisite hints

Boundary: product documentation and capability knowledge only. It should not
research accounts, claim delivery experience, or create diagrams.

## Diagram API

Repository: `lewOc/opswat-diagram-api`

Best fit:

- architecture diagrams
- use-case diagrams
- workflow diagrams
- diagram assets for Word export

Boundary: use for real generated diagram artifacts. The current in-app diagram
preview is a deterministic placeholder.

## Relevant Experience API

Repository: `lewOc/opswat-relevant-experience-api`

Best fit:

- optional relevant delivery experience section
- appendix evidence
- similar customer story examples

Boundary: keep source URLs and confidence visible. Do not imply OPSWAT delivered
to the target account unless the source explicitly supports it.

## Account Map API

Repository: `lewOc/opswat-account-map-api`

Best fit:

- "start from account research" flow
- pre-fill intake and suggested use cases
- create an initial customer-specific PoV outline

Boundary: this is heavier than section-by-section drafting. It should be used
as an upstream discovery workflow, not as the default generator behind every
section.

## Account Map Tool

Repository: `lewOc/opswat-account-map-tool`

Best fit:

- UX reference for account mapping workflows
- possible source for account research UI patterns

Boundary: evaluate before coupling. PoV Studio may only need selected concepts
from the tool.
