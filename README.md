# Trichology Clinical Monorepo

Local-first monorepo for a trichology clinical web application.

## Overview

This repository contains a local-first baseline for a trichology clinic platform.
It is intentionally small, but already organized for professional evolution:

- Next.js frontend for the clinical workspace
- Spring Boot backend with layered module boundaries
- PostgreSQL database for local development without Docker
- foundation entities and placeholder areas for future modules

## Monorepo Structure

- `apps/frontend`: Next.js 14 + TypeScript + Tailwind user interface
- `apps/backend`: Spring Boot 3 + Java 21 + Maven API
- `docs`: architecture, local setup, overview, and roadmap

## Principles

- Local development without Docker
- English-only code and comments
- Clean, maintainable architecture
- Explicit Flyway migrations with PostgreSQL as the standard local database
- Security and LGPD-conscious foundation

## Current Implemented Scope

- health endpoint at `/api/health`
- patient CRUD API with get by id, update, hard delete, search, and pagination
- frontend patient list page with search and pagination
- frontend patient details page
- frontend patient creation form connected to the backend
- frontend patient edit form connected to the backend
- frontend patient delete action with confirmation
- anamnesis template creation, safe editing, status toggling, listing, and details
- dynamic patient anamnesis submission based on selected templates
- patient anamnesis history and submitted record viewing
- patient photo upload with local filesystem storage and database metadata
- patient photo gallery, filtering, details, delete, and before/after comparison
- native patient score calculation, persistence, history, and details linked to anamnesis submissions
- patient clinical PDF report generation with local disk storage and database metadata
- patient report listing, details, open/download, and delete flow
- dashboard shell with sidebar and header
- photo module overview page plus placeholder reminders page
- foundational backend entities for auth

## Patient Endpoints

- `GET /api/patients?search=&page=0&size=10`
- `GET /api/patients/{id}`
- `POST /api/patients`
- `PUT /api/patients/{id}`
- `DELETE /api/patients/{id}`

## Anamnesis Endpoints

- `GET /api/anamnesis/templates`
- `GET /api/anamnesis/templates/{id}`
- `POST /api/anamnesis/templates`
- `PUT /api/anamnesis/templates/{id}`
- `PATCH /api/anamnesis/templates/{id}/status`
- `GET /api/patients/{patientId}/anamnesis-records`
- `GET /api/patients/{patientId}/anamnesis-records/{recordId}`
- `POST /api/patients/{patientId}/anamnesis-records`

## Photo Endpoints

- `POST /api/patients/{patientId}/photos`
- `GET /api/patients/{patientId}/photos`
- `GET /api/patients/{patientId}/photos/{photoId}`
- `GET /api/patients/{patientId}/photos/{photoId}/file`
- `DELETE /api/patients/{patientId}/photos/{photoId}`

## Score Endpoints

- `POST /api/patients/{patientId}/anamnesis-records/{recordId}/scores`
- `GET /api/patients/{patientId}/scores`
- `GET /api/patients/{patientId}/scores/{scoreId}`

## Report Endpoints

- `POST /api/patients/{patientId}/reports`
- `GET /api/patients/{patientId}/reports`
- `GET /api/patients/{patientId}/reports/{reportId}`
- `GET /api/patients/{patientId}/reports/{reportId}/file`
- `DELETE /api/patients/{patientId}/reports/{reportId}`

## Patient Flow

1. Create a patient from `/patients/new`
2. Return to `/patients` and search or paginate through records
3. Open `/patients/{id}` to review patient details
4. Edit the patient at `/patients/{id}/edit`
5. Delete the patient from the details page when needed

## Anamnesis Flow

1. Create reusable anamnesis templates in `/anamnesis/templates/new`
2. Review template structure in `/anamnesis/templates/{id}`
3. Edit metadata, questions, scoring settings, or status in `/anamnesis/templates/{id}/edit`
4. Start anamnesis from `/patients/{id}`
5. Select an active template and answer dynamically rendered questions
6. Save the patient anamnesis record
7. Review submitted history and open a stored record from the patient details page

