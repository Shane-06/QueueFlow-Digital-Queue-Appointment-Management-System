# DQAMS reviewed requirements and implementation plan

Review date: 16 November 2026

This plan reconciles the updated project document with the original workflow and the existing React prototype. It is a planning deliverable, not authorization to implement every phase. Build and review one phase at a time after the user starts it.

## 1. Project outcome

Build a college administrative service application in Java. Students book appointments or join same-day queues; staff operate counters; admins configure services, people, schedules, capacity, and reports. The final application must use shared PostgreSQL data and real role-based authentication.

Planning baseline: Java 21, Spring Boot MVC, Thymeleaf, Spring Security with server-side sessions, Spring Data JPA/Hibernate, PostgreSQL, Flyway, Maven, HTML/CSS and limited JavaScript. Exact compatible dependency versions will be checked during setup. No separate React frontend is planned for the final application.

This baseline interprets the updated document's sections 25–27 as superseding conflicting earlier frontend-only instructions. Confirm that interpretation in phase 1 before migration.

## 2. Existing work and reuse

The current project at D:/Project_Planning/Java_Project contains a React/TypeScript/Vite prototype under frontend and two original planning files. It has student, staff, and admin screens, shared layouts, local booking/cancellation, queue actions, service/counter editing, notifications, and sample data. Its production build passed during the prior review.

There is no Spring Boot project, PostgreSQL integration, database migration, or real authentication in the inspected project. Data is loaded from sample arrays and browser localStorage. Functions inside frontend/src/services are browser code, not Java backend services.

Preserve frontend as a reference during migration. Reuse its navigation, page organization, useful visual patterns, form fields, and curated sample scenarios. JSX/React components and TypeScript service functions must be translated into Thymeleaf templates and Java services; they cannot simply be moved into a Java application. Do not import demo rules unchanged.

Local readiness check: java and javac commands were found, but their versions were not verified. Maven, psql, and Docker were not found on PATH; this does not prove they are uninstalled. Check installed tools and database services before requesting installation. A Maven Wrapper can avoid a global Maven requirement. Docker is optional.

## 3. Corrections to the updated specification

| Sections | Conflict or gap | Corrected planning position |
| --- | --- | --- |
| 1, 11, 17, 21 | Frontend-only and backend-later language conflicts with MVC, Java services, security, and mandatory persistence | Deliver small end-to-end Java increments with persistence from the foundation onward. UI-first means visual prioritization, not a separate backend-free application. |
| 14, 22 | React-style folders, TypeScript types, mock service clients, and later HTTP replacement conflict with Thymeleaf | Use Java packages plus resources/templates and resources/static. MVC controllers call Java services directly. Optional JSON endpoints are limited to interactions that need them. |
| 12, 13, 22 versus 27 | Demo role switching conflicts with real authorization | Use seeded student/staff/admin accounts and real sign-in. Never ship an unrestricted role-switch endpoint. |
| 19 versus 25–27 | A working mock demo is treated as final V1 | V1 requires PostgreSQL persistence, security, transactional workflows, and restart verification. |
| 7 | REQUEUE looks like a permanent status | Requeue is an action: HOLD to WAITING. Use one canonical state vocabulary. |
| 8 | Only SERVING is reserved at a counter | Allow at most one CALLED or SERVING entry per counter, so repeated Call Next cannot reserve several students. |
| 13 | Booking and then joining the same service can conflict with duplicate-entry rules | Demonstrate a future appointment and a separate current-day walk-in, or demonstrate appointment check-in. Never create two active queue entries for the same user/service/day. |
| 20 | Several core policies remain unresolved | Treat the next section as proposed defaults requiring agreement before implementation. |

The original Word file has not been overwritten. This corrected plan records the differences explicitly.

## 4. Proposed business rules to settle in phase 1

These are proposed defaults, not decisions already approved by the user.

