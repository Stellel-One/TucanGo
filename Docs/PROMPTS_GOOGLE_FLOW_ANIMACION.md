# Guía de Prompts para Animación Web-Scroll (Google Flow / Veo / Imagen) — TucanGo

Esta guía contiene los prompts listos para usar en **Google Flow** (`labs.google/fx/tools/flow`), **Google AI Studio (Veo)** o **Whisk**, junto con la estructura exacta de carpeta donde **TucanGo** detecta y reproduce automáticamente secuencias de frames al hacer *scroll* (`scroll-scrubbing` a 60 FPS).

---

## 1. Dónde guardar el contenido generado

La aplicación sirve automáticamente cualquier activo que guardes dentro de:

- **Assets del Portal:** `c:\Dev-Stellel\TucanGo\tucango-web\public\assets\portal\`
- **Secuencia Web-Scroll de Google Flow:** `c:\Dev-Stellel\TucanGo\tucango-web\public\assets\flow-frames\`

### Cómo conectar una secuencia de frames de Google Flow
1. Genera el video corto (4 a 6 segundos, cámara suave sin cortes bruscos) en **Google Flow** con cualquiera de los prompts de la sección 2.
2. Descarga el `.mp4` y extrae entre **48 y 90 frames** en formato `.webp` o `.jpg` usando `ffmpeg`:
   ```powershell
   ffmpeg -i flow-tucango.mp4 -vf "fps=15,scale=1280:-2" -q:v 4 c:\Dev-Stellel\TucanGo\tucango-web\public\assets\flow-frames\frame-%03d.jpg
   ```
3. Actualiza `c:\Dev-Stellel\TucanGo\tucango-web\public\assets\flow-frames\manifest.json` indicando la cantidad total de frames y patrón:
   ```json
   {
     "enabled": true,
     "frameCount": 75,
     "pattern": "/assets/flow-frames/frame-{index}.jpg",
     "padLength": 3
   }
   ```
   Mientras `enabled` sea `false` (o si aún no subiste frames), `TucanGo /login` reproduce automáticamente la animación interactiva Canvas + Parallax con los assets vectoriales generados en `/assets/portal/`.

---

## 2. Prompts Listos para Google Flow (Video Web-Scroll)

### Prompt Principal — *Recorrido Orbital / Travellings Suaves para Scroll-Scrub* (Recomendado)
> **Style:** Minimalist flat editorial vector animation · Smooth continuous camera glide · Zero cuts · Consistent Classic Cream `#EEE2CB` backdrop.
>
> ```text
> Smooth continuous single-take 2D/2.5D editorial vector animation at 60fps for a web scroll sequence. A friendly university student wearing a minimalist safety helmet rides forward cleanly alongside a sleek geometric Amazonian toucan silhouette. Strict 60-30-10 color palette: 60% warm Classic Cream background (#EEE2CB), 30% deep Forest Fir Green (#1B4532) stylized university campus arches and subtle topographic river lines gliding past, and 10% Tomato Red (#EE4129) accents on the toucan beak and helmet visor stripe. Steady horizontal tracking shot from left to right, clean vector lines, subtle motion trails, high-contrast minimalist composition inspired by Stripe and Nous Research design aesthetic. No text, no watermarks, no camera shake, seamless motion.
> ```

### Prompt Variante B — *Transición Emblema Tucán → Ruta Campus (Vertical Reveal)*
> ```text
> Minimalist architectural motion graphics animation on a solid Classic Cream (#EEE2CB) canvas. Starts with a centered Forest Fir Green (#1B4532) geometric toucan emblem with a bright Tomato Red (#EE4129) beak; smoothly morphs and unfolds into clean topographic contour lines and a glowing dashed mobility route connecting modern university campus silhouettes. Slow, deliberate, continuous forward camera zoom suitable for scroll-driven scrubbing on an authentication page. Crisp editorial flat aesthetic, zero clutter, no text or letters.
> ```

### Prompt Variante C — *Modo Oscuro (Night Canopy `#0D241A`)*
> ```text
> Sleek minimalist dark-mode architectural motion loop on a deep Forest Night background (#0D241A). Fine glowing Forest Sage (#BED4CA) topographic lines of a valley highway gently illuminate as a bright Tomato Red (#EE4129) location pulse travels smoothly along a curved campus route. Ultra-clean geometric precision, steady slow glide, no text, designed for interactive web scroll playback behind a minimal login card.
> ```

---

## 3. Reglas de Exportación Recomendadas
- **Aspect Ratio:** `16:9` (1280×720) para el Canvas principal (en móvil se recorta limpiamente con `object-cover` centrando la silueta).
- **Duración ideal:** `4s – 5s` a `15–24 fps` en `.jpg`/`.webp` (~60–75 frames totales, < 3 MB en conjunto para carga instantánea en móvil).
- **Colorimetría exacta a pedir:** `Classic Cream #EEE2CB`, `Forest Fir Green #1B4532`, `Tomato Red #EE4129`.
