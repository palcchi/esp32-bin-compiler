# Third-party visual assets and references

This project reuses selected open-source visual assets/component renderers and studies compatible open-source editor architecture. Original licenses and copyright notices remain with their respective authors.

## Wokwi Elements
- Repository: `wokwi/wokwi-elements`
- License: MIT
- Copyright: Uri Shaked
- Use in this project: electronic component Web Components, SVG/vector presentation, and physical `pinInfo` metadata where available. Device Composer V21 uses the native Wokwi ESP32 DevKit V1 vector and uses native Wokwi component vectors whenever an exact matching element exists.

## Anime.js
- Repository: `juliangarnier/anime`
- License: MIT
- Version used by Device Composer: 4.5.0
- Use in this project: Device Composer view transitions, control feedback, hardware entrance motion, animated wire drawing, guided wiring, and simulation-flow motion. CSS remains responsible for layout and static appearance rather than page animation.

## OpenHW Studio Frontend
- Repository: `OpenHW-Studio/OpenHW-studio-frontend`
- License: MIT
- Use in this project: architectural reference for keeping the circuit canvas state-driven, separating wiring utilities from UI controls, and avoiding multiple renderers owning the same workspace. Vallian's Device Composer renderer and project model remain implemented in this repository.

## Tabler Icons
- Repository: `tabler/tabler-icons`
- License: MIT
- Copyright: Paweł Kuna
- Use in this project: selected clean outline interface icons, adapted as inline SVG through `site/assets-v2.js`.

## PixelArtIcons
- Repository: `halfmage/pixelarticons`
- License: MIT
- Copyright: Gerrit Halfmann
- Use in this project: selected crisp pixel icons for hardware/embedded accents and compact navigation states through `site/assets-v2.js`.

The project-specific hardware fallback drawings, breadboard renderer, routing engine, GUI Maker, and other interface graphics remain part of this repository.
