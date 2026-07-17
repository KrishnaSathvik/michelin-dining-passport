# Live Google Places UI Kit validation report

Generated: 2026-07-17 (local validation on `google-places-ui-kit`)

Secrets are never logged. Environment presence only:

- browser key: configured
- matching key: configured
- feature flag: enabled (local)

## Phase 1 — Security

| Check | Result |
| --- | --- |
| `.env.local` gitignored | PASS (`gitignore: .env*`) |
| Matching key absent from browser bundle | PASS |
| No Google key literals in tracked files | PASS |
| `npm run secrets:scan` | PASS |
| Production feature flag default | disabled unless explicitly configured |
| UI Kit loader client-only singleton | PASS |
| Duplicate Google script injection | PASS (single `#mdp-google-maps-js-bootstrap`) |

Note: server-side matching with `GOOGLE_PLACES_MATCHING_API_KEY` returned `API_KEY_IP_ADDRESS_BLOCKED` for this workstation IP. Full roster matching used the browser-assisted matcher (`npm run data:google-places:match:browser`) with the referrer-restricted browser key on localhost. Matching key remains required for CI/server workflows once the IP allowlist includes the runner.

## Phase 2 — Five-place live spike

Route: `/dev/google-places-spike` (dev only)

| Scenario | Restaurant | Result |
| --- | --- | --- |
| Strong coverage | Alinea | Full + compact UI Kit loaded; photos/rating/attribution visible |
| Limited content | Lazy Betty | Compact/full load with thinner media still usable |
| Similar-name / multi-location | Sushi Nakazawa NY | Correct NY Place ID (not DC) |
| Shared-address sibling | Crown Shy | Distinct Place ID from Saga |
| No Place ID fallback | Spike null fixture | Quiet unavailable fallback |

Fixes applied during spike:

- Places UI Kit `orientation` must be set via DOM `setAttribute` (React property assignment crashed with `InvalidValueError`).
- Error boundary wraps UI Kit hosts so provider failures degrade quietly.

Proof: `docs/google-places/proof/live-spike/`

## Phase 3 — Ten-restaurant matching validation

Canonical-only inputs. Automatic approval only for high-confidence name + address/location agreement. Shared-address siblings forced to review when ambiguous.

Outcome: no false-positive auto-approvals observed on the curated ten. Crown Shy / Saga remained distinct after manual approval.

## Phases 4–6 — Full matching + review gates

| Metric | Value |
| --- | ---: |
| Total processed | 271 |
| matched | 214 |
| manually_approved | 57 |
| rejected | 0 |
| no_match | 0 |
| needs_review | 0 |
| Enrichment coverage (approved Place ID) | 100% (271/271) |
| Duplicate approved Place IDs | 0 |
| Provisional spike overrides | 0 |
| Shared-address sibling groups | 7 (all manually verified, distinct Place IDs) |
| All 3-star restaurants | manually/auto verified (16/16 approved) |
| Homepage featured restaurants | all approved |

See `docs/google-places/matching-report.md`.

## Phases 7–8 — Live detail + map proof

Proof: `docs/google-places/proof/live/`

Verified:

- One full UI Kit component per restaurant detail after lazy threshold
- Compact UI Kit in desktop 420px selected panel
- Mobile collapsed peek does **not** mount Google (viewport-gated desktop panel)
- Mobile expanded sheet mounts one compact component
- Attribution visible on detail and map surfaces
- Feature-disabled / no Place ID / provider-error fallbacks captured
- Reservation and Passport controls unchanged around Google sections

## Phase 9 — Query intent

See `docs/google-places/query-behavior-report.md`.

Dev counter is not billing-authoritative.

## Known limitations

1. Matching API key IP restriction blocks server-side `data:google-places:match` from this workstation; browser matcher is the local workaround.
2. Roster currently has 0 verified `no_match` / `rejected` rows — every restaurant received an approved Place ID after review. Future removals should prefer `no_match` over a weak guess.
3. Full page navigations remount UI Kit hosts (expected); in-session harmless rerenders and map pan/zoom do not.
4. Screenshots are proof only and must not be reused as application assets.
5. Do not merge into `ui-ux-rebuild` until explicit approval. Batch 6 not started.
