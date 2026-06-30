---
name: Academic Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  surface-light: '#F8FAFC'
  border-subtle: '#E2E8F0'
  success-green: '#22C55E'
  navy-muted: '#1E293B'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
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
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-desktop: 80px
  margin-mobile: 20px
  section-gap: 120px
  container-max: 1280px
---

## Brand & Style

The design system is built on a foundation of **Corporate Modernism**, tailored specifically for high-stakes technical education. It balances the rigor of engineering with the accessibility of a modern startup. The visual language aims to evoke three primary emotional responses: **Competence** through structured layouts, **Ambition** through high-energy blue accents, and **Trust** through a deep, stable navy palette.

The aesthetic utilizes "Professional Clarity"—prioritizing legibility and a logical information hierarchy. It avoids unnecessary decoration in favor of functional aesthetics: generous white space, subtle depth through tonal layering, and a refined use of geometric shapes that reflect the precision required in the engineering disciplines the platform teaches.

## Colors

The palette is anchored by **Deep Corporate Navy**, used for primary branding, headings, and high-importance UI shells to project authority. **Vibrant Accent Blue** serves as the primary interactive signal, reserved for CTAs, focus states, and progress indicators to inject energy into the "Get Hired" narrative.

**Neutral Grays** are tiered to create a hierarchy of information: darker grays for body text to ensure WCAG AAA readability, and lighter grays for borders and secondary metadata. The background strategy relies on a clean white base with off-white (`#F8FAFC`) section backgrounds to subtly group content without the need for heavy dividers.

## Typography

This design system uses a dual-font strategy. **Plus Jakarta Sans** is used for headings to provide a modern, slightly friendly, and professional character. Its geometric nature complements the engineering theme. **Inter** is utilized for body text and labels for its exceptional legibility and neutral, systematic feel, ensuring that dense technical descriptions remain easy to digest.

Scale is used aggressively to define focal points. Display styles feature tight letter spacing for a punchy, editorial look, while labels use increased letter spacing and uppercase styling to provide clear distinction for metadata like "COURSE DURATION" or "HYBRID".

## Layout & Spacing

The layout follows a **Structured Fluid Grid** model. Content is contained within a 12-column grid on desktop with a maximum width of 1280px to maintain line-length readability. 

- **Sectioning:** Use a generous 120px vertical gap between major landing page sections to allow the brand to breathe and reduce cognitive load.
- **Grids:** Course catalogs should utilize a 3-column grid on desktop, transitioning to 2-columns on tablet, and a single stack on mobile.
- **Rhythm:** All spacing (padding, margins, gaps) must be multiples of 8px to maintain a strict mathematical harmony consistent with an engineering brand.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** supplemented by **Ambient Shadows**. Instead of heavy shadows, this design system uses:

1.  **Level 0 (Base):** Solid white or `#F8FAFC` for page backgrounds.
2.  **Level 1 (Cards & Badges):** White background with a 1px border in `#E2E8F0` and a very soft, diffused shadow (`0px 4px 20px rgba(15, 23, 42, 0.05)`). Used for testimonials, industry partner logos, and stats cards.
3.  **Level 2 (Interaction):** When hovering over interactive cards, the shadow deepens and the card translates slightly upward (`-translate-y-1`) to indicate focus.

Major sections like "Why Students Trust Us" (Stats), "What Our Students Say" (Testimonials), and the "Final CTA" employ this light-themed depth strategy with clean white containers, high-contrast typography, and soft colored orbs to structure content elegantly without resorting to dark backgrounds.

## Shapes & Media Badges

The design system employs a **Rounded** (0.5rem / 8px) shape language, accented by more pronounced curves for media elements.

- **Standard Elements:** Buttons, input fields, and small cards use the base 8px radius.
- **Large Containers:** Hero images and large promotional sections (like the Final CTA block) use the `rounded-xl` (1.5rem / 24px) or `rounded-[2rem]` radius to create a contemporary, framed appearance.
- **Partner Logos:** Displayed as company logo images inside a white `rounded-2xl` (16px) container with a subtle border. Automatically falls back to a colored, letter-initial badge if the logo image is missing.
- **Mentor Profiles:** Profile photos are rendered in a clean, round `rounded-full` badge with a subtle border. Automatically falls back to a colored, letter-initial circle if the profile photo is missing.
- **Status Badges:** Use a pill-shape (full radius) with a light tinted background (e.g., `bg-emerald-500/10 text-emerald-800` or `bg-secondary/10 text-secondary`) to distinguish status from functional components.

## Animations & Micro-Interactions

To maintain a premium, professional aesthetic, animations are kept highly purposeful and restrained:
- **No Distracting Animations:** Avoid unnecessary background movements (like floating shapes, pulsing indicator dots, or continuous button shimmering).
- **Smooth Transitions:** Use clean CSS transitions for hover states (e.g., card scaling, shadow deepening, and color shifts).
- **Scale Adjustments:** Interactive badges and cards scale slightly (e.g., `group-hover:scale-105`) on hover to provide responsive visual feedback.

## Components

### Buttons
- **Primary:** Deep Navy background with White text or a premium blue gradient (`from-blue-600 to-blue-500`). Bold weight.
- **Secondary:** Transparent with Accent Blue border and text, or white background with a subtle gray border for light-theme cards.
- **CTA:** Accent Blue background with White text, used exclusively for conversion points like "Enroll Now."

### Cards
Course and testimonial cards feature a structured internal layout. Testimonial cards display warm amber stars (`text-amber-500`) and a soft-colored avatar fallback.

### Input Fields
Inputs should have a 1px border in `#E2E8F0`. Upon focus, the border transitions to Accent Blue with a 2px outer glow (ring) of the same color at 20% opacity.

### Chips & Badges
Badges (e.g., "100% Job Assistance") should use a subtle tint of the primary color (e.g., light blue background with dark blue text) to provide status without competing with buttons.

### Lists
Use custom bullet indicators (e.g., a small 8px Accent Blue square or checkmark) rather than standard browser bullets to reinforce the technical, precision-oriented brand identity.