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
- `scoring`: read-only patient score result listing foundation
- `report`: implemented patient report metadata, local PDF generation, storage, file serving, and delete flow

## Frontend Style

The frontend uses the Next.js App Router with:

- route groups for `auth` and `dashboard`
- shared layout components for sidebar and header
- a small API client in `src/lib`
- server-rendered patient and anamnesis pages
- client-side forms for patient management, template creation, and dynamic anamnesis entry

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
- `/patients/[id]/reports/new`: patient report generation flow
- `/patients/[id]/reports/[reportId]`: patient report detail view
- `/anamnesis`: anamnesis template list
- `/anamnesis/templates/new`: anamnesis template creation
- `/anamnesis/templates/[id]`: anamnesis template details
- `/photos`: photo module overview
- `/scoring`: placeholder landing page, with score data now exposed through patient APIs
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
- no conditional logic yet, but question type and option structure keep that path open later

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

The scoring module is still intentionally narrow in this step.

Current design choices:

- score results are patient-owned records
- score results are currently exposed as read-only API data for report assembly
- score classification is stored explicitly so the report can present a clinician-friendly label
- score creation and calculation flows are still intentionally deferred

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

Current report limitations:

- no versioned templates or report theming yet
- no browser-side preview renderer beyond opening the file route
- no score calculation workflow yet, only score selection if stored results exist
- no pagination tuning, signature block, or richer branding yet

## Current Scope Validation

The current codebase already supports:

- application startup structure for frontend and backend
- local persistence without Docker
- health endpoint
- patient CRUD API with detail, update, delete, search, and pagination
- frontend-to-backend integration for patient list, search, detail, create, edit, and delete
- anamnesis template creation, listing, and details
- patient anamnesis submission, history, and record viewing
- patient photo upload, gallery filtering, detail, delete, and before/after comparison
- patient score result listing by patient
- patient report generation, listing, detail, open/download, and delete
- dashboard structure for future modules

## Evolution Paths

- Add Flyway before production adoption
- Replace open patient endpoints with authenticated role-based access
- Introduce object storage adapters for photos
- Add richer scoring creation and calculation flows
- Add report template versions and presentation refinements
- Add notification provider abstraction for WhatsApp reminders