## Template Editing Safety Policy

- template edits apply to future anamnesis submissions only
- stored patient answers are snapshotted when a record is created, so later template edits do not rewrite historical record labels, order, or answer interpretation
- score calculations read the stored answer snapshot, so recalculating from an older anamnesis record stays aligned with the historical question configuration used when that record was submitted
- stored score results remain immutable and are never recalculated retroactively by template edits
- generated reports remain stable because they read stored records and stored score results, not live template configuration
- inactive templates stay readable in history and details pages, but they are excluded from new patient anamnesis submissions
- removing a question is only allowed when that question has no stored patient answers yet
- changing a question type is rejected once that question already has stored patient answers, because the meaning of historical answers would become ambiguous

## Patient Photo Flow

1. Open a patient details page and enter the patient photo area
2. Upload one or more JPEG, PNG, or WebP files with shared metadata
3. Optionally associate the upload with an anamnesis record
4. Review the gallery and filter by category when needed
5. Open photo details or compare one BEFORE photo with one AFTER photo
6. Delete a photo when both metadata and local file should be removed

## Patient Report Flow

1. Open a patient details page
2. Enter the reports section and choose `Generate report`
3. Optionally select one anamnesis record, one score result from that same record, and any patient photos
4. Enter the report title and optional clinician summary
5. Generate the PDF on the backend and store the file locally
6. Review report metadata, open the PDF, download it, or delete it

## Patient Scoring Flow

1. Open a patient anamnesis record
2. Choose `Calculate score`
3. The backend evaluates the stored answers using the anamnesis template scoring configuration
4. A new score result is persisted with total score, classification, summary, and itemized contributions
5. Review the result from patient score history or the score details page
6. Optionally select that stored result during report generation

## Media Storage Strategy

- image binaries are stored on local disk under `apps/backend/storage/patient-photos` by default
- only metadata is stored in PostgreSQL
- stored file names are UUID-based to avoid collisions
- files are organized by patient id and year/month folders
- storage configuration is centralized in backend application properties and environment variables
- the storage implementation is isolated so cloud object storage can replace it later without changing the patient photo API

## Report Generation Strategy

- report metadata is stored in the database
- generated PDF files are stored on local disk under `apps/backend/storage/reports` by default
- PDFs are generated on the backend from structured HTML using a simple HTML-to-PDF library
- report storage configuration is centralized under backend `app.report` properties
- only stored report paths can be resolved back to files, so the filesystem is not exposed arbitrarily
- deleting a report removes the metadata row and attempts to remove the stored PDF file

## Report Data Assembly

The first report module assembles one PDF from existing local data:

- patient identification and patient notes from the patient module
- optional anamnesis template name, submission date, and stored answers from the anamnesis module
- optional stored score label, numeric value, classification, and summary from the scoring module
- selected patient photos and photo notes from the media module
- optional clinician summary text provided at report generation time

## Upload Validation

- allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- default max file size: `5242880` bytes per file
- original file names are sanitized before metadata storage
- file-serving routes resolve only previously stored paths and reject arbitrary filesystem traversal

## Supported Question Types

- `TEXT`
- `TEXTAREA`
- `NUMBER`
- `DATE`
- `SINGLE_CHOICE`
- `MULTIPLE_CHOICE`
- `BOOLEAN`

## Score Calculation Rules

- `BOOLEAN`: contributes the question weight when the answer is `true`; `false` contributes zero
- `SINGLE_CHOICE`: contributes the selected option score, multiplied by question weight when present
- `MULTIPLE_CHOICE`: contributes the sum of selected option scores, multiplied by question weight when present
- `NUMBER`: contributes `answer * questionWeight` when a question weight is configured
- `TEXT`, `TEXTAREA`, and `DATE`: do not contribute in this MVP
- a record must contain at least one scorable configured answer to produce a score result

## Score Classification

