# Design System: TucanGo — Authentication Portal & Campus Mobility (60-30-10)
**Project ID:** `15651838928486418186`

## 1. Visual Theme & Atmosphere
TucanGo combines **editorial institutional clarity** (inspired by **Nous Portal**'s minimalist hairline card ergonomics and tactile micro-interactions) with **Universidad de la Amazonia** campus mobility in Florencia, Caquetá.

- **Density:** 5 / 10 (Editorial Airy Auth & Balanced Mobility — generous Classic Cream breathing space, crisp typographic hierarchy, immediate focus on sign-in and scroll story).
- **Variance:** 6 / 10 (Scroll-driven interactive narrative transitioning smoothly into a centered `max-w-[440px]` Nous-inspired Portal Card with accented edge rule).
- **Motion:** 7 / 10 (60 FPS `requestAnimationFrame` Scroll-Driven Canvas Storytelling + tactile micro-press physics `active:scale-[0.98]` and focus-within outline illumination).
- **Atmosphere:** Warm archival Classic Cream (`#EEE2CB`) paired with authoritative Forest Fir Green (`#1B4532`) and high-energy Tomato Red (`#EE4129` / accessible `#D7331B`) conversion highlights, plus an interactive **Night Canopy (`#0D241A`)** dark mode toggle.

## 2. 60-30-10 Color Palette & WCAG 2.1 Roles
Strictly governed by the 60-30-10 distribution rule:

### 60% Dominant Canvas (Light Mode / Cream Base)
- **Classic Cream (`#EEE2CB`)** — Primary page background (`stage`) and dominant editorial field.
- **Warm Vellum (`#FFFDF9`)** — Elevated Portal Auth card surface (`card`).
- **Parchment Soft (`#F8F2E7`)** — Input shells and secondary surface wells.
- **Almond Hairline (`#E0D3BA` / `rgba(27,69,50,0.18)`)** — `1px` structural dividers and panel outlines.

### 30% Structural Anchors & Typography Ink
- **Forest Fir Green (`#1B4532`)** — Calculated **8.40 : 1 WCAG AAA** contrast on Classic Cream (`#EEE2CB`). Used for primary headlines, body text, form labels, secondary structural borders, and verified Uniamazonia seals.
- **Forest Deep (`#143628`)** — Secondary ink, hover text, and elevated structural buttons.
- **Night Canopy (`#0D241A`)** — Dark theme stage canvas & high-contrast alternate action button (with `#FFFDF9` ink).
- **Slate Moss (`#425C4F`)** — Muted metadata labels, legal footer links, and placeholder tones.

### 10% Conversion & Safety Accent
- **Tomato Red (`#EE4129`)** — Calculated **3.88 : 1** contrast with `#FFFFFF` (strictly for bold large controls $\ge 16\text{px}$ bold, right-edge architectural bar, active focus accents, and brand toucan beak).
- **Tomato Accessible (`#D7331B`)** — Calculated **4.85 : 1 WCAG AA** contrast with `#FFFFFF` for standard primary CTA buttons (`Continuar`, `Iniciar Sesión`), guaranteeing accessible readability across all button sizes.
- **Tomato Tint (`#FFE9E4`)** — Soft error callouts and active alert badges.

## 3. Typography Rules
- **Display / Headlines:** `Plus Jakarta Sans` (weights `600`, `700`, `800`), tight `-0.02em` tracking; stacked 2-line portal mark (`32px`, `line-height: 1`).
- **Body & Form Labels:** `Open Sans` (weights `400`, `500`, `600`, `700`) for direct continuity with Uniamazonia's institutional manual, `1.5` line-height, minimum `14px` inputs/labels.
- **Telemetry, Badges & Dividers:** `JetBrains Mono` (weights `500`, `600`, `700`) with `0.1em` uppercase tracking for `SIGN IN`, `OR`, vehicle plates (`GNX-45F`), and 4-digit security PINs.
- **Banned:** `Inter`, generic classic serifs (`Times New Roman`, `Georgia`), pure `#000000`, neon purple/cyan gradients, or emojis inside functional buttons.

## 4. Interactive Portal Components (Nous Portal Pattern Adaptation)
- **Editorial Stage & Right Accent Rule:** Full `min-h-[100dvh]` stage with an `8px` Tomato Red (`#EE4129`) vertical edge accent bar on the right viewport boundary (mirroring Nous Portal's signature architectural edge).
- **Portal Card (`max-w-[440px]`):** Hairline `1px solid` border, `16px` card radius (`rounded-2xl` / crisp geometric corners inside inner controls), `28px` internal padding, subtle whisper shadow.
- **Focus-Shadow Inputs:** Borderless-feel container transitioning via `box-shadow` (`duration-150`) to `#1B4532` / `#EE4129` outline on `:hover` and `:focus-within`, minimum `44px` tap target.
- **Tactile Buttons (`12px` radius):** Hover border sweep overlay + lift shadow + crisp `active:scale-[0.98]` tactile compression.
- **Asymmetric Quick-Access Grid:** `grid-template-columns: repeat(2, 1fr)` where an odd final button auto-centers across both columns (`last:odd:grid-column: span 2; width: calc(50% - 6px); justify-self: center;`), followed by a full-width high-contrast action button (`Entrar al Mapa en Vivo`).
- **Interactive Theme Switcher:** Minimalist footer toggle seamlessly switching **Classic Cream (`#EEE2CB`)** ↔ **Night Canopy (`#0D241A`)**.

## 5. Scroll-Driven Multimedia Layer
- Sticky `100dvh` viewport container hosting a `60 FPS` HTML5 `<canvas>` + synchronized SVG/DOM layers depicting:
  1. TucanGo minimalist toucan emblem + Caquetá topographic curves (`tucan-portal-badge.png`, `tucango-corridor-depth.png`).
  2. Illustrated Uniamazonia motorcycle commuter (`tucango-rider-hero.png`) gliding across Florencia checkpoints (*Porvenir -> Centro -> Balcanes*) tied smoothly to `window.scrollY`.
  3. Built-in support for external Google Flow / Veo frame sequences placed in `/assets/flow-frames/manifest.json`.
