# Image strategy

## Why imagery matters

For a food and restaurant discovery product, photography is product, not decoration. The rejected UI fails because abstract placeholders communicate “not ready” and provide no appetite or trust.

## Legal bounds (preserve)

From existing architecture and image-attribution policy:

- Do **not** scrape or republish Michelin Guide imagery or Guide prose.
- Do **not** hotlink unverified restaurant photos as first-party content.
- Guide URLs remain outbound references only.
- User-uploaded photos are out of scope for this rebuild batch.

## Locked approach for this rebuild

### Generic surfaces — atmospheric photography allowed

Licensed / curated atmospheric photography may be used **only** on:

- Homepage hero
- Destination cards (city / region)
- Cuisine category cards
- Michelin education modules
- Passport promotional / teaser content
- Other generic marketing sections (e.g. map teaser chrome without naming a restaurant)

These surfaces do not claim a specific restaurant’s kitchen, plate, or dining room.

### Named restaurant surfaces — strict rule (locked)

Applies to: homepage featured flagship, secondary featured cards, Explore cards, list rows, map selected preview, map list thumbs, restaurant detail heroes (later batch), and any other UI that names a restaurant.

| Condition | Treatment |
| --- | --- |
| Named restaurant + **verified-rights** image | Show that real restaurant image |
| Named restaurant + **no** approved image | Show a **premium designed non-photo fallback** |
| Named restaurant + unrelated stock dish / interior | **Never** |

**Never** place atmospheric stock food or dining-room photography on a named restaurant card or feature — even if captioned as “not claimed as that kitchen.” That still confuses users and produces a beautiful but misleading product.

### Premium designed fallback (named restaurants)

When no approved photo exists:

- Quiet, premium, non-photographic treatment (soft cool gradient, typographic monogram / initials, restrained star mark)
- Must not look like paper collage or loud “Placeholder” branding
- Must not resemble a real plated dish or interior photo

## Surface matrix

| Surface | Imagery |
| --- | --- |
| Homepage hero | Atmospheric / destination OK |
| Homepage featured (named) | Real approved image **or** designed fallback — never stock food/interior |
| Destination cards | City / region photography OK |
| Cuisine cards | Category food photography OK (not tied to a named restaurant) |
| Map teaser (generic) | Atmospheric or map chrome OK |
| Explore / map restaurant media | Approved restaurant image **or** designed fallback only |
| Education / Passport promo | Atmospheric OK |

## Asset model (spec only — implementation later)

Future data field (already noted in architecture, not yet on runtime `Restaurant` type):

- `hero_image_url` (nullable) — owned or licensed only
- Optional: `hero_image_attribution`, `hero_image_license`

Until the field is populated:

1. Generic surfaces use a curated static pack (e.g. `public/images/atmosphere/`, `public/images/destinations/`) — paths deferred to implementation.
2. Named restaurant surfaces use the designed fallback unless an approved URL exists.
3. Image attribution page must be updated when assets ship (license + credit).

## Quality bar

- High resolution, correctly cropped for 4:3 (cards) and 16:9 / 3:2 (heroes)
- Natural color; appetizing; premium lighting on atmospheric / destination assets
- No stock clichés that read as generic “AI food collage”
- Consistent treatment: slight darkening gradient only when text overlays image

## Text on imagery

- Never invent a dish name or imply “at this restaurant” for atmospheric stock on generic surfaces.
- Alt text: descriptive and honest (“Dining room interior”, “Plated tasting course”, “San Francisco skyline”).
- Named restaurant alt text must not describe a stock photo as that restaurant’s food or room.

## Out of scope this batch

- Building a full CMS for restaurant photos
- User photo uploads
- Scraping official sites automatically

## Decision record

| Decision | Choice |
| --- | --- |
| Atmospheric stock | Generic surfaces only |
| Named restaurant imagery | Verified real image **or** designed non-photo fallback |
| Unrelated stock on named cards | Forbidden |
| Michelin Guide images | Never |
| Fallback role | Premium designed non-photo treatment — not fake photography |