- `LOW`: total score below the moderate threshold
- `MODERATE`: total score from the moderate threshold up to the high threshold
- `HIGH`: total score at or above the high threshold
- default thresholds are controlled by `APP_SCORING_MODERATE_THRESHOLD=10` and `APP_SCORING_HIGH_THRESHOLD=20`

## Local Prerequisites

- Java 21
- Maven 3.9+
- Node.js 20+
- npm 10+

## Environment Files

Backend example:

- `apps/backend/.env.example`

Frontend example:

- `apps/frontend/.env.local.example`

## Local Run Steps

1. Copy `apps/backend/.env.example` values into your local environment as needed.
2. Copy `apps/frontend/.env.local.example` to `apps/frontend/.env.local` if you want to override the default frontend API URL.
3. Create the local PostgreSQL database once:
   `psql -U postgres -c "CREATE DATABASE trichology_clinic;"`
4. Start the backend:
   `cd apps/backend`
   `mvn spring-boot:run`
5. Start the frontend in another terminal:
   `cd apps/frontend`
   `npm install`
   `npm run dev`
6. Open `http://localhost:3000`

Flyway runs automatically during backend startup.
On a clean database it applies `V1__baseline_schema.sql`.
If you already have a local schema created before Flyway was introduced, `baseline-on-migrate=true` lets the app adopt it without re-running the baseline migration.

## Current Limitations

- authentication is only scaffolded, not implemented
- patient deletion is currently a hard delete
- anamnesis does not yet support conditional logic
- anamnesis answers can now generate native score history, but the scoring logic is still an MVP rule set
- template editing is intentionally pragmatic: there is no full template versioning or audit diff model yet
- patient photos use local filesystem storage only in this step
- no image processing, compression, thumbnails, or advanced comparison slider yet
- photo upload metadata is shared across all files in a single upload request
- score results are tied to anamnesis records and stored historically, but there is no score editing or rule versioning yet
- the first PDF report is structured and professional, but does not yet support branded theming, report template versions, or rich pagination controls
- local development now assumes PostgreSQL is installed and available outside the monorepo
- backend integration tests now cover the main patient, anamnesis, scoring, media, and report workflows, but they do not yet cover concurrent edit races or external integrations
- no automated frontend test suite yet
- no in-browser PDF preview rendering beyond opening or downloading the file
- no WhatsApp integration yet

## Backend Integration Tests

The backend now includes high-value integration coverage for the most regression-prone business flows:

- patient create, duplicate email rejection, search/list, get by id, update, and delete
- anamnesis template create, list, get by id, safe update, unsafe type/removal rejection after answers exist, status toggle, and inactive-template submission rejection
- patient anamnesis create, required-answer validation, historical snapshot persistence, history list, and record detail retrieval
- score calculation, persistence, history retrieval, get by id, ownership validation, and stored itemized detail stability
- patient photo metadata upload with local file persistence, invalid type rejection, list/detail retrieval, ownership validation, and delete cleanup
- report generation, selected anamnesis/score/photo ownership validation, metadata persistence, PDF file creation, retrieval, and delete cleanup

Test strategy:

- `@SpringBootTest` with `MockMvc` for endpoint-level integration coverage
- Flyway migrations executed against an embedded PostgreSQL instance in the test profile
- local filesystem storage redirected to temporary test directories so media and report cleanup can be asserted without touching developer data

Run from `apps/backend`:

- all backend tests:
  `mvn test`
- only integration tests:
  `mvn "-Dtest=*IntegrationTest" test`

The integration suite does not use Docker and does not bypass Flyway. It boots a real PostgreSQL-compatible engine in-process so schema validation stays aligned with the local PostgreSQL-first direction.

## Recommended Next Order

1. Add Java 21, Maven, Node.js, and npm to the local machine if they are missing.
2. Add authenticated access control around patient, anamnesis, and photo routes.
3. Expand media with metadata editing, thumbnails, and future cloud object storage migration.
4. Add explicit template and scoring version history once the clinic needs edit audit trails beyond the current safe future-only policy.
5. Add the first post-baseline Flyway migration for seed auth data or the next real schema change instead of editing `V1__baseline_schema.sql`.
