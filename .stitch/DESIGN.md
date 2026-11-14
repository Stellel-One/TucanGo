# Design System: TucanGo — Amazonia Campus Mobility
**Project ID:** Pending Stitch Upload

## 1. Visual Theme & Atmosphere
TucanGo embodies **calm, trustworthy Amazonian utility** for the **Universidad de la Amazonia** community in Florencia, Caquetá. Derived directly from the university's official *Manual de Imagen e Identidad Institucional*, the brand honors the iconic **U-A intertwined toucan facing right** (symbolizing regional progress and forward projection) without relying on forced jungle wallpaper or cartoon tropes.

- **Density:** 6 / 10 (Daily Mobility App Balanced — clear operational telemetry, map-centered route clarity, generous whitespace).
- **Variance:** 6 / 10 (Asymmetric operational workspace: interactive Florencia campus map & radar paired with clean Passenger/Driver control panels).
- **Motion:** 5 / 10 (Restrained spring physics — crisp feedback for ride lifecycle transitions without distractions).
- **Atmosphere:** Grounded botanical-mineral light canvas paired with authoritative institutional forest green, exact Uniamazonia `#222222` ink, and disciplined terracotta-crimson safety highlights.

## 2. Color Palette & Roles
Anchored in Universidad de la Amazonia's official Pantone specifications, perceptually calibrated for digital screen legibility and WCAG AA contrast.

### Surface & Neutral Scale
- **Piedmont Mist** (`#F6F7F4`) — Primary application canvas background (2% warm botanical undertone).
- **Pure Cloud** (`#FFFFFF`) — Elevated ride cards, floating map sheets, and control panels.
- **Canopy Tint** (`#EDF2EE`) — Secondary containers, input wells, and subtle surface fills.
- **Whisper Stone** (`#D8E0D9`) — 1px hairline borders and structural dividers.
- **Institutional Charcoal** (`#222222`) — Exact Uniamazonia Pantone Black C (`RGB 34,34,34`) for primary headings and crisp body ink (never `#000000`).
- **Slate Moss** (`#4B5B53`) — Secondary labels, timestamps, coordinates, and metadata.

### Brand Primary Accent (Single Primary CTA Accent)
- **Canopy Institutional** (`#0F6B36`) — Perceptually calibrated from Uniamazonia's official Pantone 356 C (`#0B750E`). Primary CTA buttons ("Solicitar Viaje", "Aceptar Viaje"), active route polylines, focus rings, and verified institution seals.
- **Deep Canopy Hover** (`#0B5229`) — Hover and active press state for primary buttons.
- **Verified Wash** (`#E8F4EC`) — Soft tinted container for `SOAT Vigente` badges and safe arrival confirmations.

### Heritage & Semantic Accents (Strict Functional Roles — Never Competing CTAs)
- **Tucán Crimson** (`#C93B2B`) — Calibrated from Uniamazonia Pantone 185 C (`#E81312`) and the toucan's beak. Reserved strictly for urgent cancellation/safety alerts, live incoming request pulse badges, and the vector toucan beak accent — never placed adjacent to green in saturated clashes.
- **Crimson Wash** (`#FCEEEA`) — Soft tint for emergency/cancellation callouts.
- **Piedmont Ochre** (`#C47E1A`) — Star ratings (`1.0–5.0`), `Tarifa Lluvia` dynamic surcharge tags, and nocturnal safety tags.
- **Verified Leaf** (`#1D7A52`) — `FINALIZADO` and `PAGADO` confirmation pills.

## 3. Typography Rules
Honors the digital complementary typefaces from Universidad de la Amazonia's Manual (`Open Sans` + geometric sans character) while avoiding heavy width distortion in dense mobile/web mobility cards.

- **Display / Headlines:** `Plus Jakarta Sans` (weights `600`, `700`, `800`) — Geometric warmth evolving the institutional `Montserrat` aesthetic with tight `-0.02em` tracking and cleaner legibility in compact ride cards.
- **Body / UI Controls:** `Open Sans` (weights `400`, `500`, `600`, `700`) — Directly aligned with Uniamazonia's official Manual de Imagen for long-form clarity, relaxed `1.5` leading, minimum `14px` UI copy.
- **Monospace / Telemetry:** `JetBrains Mono` (weights `500`, `600`) — Mandatory for trip codes (`TUC-101`), license plates (`GNX-45F`), COP currency values (`$2.500 COP`), and distance readouts (`3.4 km`).
- **Banned:** `Inter`, generic classic serifs (`Century`, `Times New Roman`, `Georgia`) inside dashboard controls.

