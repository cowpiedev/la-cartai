# Design System Document: The Concierge Ethos

## 1. Overview & Creative North Star: "The Digital Curator"
In the hospitality industry, luxury is defined by invisible service—the ability to anticipate a guest's needs without clutter or noise. This design system adopts **"The Digital Curator"** as its North Star. We are moving away from the "dense dashboard" trope of SaaS and toward an editorial, high-end experience.

The system breaks the "template" look through **intentional asymmetry** and **tonal depth**. Rather than rigid grids of bordered boxes, we use expansive breathing room and overlapping layers to create a sense of architectural space. This approach transforms a management tool into a premium workstation that feels as sophisticated as the properties it manages.

---

## 2. Colors & Surface Philosophy
The palette is rooted in the warmth of the hospitality world. We use a "warm neutral" base to avoid the sterile "tech-blue" feel, anchored by a rich, glowing amber-terracotta.

### The Palette
*   **Primary (#8D4B00):** Our "Terracotta" signature. Used for high-intent actions.
*   **Surface / Background (#F8F9FF):** A cool, airy base that allows the warm accents to pop.
*   **Tertiary (#006096):** A deep Mediterranean blue for secondary data points and calming information.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning content. 
Structure must be defined solely through background color shifts. For example:
*   A side navigation should live on `surface_container_low`.
*   The main workspace should live on `surface`.
*   A featured module should sit on `surface_container_high`.
*   **Result:** The UI feels like a seamless physical environment rather than a wireframe.

### Glass & Gradient Rule
To provide "soul," use **Glassmorphism** for floating elements (Modals, Popovers). Apply a semi-transparent `surface_container_lowest` with a `backdrop-blur` of 12px-16px. Main CTAs should utilize a subtle linear gradient from `primary` to `primary_container` (top-to-bottom) to give buttons a tactile, "lit-from-within" quality.

---

## 3. Typography: The Editorial Voice
We pair the geometric precision of **Manrope** for high-level branding with the high-legibility of **Inter** for data-heavy management.

*   **Display & Headlines (Manrope):** These are our "Editorial" moments. Use `display-lg` (3.5rem) with tighter letter-spacing for landing moments and `headline-md` (1.75rem) for page titles. The wide apertures of Manrope convey openness and luxury.
*   **Body & Labels (Inter):** The "Workhorse." Use `body-md` (0.875rem) for standard text. Inter's tall x-height ensures readability even in complex booking tables.
*   **Hierarchy Note:** Always maintain a minimum 2:1 scale ratio between your Headline and Body text to ensure the "Editorial" contrast is preserved.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often a crutch for poor layout. In this system, hierarchy is achieved through **Tonal Layering**.

*   **The Layering Principle:** Stack your containers. Place a `surface_container_lowest` card on top of a `surface_container_low` section. The subtle shift in hex code creates a "soft lift" that feels natural and premium.
*   **Ambient Shadows:** For "Floating" elements (e.g., a room-selection modal), use an ultra-diffused shadow: `Y: 20px, Blur: 40px, Color: #121C28 at 4% opacity`. This mimics natural light falling across a desk.
*   **The "Ghost Border" Fallback:** If a container absolutely requires a boundary for accessibility, use the `outline_variant` token at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components: Refined Primitives

### Buttons (The "Touchpoints")
*   **Primary:** Gradient of `primary` to `primary_container`. Corner radius: `md` (0.75rem).
*   **Secondary:** No background, `outline` ghost border at 20% opacity.
*   **States:** On hover, shift the gradient intensity rather than changing the color. This creates a "glow" effect.

### Input Fields (The "Check-in")
*   Fields must be `surface_container_lowest` with a `none` border. 
*   **Focus State:** Instead of a thick border, use a 2px outer glow of `primary_fixed` and transition the background to `surface`.

### Cards & Lists (The "Folio")
*   **Forbid Dividers:** Never use horizontal lines to separate list items. Use vertical white space (`spacing-4` or `spacing-6`) and subtle background alternates (Zebra striping using `surface_container_low`).
*   **Cards:** Use `rounded-lg` (1rem) for a friendly, approachable feel.

### Specialized Hospitality Components
*   **Availability Ribbon:** A slim, horizontal component using `tertiary_container` to show occupancy peaks.
*   **Status Badges:** Use "Soft Pills" (fully rounded). `on_error_container` text on `error_container` background for cancellations; `on_primary_fixed_variant` on `primary_fixed` for confirmed bookings.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical margins (e.g., 8rem on the left, 4rem on the right) for dashboard headers to create an editorial look.
*   **Do** use `surface_bright` to highlight active "Guest Profiles" within a list.
*   **Do** prioritize whitespace. If a screen feels "busy," increase the spacing scale rather than adding lines.

### Don't
*   **Don't** use pure black (#000) for text. Always use `on_surface` (#121C28) to maintain the soft, high-end feel.
*   **Don't** use the `DEFAULT` (8px) corner radius for large containers; use `xl` (1.5rem) to signify major sections.
*   **Don't** use standard "Select" dropdowns. Use custom, glass-morphic popovers that feel like an extension of the UI.