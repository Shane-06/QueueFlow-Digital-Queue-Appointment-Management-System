# Demonstration and acceptance guide

## Start and accounts
Build with scripts/build.ps1, then run scripts/run.ps1. Open localhost:8080. Read the locally generated password from .local/demo-password. Sign in using student@queueflow.local, staff@queueflow.local or admin@queueflow.local. Use separate private browser sessions when demonstrating simultaneous users. All accounts use real password authentication; there is no role-switch bypass.

## Walkthrough
1. Admin: review services, counters, staff assignments, working hours, breaks and holidays. Defaults are Monday–Friday 09:00–17:00 with 13:00–14:00 break. Add a working day if demonstrating on a weekend. Review account provisioning and logout.
2. Student: browse Transcript Verification, select a future working day, choose an available slot and confirm. Show the reference in appointments/history. Future appointments have no waiting token.
3. During working hours, join a walk-in queue. Alternatively book an eligible current slot and check in within 15 minutes before/after its start. Duplicate check-in returns the existing token.
4. Staff: open an assigned counter, call next, start service and complete. Student refreshes My queue to see the updated state. Demonstrate hold/requeue with another token; requeue sends it to the tail. Skip requires a reason.
5. Admin: view current-day counts, appointments, queue, recorded wait and audit history. Deactivate a service and verify students cannot create new bookings/walk-ins. Existing records remain visible.
6. Stop Java with Ctrl+C, restart scripts/run.ps1, sign in and verify the booking/token/history remains. This demonstrates PostgreSQL persistence. Stop the isolated database using scripts/local-db.ps1 stop when finished.

## Automated checks
Run scripts/build.ps1. The suite tests MVC rendering, real PostgreSQL migrations, seed idempotency, capacity constraints, passwords, CSRF, role restrictions, disabled sessions, notification ownership, appointment idempotency/cancellation, failed reschedule preservation, past dates, simultaneous last-slot bookings, queue transitions, simultaneous counter claims and a complete check-in-to-completion flow. Tests use a fixed clock for timing boundaries rather than relying on demonstration hours.

scripts/check-repository.ps1 checks tracked-file exclusions and common credential patterns. This is not a guarantee against every possible secret; review staged files before publication. Never stage .local, .tools, .env files, database dumps, node_modules, target or dist.

## Known operational limits
Queue estimates use eligible waiting people ahead multiplied by configured service duration; they are approximate, especially with multiple counters. Updates require refresh. V1 serializes business writes with a PostgreSQL advisory lock; this favors correctness at college-demo scale over high throughput. Staff resolve active tokens before closing a service day. Public registration, report export and external notifications are outside V1.

## Repeat the full browser flow

On this Windows computer, build first, then run `./scripts/run-flow-check.ps1`. The helper uses the existing project-local Java/PostgreSQL setup, the generated local demo password and a headless Edge browser. If the optional browser helper is missing, install it with `npm.cmd install --prefix .tools/browser playwright --no-audit --no-fund`. The Java application must be stopped before rebuilding its packaged JAR on Windows.

The flow check creates a separate timestamped PostgreSQL database and runs the packaged application on port 8081. It configures test service hours through the admin forms so that queue operations can be tested at any time of day. This leaves the normal queueflow database and its office hours untouched. Port 8081 must be free. The temporary application stops at the end; its database and screenshots under .local/ui-review remain locally for diagnosis and are excluded from Git.

Browser assertions cover service search, booking, rescheduling with the original date preserved, cancellation, appointment history, walk-in joining, selecting Counter 2, call/hold/requeue/start/complete, busy-counter button disabling, status changes across separate student/staff sessions, permanent walk-in history, skip reasons, same-day appointment check-in and linked completion, notification read state, admin service deactivation, student denial on admin routes, mobile navigation, horizontal overflow and browser errors. The same-day browser check is skipped only when no arrival windows remain at the end of a day; fixed-clock automated tests always exercise check-in.