## 4. Component Stylings
- **Brand Emblem:** Minimalist geometric vector monogram (`svg`) combining a forward-facing (rightward) toucan beak + stylized route curve in `#0F6B36` and `#C93B2B` accent. Zero emojis (`🦜`) in UI controls.
- **Buttons:** Flat fill, zero outer glow shadows, tactile push feedback (`translateY(-1px)` hover, `scale(0.98)` active). `12px` corner radius (`ROUND_TWELVE`). Minimum `44px` tap target height.
- **Cards & Containers:** `16px` rounded corners on primary panels (`12px` on nested ride items), Pure Cloud (`#FFFFFF`) surface, `1px solid #D8E0D9` border, canopy-tinted whisper shadow (`0 4px 16px -2px rgba(34, 34, 34, 0.06)`).
- **Inputs & Forms:** Label strictly above input, Canopy Tint (`#EDF2EE`) or Pure Cloud fill, `1px solid #D8E0D9`, `#0F6B36` focus ring, inline error text below.
- **Verification & Status Badges:** Pill-shaped (`9999px`) status chips using `JetBrains Mono` uppercase `11px` tags (`SOLICITADO`, `ACEPTADO`, `EN_CURSO`, `FINALIZADO`, `SOAT VIGENTE`).
- **Loaders & Empty States:** Skeletal shimmer matching card layout; empty states use ultra-subtle (`4%` opacity) Caquetá topographic river contour SVG lines with concise next-step guidance.

## 5. Layout Principles & Responsive Rules
- **Asymmetric Workspace (Desktop):** Grid-first architecture (`max-width: 1440px`) featuring a live **Florencia / Uniamazonia Interactive Route Map** alongside cleanly separated **Vista Pasajero (Estudiante)** and **Vista Motorista** tabs/panels, plus a transparent institutional traceability bar.
- **Viewport Integrity:** Full-height containers use `min-h-[100dvh]`; never `h-screen`.
- **Mobile Collapse (< 768px):** Strict single-column collapse with zero horizontal overflow, sticky active-trip telemetry bar, and thumb-friendly `44px+` controls.

## 6. Motion & Interaction
- **Spring Physics:** Smooth cubic-bezier / spring feel (`stiffness: 100, damping: 20`) on state transitions.
- **Live Telemetry Pulse:** Subtle breathing indicator (`transform`/`opacity` only) on active `SOLICITADO` radar pings and live WebSocket connection status.

## 7. Anti-Patterns (Strictly Banned)
- **Forced Thematic Clichés:** No tropical leaf wallpapers, wood grain textures, tribal borders, or cartoon mascots inside operational screens.
- **AI Visual Tells:** No `Inter` font, no pure black (`#000000`), no purple/indigo neon gradients, no outer glow button shadows, no emoji icons (`🦜`, `🚀`, `✨`) inside production UI controls.
- **Fake Copy & Metrics:** No generic placeholder names, no invented uptime percentages, no `SYSTEM // 2026` labels. Ground every landmark in real Florencia / Uniamazonia context (*Campus Porvenir*, *Sede Centro*, *Granja Balcanes*, *Barrio La Vega*, *Terminal de Florencia*).

## 8. Design System Notes for Stitch Generation
**Copy this block into Stitch baton prompts when generating screens:**

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web & Responsive Mobile Web App, Utility-first Mobility Dashboard
- Theme: Light botanical-mineral mode, Piedmont Mist canvas (#F6F7F4), Pure Cloud cards (#FFFFFF)
- Primary Accent: Canopy Institutional Green (#0F6B36) for CTAs and verified seals; Tucán Crimson (#C93B2B) strictly for alert/cancel accents and brand mark highlight
- Text Primary: Institutional Charcoal (#222222); Secondary: Slate Moss (#4B5B53)
- Fonts: Plus Jakarta Sans (headlines), Open Sans (body), JetBrains Mono (plates, codes, COP fares)
- Roundness: 12px buttons/inputs, 16px cards, pill status badges
- Layout: Clean asymmetric mobility dashboard with interactive Florencia/Uniamazonia route map, Dual-View Student/Driver workspace, subtle Caquetá topographic linework only in empty states, zero emojis or cartoon jungle clutter
