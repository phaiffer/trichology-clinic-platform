# Architecture

## Monorepo

- `apps/frontend`
- `apps/backend`
- `docs`

This split keeps UI, API, and project guidance independent while still easy to work on locally.

## Backend Style

The backend uses a pragmatic layered architecture inside business modules:

- `domain`: entities and repository contracts
- `application`: DTOs and use cases
- `infrastructure`: Spring Data adapters and framework concerns
- `presentation`: REST controllers

This gives a clean upgrade path to stricter hexagonal boundaries later without introducing unnecessary complexity now.

### Current Backend Modules

- `shared`: cross-cutting configuration, health endpoint, and exception handling
- `auth`: foundation entities for user and role
- `patient`: implemented vertical slice with CRUD, search, pagination, and email uniqueness checks
- `anamnesis`: implemented template and patient record foundation
- `media`: implemented patient photo metadata, local storage abstraction, upload, listing, detail, file serving, and delete flow
- `scoring`: implemented anamnesis-driven score calculation, persistence, history, and detail flow
- `report`: implemented patient report metadata, local PDF generation, storage, file serving, and delete flow

## Frontend Style

The frontend uses the Next.js App Router with:

- route groups for `auth` and `dashboard`
- shared layout components for sidebar and header
- a small API client in `src/lib`
- server-rendered patient and anamnesis pages
- client-side forms for patient management, safe template creation and editing, and dynamic anamnesis entry

### Current Frontend Routes

- `/login`: placeholder login page
- `/`: dashboard home inside the dashboard shell
- `/patients`: patient list with search and pagination
- `/patients/new`: patient creation form
- `/patients/[id]`: patient details page
- `/patients/[id]/edit`: patient edit form
- `/patients/[id]/photos`: patient photo gallery with category filtering
- `/patients/[id]/photos/upload`: patient photo upload flow
- `/patients/[id]/photos/[photoId]`: patient photo detail view
- `/patients/[id]/photos/compare`: patient before/after side-by-side comparison
- `/patients/[id]/anamnesis/new`: dynamic patient anamnesis entry
- `/patients/[id]/anamnesis/[recordId]`: submitted patient anamnesis record view
- `/patients/[id]/scores/[scoreId]`: stored patient score detail view
- `/patients/[id]/reports/new`: patient report generation flow
- `/patients/[id]/reports/[reportId]`: patient report detail view
- `/anamnesis`: anamnesis template list
- `/anamnesis/templates/new`: anamnesis template creation
- `/anamnesis/templates/[id]`: anamnesis template details
- `/anamnesis/templates/[id]/edit`: anamnesis template editing
- `/photos`: photo module overview
- `/scoring`: placeholder landing page, with real score workflows exposed through patient APIs and patient routes
- `/reports`: simple patient-first reports landing page
- `/reminders`: placeholder

## Local-First Persistence

Development uses an H2 file database configured in PostgreSQL compatibility mode:

- no Docker required
- data persists between restarts
- migration to PostgreSQL later mainly becomes a datasource and migration-tool concern

The media module intentionally separates metadata from physical files:

- patient photo metadata lives in the database
- patient photo binaries live on local disk
- the default storage root is `apps/backend/storage/patient-photos`
- storage paths are persisted as internal metadata, not exposed as arbitrary file access

This keeps the current local-first workflow practical while preserving a clean path
to S3 or GCS later through the storage interface already used by the media service.

The report module now follows the same local-first split:

- report metadata lives in the database
- generated PDFs live on local disk
- the default storage root is `apps/backend/storage/reports`
- stored report paths are internal metadata, not arbitrary filesystem URLs
- PDF generation and file storage are isolated behind report-specific infrastructure interfaces so cloud storage can replace the local adapter later without changing report endpoints

## Security Baseline

- Spring Security enabled from day one
- health and H2 console are always open
- bootstrap mode can keep application endpoints open through configuration
- password encoder available for future auth flows
- CORS restricted by environment configuration
- consent fields included in patient aggregate
- duplicate patient email is handled explicitly as a conflict

## Patient Module Design Notes

- listing supports `search`, `page`, and `size` query parameters
- search is currently name-oriented and matches first name, last name, or full name text
- pagination defaults to page `0` and size `10`
- delete is currently a hard delete

This project is still too early for soft delete because there is no audit trail,
restore flow, permission model, or downstream data lifecycle policy yet. A hard
delete keeps the baseline simpler and more honest until those requirements exist.

## Anamnesis Module Design Notes

The anamnesis module now separates three concerns clearly:

- template definition: reusable structure and ordered question list
- patient record: one completed anamnesis submission for one patient using one template
- answer items: one stored answer per question inside a patient record

Supported question types:

- `TEXT`
- `TEXTAREA`
- `NUMBER`
- `DATE`
- `SINGLE_CHOICE`
- `MULTIPLE_CHOICE`
- `BOOLEAN`

