# Roadmap

## Phase 1

- Add the first incremental Flyway migration after the baseline instead of changing `V1__baseline_schema.sql`
- Finish authentication with login flow and session strategy
- Decide when the project is mature enough to replace hard delete with soft delete plus audit support
- Add explicit template version history and score rule versioning on top of the implemented safe future-only editing workflow
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
- Add observability, testing layers, and delivery pipeline
