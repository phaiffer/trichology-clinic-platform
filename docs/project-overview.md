# Project Overview

## Goal

Build a local-first trichology clinical web app that starts simple, runs without Docker, and is structured to evolve safely into a production-grade platform.

## Monorepo Areas

- `apps/frontend`: clinician-facing web interface
- `apps/backend`: API, business rules, security baseline, and persistence
- `docs`: project, architecture, setup, and planning references

## Current Scope

- Local H2 file database with PostgreSQL-compatible mode
- Spring Boot API with layered module boundaries
- Next.js dashboard shell with patient flow connected to the backend
- Foundational entities for auth, anamnesis, scoring, media, and reports
- Placeholder frontend sections for upcoming modules

## Product Modules

- `auth`: authentication and authorization foundation
- `patient`: patient registration and lifecycle management
- `anamnesis`: dynamic clinical questionnaires
- `scoring`: trichology scoring logic
- `media`: before and after photo bank
- `report`: PDF report generation and export history
- `notification`: reminders and WhatsApp integrations

## Security and LGPD Direction

- No secrets committed to source control
- Environment-driven configuration for ports, CORS, and database settings
- Consent-aware patient fields already included
- Security is scaffolded with Spring Security so authentication can be tightened without restructuring the whole codebase
- Media and notification integrations are intentionally left behind adapter boundaries

