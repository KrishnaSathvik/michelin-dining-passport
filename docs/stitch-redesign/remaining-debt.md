# Remaining debt (post Phase 12)

Only real residual work. Structural visual mismatches that would fail Phase 12 are **not** deferred here.

| Severity | Route | User impact | Reproduction | Why not fixed | Owner | Timing |
|---|---|---|---|---|---|---|
| Low | CI a11y | Missed automated contrast/axe regressions | No axe dependency in package.json | Playwright role checks cover critical paths; axe not previously in stack | Frontend | Next CI hardening |
| Low | Convenience Tailwind aliases (`bg-bg`, `text-ink`) | None if mapped to `--dp-*` | Grep `bg-bg` in stitch components | Single token source already `--dp-*`; rename is mechanical churn | Frontend | Opportunistic |
| Low | `/dev/stitch-restaurant-components` | None in production (404) | `next start` → 404; e2e skips gallery | Kept for presentation e2e under `next dev` | Frontend | Keep until gallery tests move to product routes |
| Low | Account authenticated baselines | Reviewers see login redirect in final account shots | Capture without session | No CI auth user for screenshot seeding | Frontend | Optional signed-in capture job |
| Info | Explore Suspense HTML | Temporary dual nodes in raw HTML stream | View source while loading.tsx streams | Expected Next streaming; hydrated UI is single | — | No action |
| Info | Reservation e2e flake | Intermittent historical flake | Prior notes | Did not reproduce in Phase 12 full suite | QA | Monitor |

No blocker remains for Phase 12 acceptance gates.
