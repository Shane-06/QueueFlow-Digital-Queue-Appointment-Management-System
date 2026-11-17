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
