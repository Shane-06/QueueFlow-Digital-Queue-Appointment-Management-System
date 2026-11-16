# QueueFlow requirements baseline

Phase 1 baseline, 16 November 2026. The user's instruction to proceed through all phases supersedes the earlier plan's per-phase approval pauses. Test and push each phase before proceeding.

## Architecture and scope
Java 21, Spring Boot MVC, Thymeleaf, Spring Security sessions, PostgreSQL, Spring Data JPA, Flyway and Maven. Preserve the React frontend as a reference; the final app runs from app/. No browser localStorage business persistence. Three roles: STUDENT, STAFF, ADMIN. No unrestricted demo role switch. No payments, AI, microservices or external notification providers.

## Business rules
- Use Asia/Kolkata service dates; store event timestamps as instants.
- Booking issues a reference; same-day check-in or walk-in issues a token. Future appointments never enter today's queue.
- Check-in window: slot start minus 15 minutes through start plus 15 minutes, within opening hours. Only overdue BOOKED appointments become NO_SHOW.
- One eligible FIFO queue per service/day; no appointment priority. Appointment slots reserve capacity and arrival windows, not guaranteed start times.
- One active appointment per user/service/day; reject overlaps across services. One active queue entry per user/service/day including HOLD.
- Cancel/reschedule only BOOKED appointments before start. Failed rescheduling preserves the original reservation.
- Separate per-slot, daily appointment and daily walk-in capacities. Scheduled breaks and holidays close availability.
- A counter handles multiple configured services but only one CALLED or SERVING token. Operators must be assigned to an active counter.
- Order by queuedAt then ID, identically in selection and display. Claim token and counter atomically.
- HOLD releases the counter; requeue sends HOLD to the tail with a new queuedAt, preserving joinedAt. SKIPPED is terminal with a reason.
- Appointment SKIPPED is the deliberate additional state for a checked-in appointment whose queue attempt is skipped. It is not NO_SHOW.
- Closing a service day skips WAITING/HOLD entries with a closure reason. Active CALLED/SERVING entries must be resolved before closeout. Yesterday's entries cannot be called today.
- Admin provisions accounts for V1, including students. Public registration deferred; profiles are view-only. Admin can disable accounts; subsequent requests must reject inactive accounts.
- Deactivation blocks new bookings/walk-ins. Existing appointments remain visible; administrators may cancel eligible bookings with notification. Schedule/capacity edits must reject conflicts with existing bookings.
- Notifications and audit records commit with the business operation. Do not expose other students' personal queue details.

## State transition matrix
Appointment: BOOKED -> CHECKED_IN, CANCELLED, NO_SHOW; CHECKED_IN -> COMPLETED, SKIPPED. Terminal states do not transition. Rescheduling changes the slot while BOOKED inside one transaction.
Queue: WAITING -> CALLED or SKIPPED (closeout); CALLED -> SERVING, HOLD, SKIPPED; SERVING -> COMPLETED, HOLD, SKIPPED; HOLD -> WAITING or SKIPPED. Requeue is an action, not a status.

## Acceptance matrix
| ID | Scenario | Phase |
|---|---|---|
| F01 | Java app starts and Thymeleaf renders | 2 |
| D01 | Clean migrations, mappings, constraints and seed idempotency | 3 |
| D02 | Data survives application restart | 3, 9 |
| S01 | Login/logout, wrong password, CSRF, role and ownership denial | 4 |
| S02 | Inactive account and unassigned counter denied | 4, 7 |
| A01 | Admin configuration persists and invalid schedules rejected | 5 |
| B01 | Valid booking and rejection of full/closed/past/conflicting slots | 6 |
| B02 | Concurrent last-slot bookings never exceed capacity | 6 |
| B03 | Cancellation and atomic reschedule rollback | 6 |
| B04 | Check-in idempotency and grace-period no-show | 6 |
| Q01 | FIFO/date filtering and valid state transitions | 7 |
| Q02 | Simultaneous staff calls never claim the same token | 7 |
| Q03 | Hold/requeue, busy counter, closeout and appointment synchronization | 7 |
| N01 | Shared state, recipient-only notifications and accurate daily counts | 8 |
| U01 | Every route/form renders, full cross-role demo and responsive layout | 9 |
| G01 | No secrets, dependencies, build output or local data tracked | Every phase |

## Demo
Admin configures a service and counter. Student books a future slot and sees the reference; joins today's walk-in or checks in to an eligible appointment. Staff in a separate session calls, serves and completes the token. Student refreshes and sees completion. Admin sees accurate counts. Restart app and verify records persist. Use a controllable clock in tests, not hardcoded calendar dates.
