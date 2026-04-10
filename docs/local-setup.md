# Local Setup

## Exact Prerequisites

- Node.js 20+
- npm 10+
- Java 21
- Maven 3.9+

The project is designed to run locally without Docker.
PostgreSQL is now the standard local database path.

## Backend

Working directory:

- `apps/backend`

Command:

- `mvn spring-boot:run`

Default URLs:

- API base URL: `http://localhost:8080/api`
- Health endpoint: `http://localhost:8080/api/health`
- Actuator health endpoint: `http://localhost:8080/actuator/health`

Environment variables:

- `SERVER_PORT`: backend port
- `DB_URL`: datasource URL
- `DB_USERNAME`: datasource username
- `DB_PASSWORD`: datasource password
- `DB_DRIVER_CLASS_NAME`: datasource driver class
- `APP_CORS_ALLOWED_ORIGINS`: comma-separated allowed origins
- `APP_SECURITY_PERMIT_ALL`: keeps all non-health endpoints open during bootstrap when `true`
- `APP_MEDIA_PATIENT_PHOTO_STORAGE_ROOT`: local storage root for patient photo binaries
- `APP_MEDIA_MAX_FILE_SIZE_BYTES`: maximum allowed size per uploaded photo
- `APP_MEDIA_ALLOWED_CONTENT_TYPES`: comma-separated MIME types allowed for upload
- `APP_REPORT_STORAGE_ROOT`: local storage root for generated PDF reports
- `APP_REPORT_CLINIC_TITLE`: title rendered in the report header
- `APP_SCORING_MODERATE_THRESHOLD`: minimum total score for `MODERATE`
- `APP_SCORING_HIGH_THRESHOLD`: minimum total score for `HIGH`

Example local values are available in:

- `apps/backend/.env.example`

## Frontend

Working directory:

- `apps/frontend`

Commands:

- `npm install`
- `npm run dev`

Default URL:

- App: `http://localhost:3000`

Environment variables:

- `NEXT_PUBLIC_API_BASE_URL`: defaults to `http://localhost:8080/api`

Example local values are available in:

- `apps/frontend/.env.local.example`

## What Currently Works

- backend startup with Spring Boot, Java 21, and Maven
- PostgreSQL-backed local persistence without Docker
- Flyway baseline migration on backend startup
- Hibernate schema validation after Flyway migration
- health endpoint
- patient create, list, get, update, and delete API endpoints
- patient list pagination with `page` and `size`
- patient search by name with `search`
- anamnesis template create, update, status toggle, list, and get by id
- patient anamnesis record create, list by patient, and get by id
- patient photo upload, list, get by id, secure file serving, and delete
- patient score calculation from anamnesis, history list, and get by id
- patient PDF report generation, list, metadata detail, file serving, and delete
- frontend login placeholder page
- frontend dashboard shell
- frontend patient list with search and pagination
- frontend patient details page
- frontend patient creation flow
- frontend patient edit flow
- frontend patient delete action with confirmation
- frontend anamnesis template list, create, and detail pages
- frontend patient anamnesis entry and record history view
- frontend patient photo gallery, upload flow, detail view, and before/after comparison
- frontend patient report generation and detail views
- photo module overview page plus reports landing page and placeholder reminders page

## Current Limitations

- authentication and authorization are not implemented yet
- patient deletion is currently hard delete
- anamnesis does not yet support conditional questions
- anamnesis template editing uses a safe future-only policy, but there is no full template version history yet
- scoring rules are intentionally MVP-only and do not yet support versioning or advanced formulas
- the frontend has no automated tests yet
- patient photo storage is local filesystem only in this step
- photo uploads share metadata across all files in the same request
- no image processing, thumbnail generation, or advanced before/after slider yet
- first PDF export is implemented, but report theming and template versioning are not
- WhatsApp integration is still not implemented
- backend integration tests now use embedded PostgreSQL plus Flyway instead of an H2 smoke path

## Patient List Behavior

- `search` filters by patient name
- `page` is zero-based
- `size` defaults to `10`
- backend maximum page size is `50`

## Current Patient Endpoints

- `GET /api/patients?search=&page=0&size=10`
- `GET /api/patients/{id}`
- `POST /api/patients`
- `PUT /api/patients/{id}`
- `DELETE /api/patients/{id}`

## Current Anamnesis Endpoints

- `GET /api/anamnesis/templates`
- `GET /api/anamnesis/templates/{id}`
- `POST /api/anamnesis/templates`
- `PUT /api/anamnesis/templates/{id}`
- `PATCH /api/anamnesis/templates/{id}/status`
- `GET /api/patients/{patientId}/anamnesis-records`
- `GET /api/patients/{patientId}/anamnesis-records/{recordId}`
- `POST /api/patients/{patientId}/anamnesis-records`

## Current Photo Endpoints

- `POST /api/patients/{patientId}/photos`
- `GET /api/patients/{patientId}/photos`
- `GET /api/patients/{patientId}/photos/{photoId}`
- `GET /api/patients/{patientId}/photos/{photoId}/file`
- `DELETE /api/patients/{patientId}/photos/{photoId}`

## Current Score Endpoints

- `POST /api/patients/{patientId}/anamnesis-records/{recordId}/scores`
- `GET /api/patients/{patientId}/scores`
- `GET /api/patients/{patientId}/scores/{scoreId}`

## Current Report Endpoints