1. Booking generates an appointment reference. Generate a queue token only on same-day check-in, or when joining a walk-in queue.
2. Use one FIFO queue per service/day. Appointments join at check-in eligibility time; walk-ins join immediately during opening hours. A slot reserves booking capacity and a check-in window, not a guaranteed service start time. If appointments require priority, revise this rule explicitly before coding.
3. Allow check-in from 15 minutes before the slot until 15 minutes after its start, limited to the service day and opening hours. A background operation marks only overdue BOOKED appointments NO_SHOW. A student already checked in is not a no-show because staff are delayed.
4. Allow one active booking per student/service/day and reject overlapping appointment intervals across services. Define active booking capacity as BOOKED or CHECKED_IN; do not free past service capacity to sell already elapsed slots.
5. Appointment cancellation/rescheduling is allowed only while BOOKED and before the slot begins. Rescheduling validates and reserves the new slot atomically; failure must leave the old booking intact.
6. One active queue entry per student/service/day includes WAITING, CALLED, SERVING, and HOLD. A future booking does not block today's walk-in.
7. Staff may move CALLED or SERVING entries to HOLD; HOLD releases the counter. Requeue returns HOLD to the end of today's eligible waiting queue. Preserve original joinedAt and record a separate queuedAt/order value for FIFO.
8. SKIPPED is terminal for that queue entry; require a reason. Do not automatically equate every skip with appointment NO_SHOW. Decide the linked appointment outcome explicitly; proposed addition is Appointment SKIPPED for a checked-in student whose service attempt ends without completion. This adds a status to the supplied vocabulary and must be approved.
9. A counter can serve several configured services, one student at a time. Staff select only an assigned active counter. Claim across eligible services by queuedAt then stable ID; show that same ordering in the interface.
10. Account provisioning is admin-controlled for the first demo. If student self-registration is required for V1, agree college-email restrictions and verification before phase 4. Staff/admin accounts remain admin-controlled.
11. Store event instants consistently using PostgreSQL timestamptz and use Asia/Kolkata for working hours, service dates, and day boundaries. Do not derive the college service date from UTC string slicing.
12. Explicitly configure per-slot appointment capacity, daily appointment capacity, and daily walk-in capacity. Do not silently share or double-count these limits. Changes cannot invalidate existing bookings without a visible resolution process.
13. Define end-of-day handling for remaining WAITING/HOLD tokens: proposed staff closeout marks them SKIPPED with a closure reason and notifies affected students. CALLED/SERVING entries require staff resolution. Never silently call yesterday's entries tomorrow.

Canonical proposed appointment states: BOOKED, CHECKED_IN, COMPLETED, CANCELLED, NO_SHOW, plus SKIPPED only if approved. SERVING belongs to the queue entity. Queue states: WAITING, CALLED, SERVING, COMPLETED, HOLD, SKIPPED. Record transitions and reasons in audit history.

## 5. Database design outline

| Table/group | Purpose and important rules |
| --- | --- |
| roles, users, departments | Unique normalized email; hashed passwords; account status; one role per account for V1; department foreign key. |
| services | Unique code, department/office, duration, appointment/walk-in flags, active state, capacity defaults. |
| counters, counter_services, staff_counters | Counter locations and activity; unique mapping pairs; validate assigned users have STAFF permission. |
| working_hours, holidays | Service-level days and operating intervals, breaks, closure overrides, and effective dates. |
| service_days, appointment_slots | Proposed additions: concrete service-day capacity/sequence row and dated slots with start/end/capacity. These give transactions stable rows to lock. |
| appointments | User and slot foreign keys, globally unique reference, status, booking/check-in/cancellation/completion timestamps; optional link to previous booking when rescheduled. |
| queue_entries | Optional unique appointment foreign key, user/service/day, service-day token sequence, status, queuedAt, assigned counter/staff, lifecycle timestamps and reason. |
| notifications | Recipient, event/message, read state, creation timestamp, related record. |
| audit_logs | Actor, operation, entity, timestamp and necessary change details; records created by Java operations, not editable browser claims. |

Design primary keys, foreign keys, required fields, positive capacities, valid intervals, and status checks explicitly. Preserve referenced records through deactivation instead of destructive deletion.

Uniqueness: appointment reference globally; token number by service/day; at most one queue entry per appointment; partial unique constraint for active CALLED/SERVING entries per counter; active user/service/day queue uniqueness. Index user history and service/day/status/queuedAt and counter/day/status lookups.

Concurrency approach for V1: lock the user where needed for conflicting bookings, then service-day and slot rows in a documented consistent order. Claiming a queue entry locks the counter and relevant service-day rows in stable order before selecting and updating the next eligible entry. Re-read status inside the transaction. Use database constraints as additional protection. Short, serialized claims are acceptable for this college-scale V1; avoid adding complex distributed coordination.

Appointment creation, slot consumption, check-in, token sequence allocation, queue changes, notifications, and audit records must commit consistently. Repeated form submissions/check-in must not create duplicate records. Use PostgreSQL-backed integration tests for locking and constraints, not only mock repositories or a different in-memory database.

Flyway owns schema changes; Hibernate validates mappings. Keep actual credentials outside source control. Seed data only in a controlled demo profile, with hashed demo passwords and dates relative to the configured college date. Re-running initialization must not duplicate records or overwrite existing work.

## 6. Intended folder structure

```text
Java_Project/
  frontend/                         existing React reference, preserved
  app/
    pom.xml
    mvnw, mvnw.cmd, .mvn/
    src/main/java/<agreed package>/dqams/
      config/ security/
      controller/                   auth, student, staff, admin
      service/ repository/ entity/ dto/ exception/
    src/main/resources/
      templates/                    fragments, auth, student, staff, admin, error
      static/css/ static/js/ static/images/
      db/migration/
      application.yml
    src/test/java/<agreed package>/dqams/
  docs/                             requirements, ERD, schema, test/demo guides
  README.md
  .gitignore
```

The final MVC UI and backend live together in app; a separate frontend/backend split would misrepresent the chosen architecture. This tree is proposed only; no migration has been performed.

## 7. Sequential implementation phases

