# NOCTIS — The Light In The Blackout

A premium, minimal, single-page scrollytelling experience for **NOCTIS**, an electric car brand conceived for total darkness.

> *"Every part was designed to disappear into one line of light."*

---

## ⚡ Tech Stack & Architecture

- **Vanilla HTML, CSS, JavaScript** — Zero frameworks, zero build steps, zero npm packages or external libraries.
- **Scroll-Scrubbed Canvas Sequences** — All high-frame-rate animations scrubbed across `<canvas>` with device pixel ratio scaling.
- **WebP Image Sequences**:
  - `assets/frames/hero/` — 442 continuous 1600px desktop frames (quality 78).
  - `assets/frames/hero-mobile/` — 442 continuous 960px mobile frames (quality 72).
  - `assets/frames/dismantle/` — 150 continuous 1600px desktop dismantle frames (quality 78).
  - `assets/frames/dismantle-mobile/` — 150 continuous 960px mobile dismantle frames (quality 72).
- **Product Studio Images** (`assets/cars/`):
  - `gt-e.webp` — Grand tourer coupe in matte graphite.
  - `s.webp` — Four-door sport sedan in satin bone white.
  - `x.webp` — Coupe-roofline SUV in midnight blue.
  - `r.webp` — Track coupe in satin black with rear wing and apex red accents.
  - `one.webp` — Liquid silver concept hypercar.

---

## 🏎️ Features

1. **Preloader** — Centered NOCTIS mark with a thin xenon bar expanding outward and a `000`–`100` mono counter as hero frames 1–40 decode.
2. **Hero Scrollytelling (600vh)** — Continuous driving sequence in a blacked-out city, dynamic telemetry HUD (chapter, speed counter 000–118 km/h, distance), and typography reveals in empty sky.
3. **Engineering Statement (100vh)** — Word-by-word scroll reveal from 15% to 100% opacity.
4. **Dismantle Scrollytelling (350vh)** — Vehicle deconstruction scrubbing with interactive component callouts (BODY, LIGHT, DRIVE, BATTERY) and 1px hairlines.
5. **Model Lineup Accordion (100vh)** — 5 vertical slides with 80ms debounced hover, car driving in 6% from left, typography line reveals, 12px swatches, and keyboard accessibility.
6. **Reserve & Footer** — Xenon-outlined button with hover fill and taillight-red tick indicator.
7. **Custom Headlight Cursor** — 6px dot inside 28px ring morphing into a 44x2px light bar with mono action tags (`VIEW`, `OPEN`, `CONFIGURE`, `RESERVE`).
8. **Fixed Film Grain** — Offscreen noise shifted ~8 times per second at 3.5% opacity.
9. **Accessibility** — `prefers-reduced-motion` support with static fallback progression.

---

## 🚀 Running Locally

Open with any static server:
```bash
# VS Code
Right-click index.html -> "Open with Live Server"

# Python
python -m http.server 5500

# dotnet-serve
dotnet serve -p 5500
```
Then visit `http://localhost:5500`.
