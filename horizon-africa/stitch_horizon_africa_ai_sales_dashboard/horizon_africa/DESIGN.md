---
name: Horizon Africa
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#534434'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#867461'
  outline-variant: '#d8c3ad'
  surface-tint: '#855300'
  primary: '#855300'
  on-primary: '#ffffff'
  primary-container: '#f59e0b'
  on-primary-container: '#613b00'
  inverse-primary: '#ffb95f'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#00658b'
  on-tertiary: '#ffffff'
  tertiary-container: '#1abdff'
  on-tertiary-container: '#004966'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb95f'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#c5e7ff'
  tertiary-fixed-dim: '#7fd0ff'
  on-tertiary-fixed: '#001e2d'
  on-tertiary-fixed-variant: '#004c6a'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 24px
  margin-page: 32px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

This design system balances the rigorous reliability of enterprise SaaS with the warmth and vibrancy of African heritage. The brand personality is professional, sophisticated, and authoritative, yet avoids the coldness of traditional corporate design by utilizing "Warm Amber" as a focal point.

The visual style is **Corporate / Modern** with a **Minimalist** ethos. It draws heavy inspiration from high-end developer tools and productivity suites (Linear-inspired), prioritizing high-density information architecture without sacrificing clarity. Expect generous whitespace, precise geometric alignment, and a focus on functional elegance that instills confidence in high-stakes sales environments.

## Colors

The palette is anchored by a deep **Navy/Slate (#0F172A)** used for the sidebar and structural navigation, providing a grounded, "heavy" base that signifies stability. The content area is a crisp **White (#FFFFFF)** to ensure maximum legibility and focus.

**Primary Accent (Warm Amber - #F59E0B):** Used for primary actions, critical conversion points, and high-priority lead indicators. It evokes the warmth of the African sun and signals growth and energy.
**Secondary Accent (Teal - #0D9488):** Used for success states, active connections, and secondary functional highlights.
**Neutral Tones:** A range of cool greys (Slate 50 to 400) are utilized for borders, secondary text, and iconography to maintain the clean, "Linear" look.

## Typography

The design system utilizes **Inter** exclusively to achieve a systematic, utilitarian aesthetic. The type scale is optimized for data-heavy applications, with a clear hierarchy that guides the eye through complex dashboards.

- **Headlines:** Use tighter letter spacing and semi-bold weights to maintain a contemporary, sharp feel.
- **Data Points:** KPI numbers in stat cards should use `display-lg` with a bold weight for immediate impact.
- **Labels:** Small, uppercase labels are used for category headers and meta-data to create structural separation without adding visual weight.
- **Responsive:** For mobile devices, `display-lg` should scale down to 28px to ensure stat cards remain legible within narrow viewports.

## Layout & Spacing

This design system uses a **12-column fluid grid** for the main content area, with a fixed-width sidebar (260px). 

- **Sidebar:** Fixed to the left, using the deep Navy colorway. 
- **Margins & Gutters:** High-density content requires breathing room; a 24px gutter is standard between dashboard cards. Page margins are set to 32px to provide a premium, spacious feel.
- **Rhythm:** An 8px base grid governs all padding and margin increments.
- **Breakpoints:**
  - **Desktop (1280px+):** Full 12-column layout.
  - **Tablet (768px - 1279px):** Sidebar collapses into an icon-only rail or hamburger menu; 8-column grid.
  - **Mobile (<768px):** Single-column stack; horizontal margins reduce to 16px.

## Elevation & Depth

To maintain a clean, modern SaaS look, elevation is handled primarily through **Tonal Layers** and **Subtle Shadows**.

1.  **Level 0 (Base):** The main background area (#FFFFFF or Slate-50).
2.  **Level 1 (Cards):** White surfaces with a very soft, diffused shadow (0px 1px 3px rgba(0,0,0,0.05), 0px 10px 15px -3px rgba(0,0,0,0.08)). These cards use a 1px border (#E2E8F0) to define edges against the white background.
3.  **Level 2 (Overlays/Dropdowns):** Higher contrast shadows (0px 20px 25px -5px rgba(0,0,0,0.1)) to indicate temporary interaction layers.

Avoid heavy gradients. Depth is created through crisp 1px borders and slight shifts in background greys.

## Shapes

The shape language is modern and approachable. 
- **Standard Cards & Inputs:** Use a 12px (`rounded-lg`) corner radius to soften the enterprise feel.
- **Large Containers:** Dashboard sections or modals use 16px (`rounded-xl`).
- **Badges & Tags:** Use a full pill-shape (radius: 9999px) for status indicators like "HOT," "WARM," and "COLD" to distinguish them from functional UI elements.
- **Buttons:** Maintain a 12px radius to match input fields for visual continuity.

## Components

### Buttons
- **Primary:** Warm Amber (#F59E0B) with white text. High-contrast, bold.
- **Secondary:** Transparent background with Slate-700 text and 1px Slate-200 border.
- **Ghost:** Minimal padding, no border, used for utility actions.

### Stat Cards
KPI cards feature a large `display-lg` number, a small `label-md` title, and a sparkline or percentage indicator. Use the Secondary Teal for positive trends and Amber for warnings.

### Score Badges (Leads)
- **HOT:** Amber background with dark text (#78350F).
- **WARM:** Light Amber/Cream background.
- **COLD:** Slate-100 background with Slate-500 text.
- Shape: Full pill-shaped.

### Data Tables
- Header: Slate-50 background, `label-md` text.
- Row: 1px bottom border (#F1F5F9).
- Hover: Light blue/grey tint (#F8FAFC) to indicate interactivity.

### WhatsApp Chat Bubbles
- **Inbound:** Light Slate-100, aligned left, 12px radius with a sharp corner on bottom-left.
- **Outbound:** Teal (#0D9488) with white text, aligned right, 12px radius with a sharp corner on bottom-right.

### Integration Cards
Feature the third-party logo (WhatsApp, Hubspot, etc.) in a 40x40px rounded-md container, a "Connected" status toggle, and a "Settings" ghost button.