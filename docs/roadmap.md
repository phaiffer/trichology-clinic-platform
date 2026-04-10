# Roadmap

## Phase 1

- Finish authentication with login flow and session strategy
- Decide when the project is mature enough to replace hard delete with soft delete plus audit support
- Add score rule versioning and safe template evolution on top of the implemented scoring workflow
- Decide when conditional question logic becomes necessary for anamnesis templates
- Add metadata editing and thumbnail generation for patient photos
- Prepare the media and report storage adapters for optional cloud object storage migration

## Phase 2

- Add conditional question logic and richer template constraints
- Persist clinical evaluations linked to anamnesis records
- Add richer score formulas, normalization rules, and clinician review controls
- Add richer report templates, signature blocks, and clinical timeline views

## Phase 3

- Add export audit trails and report template versioning
- Introduce WhatsApp reminder adapters with opt-in controls
- Add cloud-ready media storage option with environment-based selection

## Phase 4

- Add role-based authorization
- Add Flyway and PostgreSQL production profile
- Add observability, testing layers, and delivery pipeline
