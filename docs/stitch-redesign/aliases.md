# Temporary compatibility aliases

Phase 1–2 introduce Stitch `--dp-*` tokens, `src/components/stitch/*` primitives, and `src/components/shell/*` application chrome.

## Shell (Phase 2)

| Item | Status | Notes | Delete by |
|---|---|---|---|
| `src/components/layout/SiteHeader.tsx` | **Removed** | Replaced by `shell/AppHeader` + `AppHeaderClient` | Done |
| `src/components/layout/SiteFooter.tsx` | **Removed** | Replaced by `shell/SiteFooter` | Done |
| `src/components/layout/SiteFooterGate.tsx` | **Removed** | Footer gating lives in `shell/AppChrome` | Done |
| `siteConfig.nav` | Retained | Still used for product config; shell primary IA uses `config/navigation.ts` `primaryNav` | Phase 12 if unused |
| Legacy `Container` / `Section` | Retained | Old route bodies | Per-route phases |
| Auth form presentation | Retained | AuthShell scaffold only; forms Phase 10 | Phase 10 |
| Map workspace inner UI | Retained | `MapWorkspaceShell` wraps existing `RestaurantMap` | Phase 6 |

## Tokens / fonts (Phase 1)

| Alias | Maps to | Why | Delete by |
|---|---|---|---|
| `--font-display` → Literata (`--font-literata`) | Display font for existing `font-display` classes | Avoid Instrument Serif while old pages still use `font-display` | Phase 12 |
| Legacy `--color-*` / `--radius-*` / `.container-editorial` | Kept for old components only | Keep unrebuilt routes compiling | Phase 12 cleanup |
| Legacy `src/components/ui/Button.tsx` | Untouched | Old routes | After shell/routes migrate |
| Legacy `RestaurantMedia` / `StarMark` / fallbacks | Untouched | Old cards/detail | Phase 3–7 |
| `siteConfig.productName` | `Dining Passport` | OD-02 | Permanent |

## Stitch locations

- Primitives: `src/components/stitch/`
- Shell: `src/components/shell/`
- Nav config: `src/config/navigation.ts`

Rules:

1. New shell and stitch primitives must not import deleted SiteHeader/SiteFooter.
2. Do not render old and new headers together.
3. Do not apply legacy visual classes to AppHeader.
4. Route bodies remain unrebuilt until their phase.
