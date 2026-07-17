# Deletion Plan

Goal: prevent the old design system from continuing to influence the new one. Delete obsolete presentation once its replacement is shipped and accepted.

## Principles

1. Delete **route-local** old UI in the same PR that ships the Stitch replacement when practical.
2. Keep shared old components only while any route still imports them; track remaining importers.
3. Remove CSS token aliases by end of Phase 12.
4. Do not leave “deprecated but used” components without an owner issue.

---

## Obsolete components (by family)

### Homepage (delete after Phase 4)

| Path | When safe |
|---|---|
| `src/components/home/SearchHero.tsx` | Home no longer imports |
| `src/components/home/FeaturedRestaurants.tsx` | Replaced |
| `src/components/home/BrowseByState.tsx` | Removed from home (and unused elsewhere) |
| `src/components/home/BrowseByCuisine.tsx` | Same |
| `src/components/home/MapTeaser.tsx` | Same |
| `src/components/home/MichelinStarsExplained.tsx` | Same (education page has its own) |
| `src/components/home/PassportPreview.tsx` | Same |

### Explore (after Phase 5)

| Path | When safe |
|---|---|
| Old `Explore*` presentational files superseded by Stitch versions | No remaining imports |

Keep `src/lib/data/explore.ts` forever (logic).

### Map (after Phase 6)

| Path | When safe |
|---|---|
| Old panel/list chrome inside `RestaurantMap.tsx` | After workspace split; prefer replacing file body then deleting dead helpers |
| `MapCanvas.tsx` | **Do not delete** — preserve |

### Restaurant cards / detail (after Phases 3 & 7)

| Path | When safe |
|---|---|
| Legacy `RestaurantDiscoveryCard` / `Compact` / `Editorial` once renamed replacements are universal | Zero imports |
| Old detail layout fragments in page file | After benu composition lands |
| `RestaurantDetailStickyBar` old styles | After restyle (replace in place OK) |

### Passport / collections (after Phases 8–9)

| Path | When safe |
|---|---|
| Old `PassportHome` layout | After new passport ships |
| Old `CollectionsManager` / `CollectionDetail` presentation | After Phase 9 |

Preserve `PassportProvider` and store modules.

### Auth / account (after Phase 10)

| Path | When safe |
|---|---|
| Old `(auth)/layout.tsx` aside styling | After AuthShell |
| Old `AuthForm` presentation | After rebuild (keep action wiring) |
| Old `AccountPanel` sections not in Stitch and unused | After account IA ships |

### Taxonomy (after Phase 11)

| Path | When safe |
|---|---|
| `TaxonomyPageShell` old composition | After new taxonomy components |

### Dev / deprecated

| Path | When safe |
|---|---|
| `src/components/google-places/GooglePlacesSpikeClient.tsx` | After prod Google paths stable |
| `src/app/dev/google-places-spike/page.tsx` | Same |
| `.paper-texture` utility | Phase 1 once callers gone |

---

## Obsolete CSS / tokens

| Item | Deletion point |
|---|---|
| Instrument Serif `next/font` wiring | Phase 1–2 after Literata live |
| `--color-*` old palette | Phase 12 after no references |
| `--radius-sm/md/lg` 6/10/12 | Phase 12 |
| `--shadow-float` | Phase 1 for new UI; delete globally Phase 12 |
| `.container-editorial` / `.section-space` | After PageContainer adoption |
| Any cream/paper identity remnants | Immediately if found |

---

## Obsolete utilities / wrappers

| Item | Notes |
|---|---|
| Dual Container systems | One `PageContainer` only by Phase 12 |
| Temporary `STITCH_UI_*` flags | Remove when route stable |
| Re-export shims of old card names | Max one release; then delete |

---

## Prior rebuild docs

| Path | Action |
|---|---|
| `docs/ui-ux-rebuild/**` | Keep as historical archive; do not use as visual source |
| Rejected screenshots under `docs/ui-ux-rebuild/current/` | Evidence of failed reskin approach — reference in reviews if needed |

---

## Deletion checklist (per route PR)

- [ ] New Stitch components merged  
- [ ] Screenshots accepted  
- [ ] Tests updated and green  
- [ ] `rg` shows no imports of replaced files  
- [ ] Delete files in same or immediate follow-up PR  
- [ ] Update this document’s “when safe” rows to Done
