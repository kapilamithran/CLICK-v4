# Phase 14 — snapshot manifest (non-secret)

Frozen source: OLD `jnxevalckgitxuunjcvv`, frozen at 2026-10-03T06:50:51Z. Export captured after the freeze was verified.

Credential-bearing files (password hash and salt columns) are stored only in `migration/.local-migration-output/phase14-snapshot/`, which is gitignored and never committed. This manifest contains counts and SHA-256 checksums of those files only.

| Table | Frozen selected | Exported | Match | Columns | SHA-256 (file) |
|---|---:|---:|:---:|---:|---|
| users | 352 | 352 | yes | 30 | `252bcf2b4c3b99202543057f3104cce76ad67898b0b3dddabe8d9c7ac484a481` |
| test_runs | 835 | 835 | yes | 14 | `00df7138bbc125e5fc6dde9e21b63a9c8047df0b026e84cc70b5fa36f883e12e` |
| attempts | 4894 | 4894 | yes | 17 | `ec0195b2449526c1083578b1a1266bf585ac487673106c32476e4f7e66e680b2` |
| learn_progress | 465 | 465 | yes | 9 | `8d4c20d7b1ffa40dcb426826255f70bc84a52c3798e85895b4afb7ffcb5b5489` |
| practice_progress | 5 | 5 | yes | 9 | `bdc59149ca2299f878ee78ee118be3a56a37479c273e4594e1fc94ba0c2dad56` |
| student_section_assignments | 352 | 352 | yes | 6 | `df43d9e88afe1b8c21cae77d8d1d5e8b6e3525928fbc3ce1b546369354cd70b3` |

## Exclusions (frozen source)

| Scope | Total | Protected (excluded) | Selected |
|---|---:|---:|---:|
| users | 354 | 2 | 352 |
| test_runs | 954 | 119 | 835 |
| attempts | 5080 | 186 | 4894 |
| learn_progress | 539 | 74 | 465 |
| practice_progress | 5 | 0 | 5 |
| student_section_assignments | 352 | 0 | 352 |

Not in scope (by specification): sessions, practice_pairings, activity_attempts (absent on OLD), curriculum, staff data.
