# Phase 10A — Staff Decision Gate

## Decision

**STAFF STRATEGY: A — FRESH STAFF PROVISIONING**, explicitly chosen by the user this phase (not
inferred, not assumed from a prior phase).

Under Option A:
- `staff_users` is **not** migrated.
- `staff_messages` is **not** migrated — its 4 rows remain in OLD, untouched (not deleted).
- The staff account will be recreated separately on NEW, at a later time, with a freshly-generated
  `staff_id` (different from OLD's).
- Staff credentials are not migrated or inspected further.

## Read-only verification that Option A is compatible with student migration

Re-confirmed fresh this phase (read-only, against OLD):

```
select count(*) as total, count(*) filter (where assigned_by is not null) as non_null_assigned_by
from student_section_assignments;
-> total: 352, non_null_assigned_by: 0
```

**All 352 `student_section_assignments` rows have `assigned_by = NULL`.** Since every row that would
migrate already has a `NULL` in the one column that would otherwise reference `staff_users.staff_id`,
**no `staff_users` row is required for the student migration to proceed.** Option A introduces zero
risk to the student-migration path — this was true before the decision was made (Phase 8/9 already
established it) and is re-confirmed, not newly discovered, here.

No staff password, salt, or other credential was read, inspected, or exposed in this verification —
only the aggregate `assigned_by` null-count, which contains no credential material.

## Outcome

| Field | Value |
|---|---|
| Staff strategy | A — Fresh provisioning |
| `staff_users` count (OLD, informational only) | 1 |
| `staff_messages` count (OLD, informational only) | 4 |
| `student_section_assignments` count | 352 |
| `assigned_by` non-null count | 0 |
| Student migration staff dependency | NONE |
| Staff migration performed this phase | NOT EXECUTED |

This decision is now final for Phase 10B and any future Phase 10C — student migration proceeds
without any staff-table involvement.
