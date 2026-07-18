# Release readiness — Stitch redesign

**Do not merge from this document alone.** Human review required.

## Checklist

- [x] Branch `stitch-full-redesign` contains Phases 1–12 work
- [x] Branch pushed to `origin/stitch-full-redesign`
- [x] `npm run typecheck` green
- [x] `npm run lint` green
- [x] `npm test` green
- [x] `npm run build` green
- [x] `npm run secrets:scan` green
- [x] Playwright suite green on dedicated port **3112**
- [x] No secrets / matching API key in browser bundle (scan + source contracts)
- [x] Production env expectations unchanged (Supabase, Google browser key optional flag)
- [x] Google UI Kit flag defaults off; MapLibre independent
- [x] No database migration introduced in Phase 12
- [x] Feature flags: no leftover `STITCH_UI_*`; provider flags retained
- [x] Route smoke against `next start` :3112
- [x] Final audit / inventory / remaining debt docs present
- [ ] Human visual spot-check of `baselines/final/`
- [ ] Merge recommendation approved by product

## Rollback plan

1. Revert Phase 12 commits or reset branch tip to `5fe01ac` (pre–Phase 12).
2. Redeploy previous build artifact.
3. No schema rollback required (no migrations).

## Merge recommendation

**Ready for human review on `stitch-full-redesign`.**  
**Do not merge into `main` or `ui-ux-rebuild` until visual sign-off.**

## Production smoke (owned server :3112)

Verified identity (Dining Passport title/wordmark), status codes, and primary routes including invalid public 404 UI. Map has no footer; auth has no global chrome.
