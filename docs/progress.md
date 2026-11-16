# Phase validation record

## Phase 1 — requirements baseline
Finalized MVC architecture, admin-provisioned accounts, appointment/queue states, FIFO/check-in policies, capacities, closeout and acceptance matrix. Preserved React source as reference. No executable feature claim is made for this documentation phase.

Validation: reviewed requirements against both supplied workflows and prototype defects; explicit test IDs cover phases 2–9. Git exclusions checked before first commit. Build and behavioral tests begin with phase 2.

## Phase 2 — Java foundation
Java 21 and Spring Boot 3.5.16 compile and package successfully. FoundationTest passed (Thymeleaf response and stylesheet link). Maven Wrapper generated. PostgreSQL schema and entity work remains phase 3 and is excluded from this commit.

## Phase 3 — PostgreSQL foundation
Three cumulative tests passed: MVC rendering, migration/seed idempotency, and database capacity constraint. A fresh application test context reopened the persisted PostgreSQL records. Schema, foreign keys, indexes and JPA mappings validated. Isolated local development/test databases and ignored credentials configured. V1 uses a transaction-scoped advisory lock for simple cross-instance write serialization, replacing the proposed row-lock ordering.

## Phase 4 — authentication
Five cumulative tests passed. Verified valid/invalid passwords, student denial on admin routes, CSRF rejection, logout, and unauthenticated redirects. Added backend Actor ownership/role checks and database-backed active-account validation on every authenticated request.