- `POST /api/patients/{patientId}/reports`
- `GET /api/patients/{patientId}/reports`
- `GET /api/patients/{patientId}/reports/{reportId}`
- `GET /api/patients/{patientId}/reports/{reportId}/file`
- `DELETE /api/patients/{patientId}/reports/{reportId}`

## Patient Anamnesis Flow

1. Create an anamnesis template
2. Optionally edit the template metadata, questions, scoring settings, or active status
3. Open a patient
4. Start anamnesis from the patient details page
5. Select an active template
6. Submit the dynamically rendered answers
7. Review the saved record from the patient history section

## Template Editing Behavior

- template edits are applied to future submissions only
- existing patient anamnesis records keep the template name and question metadata that were stored when the record was created
- existing score results are not recalculated or rewritten by later template edits
- recalculating from an older anamnesis record uses the stored answer snapshot from that record
- inactive templates are hidden from new patient anamnesis submissions but remain readable in template details, patient history, score history, and report flows
- changing a question type after patient answers exist is rejected with a validation error
- removing a question after patient answers exist is rejected with a validation error
- updating label, helper text, required flag, order, scoring weight, options, and option scores is supported for future submissions

## Patient Photo Flow

1. Open a patient details page
2. Enter the patient photo gallery or upload route
3. Select one or more JPEG, PNG, or WebP files
4. Set category, capture date, notes, and optional anamnesis record
5. Upload the files
6. Review the stored gallery, filter by category, or open before/after comparison

## Local Media Storage Behavior

- patient photo binaries are stored on local disk under `apps/backend/storage/patient-photos` by default
- the database stores only metadata such as original file name, content type, file size, category, capture date, notes, and the internal storage path
- physical files are written with UUID-based names to avoid collisions
- file access goes through the backend route instead of exposing the filesystem directly
- deleting a photo removes the metadata row and attempts to remove the stored file from disk

## Local Report Storage Behavior

- generated PDF files are stored on local disk under `apps/backend/storage/reports` by default
- the database stores only metadata such as patient reference, optional anamnesis and score references, selected photo ids, title, summary, generated date, file name, report type, and internal storage path
- PDFs are generated on the backend from HTML using a lightweight HTML-to-PDF library
- report file access goes through the backend route instead of exposing the filesystem directly
- deleting a report removes the metadata row and attempts to remove the stored PDF from disk

## Report Assembly Behavior

Each report is assembled locally from:

- patient identification and patient notes
- optional selected anamnesis record and its stored answers
- optional selected score result and its classification
- selected patient photos and photo notes
- optional clinician summary entered during report generation

If both an anamnesis record and a score result are selected for the same report,
the backend validates that the score result was calculated from that anamnesis record.

## Score Calculation Behavior

Each score result is assembled locally from one stored anamnesis record:

- `BOOLEAN`: contributes the question weight for `true`, zero for `false`
- `SINGLE_CHOICE`: uses configured option score, multiplied by question weight when present
- `MULTIPLE_CHOICE`: sums configured option scores, multiplied by question weight when present
- `NUMBER`: uses `answer * questionWeight` when the question weight is configured
- `TEXT`, `TEXTAREA`, and `DATE`: ignored for scoring in this step

Classification thresholds:

- `LOW`: below `APP_SCORING_MODERATE_THRESHOLD`
- `MODERATE`: from `APP_SCORING_MODERATE_THRESHOLD` up to `APP_SCORING_HIGH_THRESHOLD`
- `HIGH`: at or above `APP_SCORING_HIGH_THRESHOLD`

## Database Setup

1. Install PostgreSQL locally.
2. Create the database:
   `psql -U postgres -c "CREATE DATABASE trichology_clinic;"`
3. Export the backend variables from `apps/backend/.env.example`, or set equivalent values in your shell.
4. Start the backend from `apps/backend`:
   `mvn spring-boot:run`
5. Flyway will create the schema on a clean database before Spring Data repositories initialize.

## Migration Rules

- Migration files live in `apps/backend/src/main/resources/db/migration`
- The project starts with a single baseline: `V1__baseline_schema.sql`
- Future schema changes must be added as new versioned migrations such as `V2__add_x.sql`
- Do not edit an already-applied migration in shared use; create the next migration instead
- Hibernate runs with `ddl-auto=validate`, so mismatches now fail startup instead of silently changing tables
- `baseline-on-migrate=true` exists to help adopt an already-existing local schema created before Flyway was added

## Backend Integration Test Setup

Working directory:

- `apps/backend`

Commands:

- run the full backend test suite:
  `mvn test`
- run only the integration workflow suite:
  `mvn "-Dtest=*IntegrationTest" test`
- run one integration class:
  `mvn "-Dtest=MediaAndReportWorkflowIntegrationTest" test`

What the integration tests do:

- boot the real Spring application with `@SpringBootTest`
- run Flyway migrations against an embedded PostgreSQL instance
- execute endpoint-level flows through `MockMvc`
- write patient photo and report files into temporary test directories
- truncate business tables and clean those temporary directories after each test

Critical workflows covered:

- patient CRUD plus duplicate email rejection
- anamnesis template lifecycle and safe-editing rules
- patient anamnesis creation, validation, snapshot persistence, and history retrieval
- score calculation, persistence, ownership validation, and stored item detail stability
- patient photo metadata upload plus local file cleanup
- report generation plus metadata/file cleanup and ownership validation

Local prerequisites for backend integration tests:

- Java 21
- Maven 3.9+

No local PostgreSQL server is required for the test suite because the tests start an embedded PostgreSQL process automatically.
The regular application runtime still targets your locally installed PostgreSQL instance.
