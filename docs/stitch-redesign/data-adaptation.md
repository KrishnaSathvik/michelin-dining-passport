# Data Adaptation

Stitch designs contain illustrative content. The real application must use supported data and features. Do **not** alter the product model merely to imitate decorative mockup content.

## Global mock patterns → replacements

| Mockup content | Where it appears | Accurate product replacement |
|---|---|---|
| Stock CDN food photography on named restaurants | Most cards/details | Approved first-party restaurant image, else designed `RestaurantFallback` |
| Atmospheric stock for heroes/destinations | Home, taxonomy, auth, education | Allowed for marketing/taxonomy/education/auth only |
| Google rating stars/photos rendered as custom UI | Detail Variant A photo strip; some cards | **Only** Google Places UI Kit components; never custom recreation |
| Fake review counts “(1,200)” outside kit | Detail mock Google card | UI Kit attribution only |
| “Open · Closes 10 PM” outside kit | Detail/map mocks | UI Kit only |
| Forced CTA “Check availability” / “RESERVE” on all cards | Home, explore, map | Reservation resolver truthful labels |
| Green Star / Bib Gourmand badges | Saved, explore filters, education | Show only if dataset supports; otherwise omit or educational-only copy |
| Non-US restaurants (Jiro, Noma, Tsuta, Paris hubs) | Cuisine, planned | US catalog only |
| Wrong star counts on known restaurants (e.g. French Laundry as 1★) | Saved mock | Real `stars` field |
| Fake map tiles (Taylor Park, Riverbend) | Map, state | MapLibre real tiles + real geocodes |
| Invented chefs / long About essays | Detail | Dataset description fields only; if absent, omit section gracefully |
| Dish tags (“TUNA TARTARE”) on passport cards | `personal_passport` | Use favorite dishes from visit details when present; else omit tags |
| User persona “Eleanor Vance”, sync “142 Visited” | Account | Real auth user + real passport metrics |
| “Make collection public” | Collections create | Omit unless privacy/sharing exists |
| Share collection | Collection detail | Omit or link copy-only if unsupported |
| Notifications settings | Account | Omit or “coming soon” only if product approves; default omit |
| Import/export passport files | Account | Keep only if `AccountPanel` already supports; else omit from v1 UI |
| Magic Links / Google OAuth buttons | Auth | Wire only providers already implemented |
| Mobile bottom nav | `personal_passport_overview` | Do not ship unless approved |
| Brand “L'Assiette d'Or” / “Journal” | overview | Reject — Dining Passport + Passport |
| Alternate nav IAs | education, empty passport | Reject — canonical Explore/Map/Michelin Stars/Passport |
| Cuisine percentage pie stats | City page | Compute from real city cuisine distribution or replace with counts |
| “16 destinations” copy | Distinction page | Use real three-star count (16 is currently accurate — bind to data) |
| Stats 271/216/39/16 | Home | Bind to live aggregates (currently matches product context) |
| Planned “Manage Reservation” deep links | Planned list | Link to resolver URL / restaurant website; no fake booking manager |
| Drag-and-drop collections | None explicit but avoid inventing | Not supported |
| Recommendations engine | Related Discovery | Existing related/nearby logic only |

## Google Places boundary (hard)

| Allowed | Forbidden |
|---|---|
| Full UI Kit on `/restaurants/[slug]` | Google enrichment on home/explore/passport/collection/related cards |
| Compact UI Kit on selected map restaurant | Extracting photos/ratings/reviews/hours/summaries into app state |
| Loading/unavailable chrome around kit | Caching Google media in app CDN |

## Reservation labels

Always from resolver:

- Reserve now  
- Check availability  
- View booking options  
- Visit restaurant website  

Map panel “RESERVE” styling may be used only when the resolved label is a reserve-class action; otherwise show the truthful label in the same button component.

## Image rules

| Surface | Image policy |
|---|---|
| Named restaurant cards/heroes | First-party or fallback |
| Home marketing hero | Generic atmospheric OK |
| State/city/cuisine heroes | Generic destination/cuisine atmospheric OK |
| Auth split panel | Generic atmospheric OK |
| Education | Generic OK |
| Collection hero | Prefer collection cover if stored; else atmospheric or first restaurant fallback |

## Counts and progress

| UI module | Data source |
|---|---|
| Home stats strip | Aggregate queries over restaurant dataset |
| Passport summary cards | Passport metrics: Visited; **To Visit** = unique wantToVisit ∪ planned excluding visited (OD-09); Favorites |
| Stars Collected bars | Visited (or saved—product rule) counts vs catalog totals by star |
| States Explored | Distinct states in passport vs catalog state count |
| Collection progress | Visited among collection members |

Clarify “To Visit” — **resolved OD-09:** unique restaurants where `(wantToVisit || planned) && !visited`.

## Routes that designs invent

| Design | Invented route/feature | Adaptation |
|---|---|---|
| `planned_restaurants` | `/planned` | **OD-07:** add `/planned`; reuse existing planned flag |
| Account notifications | Settings section | Omit |
| Public collections | Create dialog toggle | Omit |
| Overview mobile bottom nav | App-wide IA change | Omit unless approved |
