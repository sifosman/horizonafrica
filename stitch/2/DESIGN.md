---
name: Luminous Wellness System
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#efeeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#4e4639'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f0ed'
  outline: '#7f7667'
  outline-variant: '#d1c5b4'
  surface-tint: '#775a19'
  primary: '#775a19'
  on-primary: '#ffffff'
  primary-container: '#c5a059'
  on-primary-container: '#4e3700'
  inverse-primary: '#e9c176'
  secondary: '#665c58'
  on-secondary: '#ffffff'
  secondary-container: '#eedfdb'
  on-secondary-container: '#6d625e'
  tertiary: '#615e56'
  on-tertiary: '#ffffff'
  tertiary-container: '#a9a59c'
  on-tertiary-container: '#3d3b34'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdea5'
  primary-fixed-dim: '#e9c176'
  on-primary-fixed: '#261900'
  on-primary-fixed-variant: '#5d4201'
  secondary-fixed: '#eedfdb'
  secondary-fixed-dim: '#d1c4bf'
  on-secondary-fixed: '#211a17'
  on-secondary-fixed-variant: '#4e4541'
  tertiary-fixed: '#e7e2d8'
  tertiary-fixed-dim: '#cac6bc'
  on-tertiary-fixed: '#1d1c15'
  on-tertiary-fixed-variant: '#49473f'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
typography:
  display-lg:
    fontFamily: DM Sans
    fontSize: 48px
    fontWeight: '500'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: DM Sans
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: DM Sans
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
  title-md:
    fontFamily: DM Sans
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding-desktop: 40px
  container-padding-mobile: 20px
  gutter: 24px
  section-gap: 64px
---

## Brand & Style

This design system embodies the intersection of clinical precision and high-end hospitality. It targets a discerning clientele who value both medical expertise and emotional well-being. The aesthetic is "Spa-Tech"—a synthesis of rigorous medical standards and the serene, tactile environment of a luxury wellness retreat.

The visual direction leverages a **Soft Luxury** movement. It prioritizes extreme whitespace, airy compositions, and a "breathable" interface that reduces cognitive load for clinicians and patients alike. By eschewing harsh lines and high-contrast separators, the UI mimics the soft lighting and high-quality materials of a physical luxury clinic. The goal is to evoke feelings of calm, cleanliness, and quiet confidence.

## Colors

The palette is rooted in organic, architectural tones. 
- **Primary (Deep Gold):** Used sparingly for key actions, brand moments, and critical data points. It represents the "premium" nature of the service.
- **Secondary (Soft Blush):** Acts as a gentle highlight or background for interactive containers, softening the medical context.
- **Tertiary (Warm Grey):** Primarily for secondary text and structural subtle elements, avoiding the clinical coldness of pure black or cool grey.
- **Neutral (Cream):** The foundation of the entire system. This warm off-white creates a more sophisticated and "expensive" feel than a standard white (#FFFFFF) background.

## Typography

DM Sans is the sole typeface, chosen for its low-contrast geometric shapes that feel approachable yet precise. 

- **Headlines:** Use a medium weight with tight letter-spacing to create a "custom-designed" look.
- **Body:** Standardized at 16px for optimal legibility within a clinical dashboard context.
- **Labels:** Small caps or uppercase with increased tracking are used for metadata and table headers to provide a clear hierarchy without needing heavy font weights.
- **Mobile Scaling:** Large displays scale down by approximately 15% on mobile to maintain balance within smaller viewports.

## Layout & Spacing

The layout follows a **Fluid Grid** model with generous margins to mimic an editorial layout. 

- **Grid:** A 12-column system is used for desktop, but elements are often centered or grouped with wide side-margins to prevent the "wall of data" effect.
- **Rhythm:** An 8px base unit governs all spacing. However, for section-to-section transitions, use "over-sized" gaps (64px+) to reinforce the minimalist, luxury aesthetic.
- **Breakpoints:**
  - **Mobile (<768px):** Single column, 20px side margins.
  - **Tablet (768px - 1200px):** 8 columns, 32px side margins.
  - **Desktop (>1200px):** 12 columns, max-content width of 1440px to ensure line lengths remain readable.

## Elevation & Depth

This system uses **Tonal Layers** and **Ambient Shadows** to create a sense of organized calm. 

- **Surface Tiers:** The base layer is always the Neutral Cream (#FDFBF7). Cards and primary containers use pure White (#FFFFFF) to subtly lift them from the background.
- **Shadows:** Avoid harsh, dark shadows. Use long-spread, low-opacity (5-8%) shadows with a slight tint of the Primary Gold or Warm Grey to make elements appear as if they are floating gently above the surface. 
- **No Borders:** Structural separation is achieved through color shifts and shadows rather than lines. When a divider is strictly necessary, use a 1px Soft Blush (#F7E8E3) line.

## Shapes

The shape language is defined by **High Roundedness**. 

- **Standard Containers:** Cards, modals, and input fields use a minimum radius of 16px (`rounded-lg`).
- **Main App Shell:** Large dashboard panels or hero sections should utilize `rounded-xl` (24px) to create a soft, frame-like appearance.
- **Buttons & Badges:** These are strictly pill-shaped (fully rounded) to maximize the "soft" and "approachable" feel of the interface.
- **Interactive States:** On hover, shapes do not become sharper; instead, they may slightly increase in shadow depth to suggest they are being "lifted" toward the user.

## Components

- **Buttons:** Primary buttons are Deep Gold with white text. Secondary buttons use the Soft Blush background with Primary Gold text. All buttons must be pill-shaped with generous horizontal padding.
- **Chips & Badges:** Used for status (e.g., "Confirmed," "Completed"). These are always pill-shaped, using low-saturation versions of the status color (e.g., soft sage for success, soft terracotta for alerts) to maintain the muted luxury palette.
- **Input Fields:** Backgrounds should be White or a very faint tint of the Neutral Cream. Borders are absent; focus states are indicated by a 1px Deep Gold inner glow or a subtle increase in shadow.
- **Cards:** The workhorse of the dashboard. White background, 16px corners, and a soft ambient shadow. Content within cards should have at least 24px of internal padding.
- **Lists:** Use wide row heights (64px+) with subtle dividers only if necessary. Hover states on list items should use a Soft Blush background tint with a 4px left-accent bar in Deep Gold.
- **Specialized Components:** Include a "Calendar/Scheduler" that looks more like a high-end planner than a digital tool, utilizing plenty of white space between time slots.