| Phase | Work | Completion check |
| --- | --- | --- |
| 1. Requirements freeze | Confirm MVC migration and proposed business policies; finalize V1 and state transition matrix; settle registration and skipped-appointment outcome. | One consistent approved requirements baseline and demo scenario, with no unresolved behavior affecting schema. |
| 2. Java foundation | Verify Java/PostgreSQL availability; select compatible versions; create Maven Wrapper application, minimal MVC layout, configuration and error handling. | Application starts and renders a Thymeleaf page with a repeatable start command. |
| 3. Database foundation | ER diagram, schema dictionary, Flyway migrations, PostgreSQL setup, JPA entities/repositories, constraints, indexes, controlled demo seeds. | Migrations run on a clean database; mappings validate; records persist after restart; secrets excluded from version control. |
| 4. Authentication | Real session login/logout, password hashing, role/ownership enforcement, CSRF, inactive-account rejection, assigned-counter restrictions. | Student cannot reach admin/staff actions; unauthorized form submissions fail; logout remains effective after refresh. |
| 5. Admin configuration | Services, counters, staff accounts/assignments, working hours, holidays, durations, capacities, conflict-aware configuration changes. | Saved configuration survives restart and controls service availability; inactive services are unbookable. |
| 6. Appointments | Service catalog, dated slots, booking, reference, dashboard/history, cancellation, rescheduling, check-in and no-show policy. | Concurrent attempts for the last slot cannot overbook; invalid dates/closures/conflicts rejected; failed reschedule preserves old booking. |
| 7. Queue and staff operations | Walk-in/check-in token allocation, FIFO, call/start/complete/skip/hold/requeue, date filtering, linked appointment updates, notifications/audit. | Two counters never claim the same token; busy counters reject Call Next; future/past tokens excluded; invalid transitions fail. |
| 8. Dashboards and notifications | Student/staff/admin totals, histories, wait estimates, notification read state, useful empty/error states; manual refresh or simple polling. | Different users/browsers see shared database state; counts match queried records for the college service day. |
| 9. Presentation and delivery | Port/refine visual design, check every route/form/button, responsiveness, integration tests, demo rehearsal, setup guide and database evidence. | Full class demo passes, restart persistence is demonstrated, and every visible action works or is removed. |

Each phase ends with a short explanation of changed files, how to run it, demonstrated behavior, test results, and remaining limitations. The user reviews the phase before starting the next one. Do not build all phases from this planning request.

## 8. Existing prototype defects to avoid carrying forward

- Email-only login ignores the displayed password; role-switch controls are demo-only; protected routes lack enforcement; default-user fallback can restore login after logout.
- Fixed September 2026 booking dates, fixed operating slots, and capacity two ignore saved scheduling settings.
- An always-true condition immediately queues future appointments. Queue selection does not consistently restrict date.
- Displayed FIFO sorting and Call Next array selection can disagree. Counter displays can pick another counter's active token.
- Hold exists without requeue. Several status mutations lack prior-state and ownership checks.
- Short timestamp-derived IDs, row-count token allocation, and separate browser writes cannot ensure uniqueness or transactional consistency.
- Today metrics count other dates; several statistics are constants. Export CSV only shows a toast.
- Queue estimates cap duration at five minutes rather than using the agreed duration policy. No centralized cross-device updates exist.

## 9. Acceptance scenarios

1. Start the app against PostgreSQL, sign in as student, book a future appointment, restart, and verify it remains.
2. Check in for an eligible current appointment exactly once; a repeated request returns the existing queue entry rather than another token.
3. Join an enabled same-day walk-in service; see token and eligible queue position. A future booking is never called early.
4. Sign in as assigned staff in another browser; call, start, and complete the token; refresh the student page and verify shared status.
5. Hold and requeue a token; verify agreed end-of-queue placement, counter release, and history preservation.
6. Run simultaneous last-slot bookings and simultaneous counter claims against PostgreSQL; verify capacity and uniqueness.
7. Cancel/reschedule within policy; reject forbidden state/date changes; verify rollback on rescheduling failure.
8. Deactivate a service as admin; confirm new bookings/walk-ins are blocked and existing records are preserved with clear handling.
9. Verify holiday/closed-hour rules, inactive accounts, ownership restrictions, login/logout behavior, and CSRF handling.
10. Compare dashboard counts with database queries and verify the college-day timezone boundary.

## 10. Deferred scope

Defer WebSocket/SSE, SMS/email, QR check-in, kiosk mode, advanced predictions, report export, and feedback unless explicitly selected. V1 still needs working in-app notifications and shared status visible after refresh. Exclude payments, AI chatbot, blockchain, facial recognition, microservices, and unrelated integrations.

## 11. Source and review limits

Reviewed: C:/Users/Lenovo/Downloads/DQAMS_Updated_Java_Project_Context_and_Database_Plan.docx, the previously read original workflow at D:/Project_Planning/Java_Project/Digital_Queue_Appointment_Management_System_Workflow.docx, and the existing project source. This is a requirements/content and source review, not a page-layout audit of the Word document or a fresh interactive test of every screen. No application implementation or original-document modification was performed in this planning step.
