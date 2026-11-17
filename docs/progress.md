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

## Phase 5 — administrator configuration
Eight cumulative tests passed. All service/counter/account/schedule templates render; configuration persists; invalid hours and student service-layer access are rejected. Rendering tests exposed and resolved the account-role selector syntax before publication. Added audited admin forms, working days, breaks, holidays and conservative booking-conflict protection.

## Phase 6 — appointments (17 November 2026)
Thirteen cumulative tests pass, including simultaneous PostgreSQL bookings for one remaining place (exactly one winner), duplicate-submit idempotency, cancellation, failed-reschedule preservation, past-date rejection and student template rendering. Added schedule-driven slots, same-day check-in and background no-show processing. Boundary and check-in coverage will be expanded during final acceptance; this record does not claim all acceptance cases have been exercised.

## Phase 7 — queue operations
Seventeen cumulative tests passed, including two concurrent counters competing for one waiting token (one winner), invalid completion rejection, hold/requeue release, and staff/student queue-page rendering. Added date-filtered selection, assigned-counter checks, walk-in tokens and closeout actions.

## Phase 8 — dashboards and history
Eighteen cumulative tests passed. All three dashboards and admin appointment/queue/report/audit pages render, as do student notifications and profile. Counts are derived from persisted college-day records, notifications enforce recipient ownership, and manual refresh reads shared PostgreSQL state.

## Phase 9 — acceptance and delivery (17 November 2026)
All 26 automated tests pass (zero failures/errors). Packaged application starts successfully. Headless Edge verified three real logins/logouts, every role route, a browser-created appointment, and desktop/mobile dashboards without overflow or page errors. Desktop/mobile screenshots were inspected locally. The same browser-created appointment was verified after stopping and restarting Java. Added setup/demo documentation and PostgreSQL-backed GitHub Actions workflow; remote CI results are separate from these local results. Fixed staff dashboard service scoping and friendly missing-record errors. Browser reports, screenshots, credentials, tool installs and database files remain ignored. Deferred features and college-scale locking limits are documented in README and demo guide.
