---
name: Michelin Discovery System
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#414845'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#717975'
  outline-variant: '#c0c8c3'
  surface-tint: '#3f6658'
  primary: '#00251b'
  on-primary: '#ffffff'
  primary-container: '#123b2f'
  on-primary-container: '#7ca596'
  inverse-primary: '#a5d0bf'
  secondary: '#7c5800'
  on-secondary: '#ffffff'
  secondary-container: '#ffc964'
  on-secondary-container: '#765400'
  tertiary: '#47000e'
  on-tertiary: '#ffffff'
  tertiary-container: '#68111f'
  on-tertiary-container: '#ef7881'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1ecda'
  primary-fixed-dim: '#a5d0bf'
  on-primary-fixed: '#002118'
  on-primary-fixed-variant: '#274e41'
  secondary-fixed: '#ffdea7'
  secondary-fixed-dim: '#f3be5a'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#ffdada'
  tertiary-fixed-dim: '#ffb3b5'
  on-tertiary-fixed: '#40000c'
  on-tertiary-fixed-variant: '#822530'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Literata
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Literata
    fontSize: 36px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Literata
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Literata
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.08em
  meta-data:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max-width: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  section-padding: 80px
---

## Brand & Style
The design system is built for an audience of discerning epicureans who value curation, heritage, and the "quiet luxury" of fine dining. The brand personality is that of an expert concierge: knowledgeable, understated, and impeccably organized.

The aesthetic follows a **Minimalist-Editorial** direction. It prioritizes high-resolution culinary photography and white space to create a sense of breathability and exclusivity. Visual noise is aggressively reduced to allow the "Star Gold" and "Burgundy" accents to signify prestige and status without overwhelming the reader. The experience should feel less like a utility app and more like a high-end digital monograph.

## Colors
This design system utilizes a palette rooted in natural, prestigious tones. 
- **Primary Green (#123B2F):** Used for primary actions and brand anchoring. It evokes the deep tones of classic library leathers and formal dining rooms.
- **Star Gold (#B88A2A):** Reserved exclusively for rating indicators, awards, and "Michelin" status highlights.
- **Burgundy Accent (#7A1F2B):** Used sparingly for special highlights, wine-related content, or seasonal features.
- **Neutrals:** The background is a crisp white to maintain a gallery-like feel, while a soft sage-grey (#F5F6F4) provides subtle containment for secondary sections or metadata backgrounds.

## Typography
The typography pairing establishes an editorial hierarchy. **Literata** (selected as the closest available high-end serif to Instrument Serif) provides the "voice" of the platform—used for restaurant names, editorial titles, and storytelling. It should be set with tight leading for a sophisticated look.

**Inter** handles all functional UI elements, ensuring maximum legibility in dense lists, reservation forms, and address details. Use `label-caps` for section headers and category tags to create clear structural boundaries.

## Layout & Spacing
The layout follows a **Fixed Grid** model on desktop (12 columns) to ensure content remains centered and readable on ultra-wide monitors. 

- **Desktop:** Large 64px margins and 80px vertical section spacing to maintain the "premium" feel of a physical magazine.
- **Mobile:** Transition to a 4-column fluid layout with 20px margins.
- **Rhythm:** All spacing must be multiples of 8px. Use generous padding inside containers to prevent content from feeling "trapped."

## Elevation & Depth
In alignment with the sophisticated, flat editorial style, this design system avoids heavy drop shadows. 
- **Tonal Separation:** Use the "Soft Background" (#F5F6F4) to distinguish between the main canvas and secondary modules.
- **Low-Contrast Outlines:** Use 1px borders in #E5E7E4 to define cards and input fields.
- **Interaction Depth:** On hover, cards may feature a very subtle, highly diffused ambient shadow (0px 4px 20px rgba(0,0,0,0.04)) to indicate interactivity without breaking the flat aesthetic.

## Shapes
The shape language is "Soft" (0.25rem/4px base). This provides enough curvature to feel modern and accessible while remaining sharp enough to feel professional and architectural. Larger components like cards and primary buttons use `rounded-lg` (8px) to feel substantial and tactile. Avoid pill-shapes for anything other than status tags (e.g., "Available Today").

## Components
- **Buttons:** Height set to 48px. Primary buttons use Deep Green background with white text. Secondary buttons use a 1px border (#E5E7E4) with Primary Green text. Text is 14px Semi-bold Inter.
- **Cards:** Use a strict 4:3 aspect ratio for images. The restaurant name (Serif) sits directly below the image, followed by a meta-row (Sans) containing price point, cuisine, and location.
- **Chips/Tags:** Small 24px height, soft-green or soft-gold backgrounds with 4px radius. Used for "1 Star," "Green Star," etc.
- **Input Fields:** 48px height, 1px border (#E5E7E4), 4px radius. Labels should be `label-caps` positioned above the field.
- **Header:** 72px height, sticky, #FFFFFF with a subtle bottom border (#E5E7E4). Logo centered or left-aligned; navigation items in Inter 14px Medium.
- **Footer:** Minimalist design on #F5F6F4. Includes a required legal disclaimer: *"Independent discovery platform. Not affiliated with the Michelin Guide."* in 12px muted text.