Current design choices:

- template questions are dynamic and backend-defined
- choice options are configured per question
- answers are stored independently from scoring
- anamnesis records snapshot the template name used at submission time
- answer rows snapshot question label, type, order, scoring weight, and option scores at submission time
- no conditional logic yet, but question type and option structure keep that path open later

Template editing policy:

- template edits are future-only and do not mutate stored patient answers
- inactive templates stay readable but are excluded from new submissions
- question type changes are rejected after the question has stored answers
- question removal is rejected after the question has stored answers
- metadata, helper text, required flag, order, scoring weight, options, and option scores can be updated for future submissions
- this step intentionally avoids full template version tables and keeps the current monorepo boundaries intact

## Media Module Design Notes

The first media slice focuses on clinically useful before/after photos without
expanding the architecture beyond what the current monorepo needs.

Current design choices:

- one patient photo record stores metadata only
- photo files are stored on disk with UUID-based names to avoid collisions
- files are grouped by patient id and current year/month folders
- a photo can optionally reference one anamnesis record
- supported categories are `BEFORE`, `AFTER`, and `PROGRESS`
- upload accepts one or multiple files with shared metadata in the same request
- allowed MIME types are `image/jpeg`, `image/png`, and `image/webp`
- delete removes both the metadata row and the stored file
- image serving goes through a controller route that resolves only stored paths and sets the recorded content type

Current limitations inside the media slice:

- no thumbnail generation or image processing
- no metadata edit endpoint yet
- no advanced comparison slider, only side-by-side display
- storage is local filesystem only for now

## Scoring Module Design Notes

The scoring module now sits directly on top of anamnesis submissions instead of
introducing a separate scoring engine abstraction.

Current design choices:

- one score result belongs to one patient and one anamnesis record
- recalculating from the same record creates a new stored result, preserving history
- score results store total score, classification, summary, and itemized contributions
- itemized contributions are persisted so later template edits do not rewrite historical results
- score recalculation reads the answer snapshot stored on the anamnesis record instead of the live template question row
- score classification is derived from configurable backend thresholds
- report generation keeps linking to one stored score result and now validates the score/anamnesis pairing when both are selected

Current MVP scoring rules:

- `BOOLEAN`: `true` contributes the configured question weight; `false` contributes zero
- `SINGLE_CHOICE`: selected option score multiplied by question weight when present
- `MULTIPLE_CHOICE`: sum of selected option scores multiplied by question weight when present
- `NUMBER`: numeric answer multiplied by question weight when configured
- `TEXT`, `TEXTAREA`, and `DATE`: ignored for scoring in this step

Template scoring configuration:

- `scoringWeight` remains the existing question-level numeric multiplier
- choice questions now also support `optionScores`
- configuration lives inside the anamnesis template itself to avoid a premature scoring subsystem

## Report Module Design Notes

The first report slice stays pragmatic and local-first.

Current design choices:

- one report row stores metadata only, never the PDF binary
- the report can optionally reference one anamnesis record and one score result
- selected patient photos are persisted as patient-owned photo ids scoped to the report
- PDFs are generated on the backend from HTML and written to local disk
- report file access goes through a controller route that resolves only stored report paths and always serves `application/pdf`
- deleting a report removes both metadata and the stored local file

Current report content assembly:

- clinic title area from report configuration
- patient identification from the patient aggregate
- optional anamnesis summary from the selected record answers
- optional scoring summary from the selected score result
- selected patient photos embedded directly into the generated PDF
- patient notes plus optional clinician summary text entered during generation

Because report assembly now reads the stored anamnesis answer snapshot and stored score results, later template edits do not retroactively change historical PDFs that were already generated or the source data used to generate new reports from older records.

Current report limitations:

- no versioned templates or report theming yet
- no browser-side preview renderer beyond opening the file route
- no score rule versioning or score editing yet
- no pagination tuning, signature block, or richer branding yet

## Current Scope Validation

The current codebase already supports:

- application startup structure for frontend and backend
- local persistence without Docker
- health endpoint
- patient CRUD API with detail, update, delete, search, and pagination
- frontend-to-backend integration for patient list, search, detail, create, edit, and delete
- anamnesis template creation, safe editing, status toggling, listing, and details
- patient anamnesis submission, history, and record viewing
- patient photo upload, gallery filtering, detail, delete, and before/after comparison
- patient score calculation from anamnesis, score history, and score detail viewing
- patient report generation, listing, detail, open/download, and delete
- dashboard structure for future modules

## Evolution Paths

- Add Flyway before production adoption
- Replace open patient endpoints with authenticated role-based access
- Introduce object storage adapters for photos
- Add explicit template version history and score rule version history when audit-grade edit lineage becomes necessary
- Add report template versions and presentation refinements
- Add notification provider abstraction for WhatsApp reminders
