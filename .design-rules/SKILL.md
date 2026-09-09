# Vallian Adaptive Design Skill

Source inspiration: `dickwu/apple-design-skill`, based on Apple Human Interface Guidelines. This document adapts those principles to the ESP32 BIN Compiler web/PWA interface.

## Product context

This interface is a creative and developer utility used on mobile, tablet, and desktop browsers. It contains project management, OLED editing, lyrics animation, image and video conversion, pixel drawing, code compilation, build history, hardware profiles, presets, and OTA access.

The design should feel like a polished platform utility, not a themed game interface. Vallian yellow is the brand accent. OLED previews remain hardware-like and can use a dark physical-device presentation regardless of the surrounding app appearance.

## 1. Accessibility

- Body text should normally be around 16 to 17px on mobile and at least 13px on desktop.
- Avoid thin font weights for small text. Prefer regular, medium, semibold, and bold.
- Keep common mobile tap targets around 44x44px or larger where practical.
- Maintain strong foreground/background contrast. Small text should target WCAG 4.5:1 or better.
- Never rely on yellow, green, red, or another color as the only state indicator. Pair color with text, shape, or another cue.
- Every interactive control needs an understandable accessible name.
- Keyboard focus must be visible.
- Avoid time-limited UI for essential tasks.
- Respect reduced-motion preferences and avoid unnecessary glitch, flashing, scale, or looping effects.

## 2. Typography

Use the platform system stack:

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif;
```

Use a small number of consistent text roles:

- Large page title: high emphasis, compact leading, semibold/bold.
- Section title: clearly below page title.
- Body: regular weight and comfortable line height.
- Secondary/meta: lower contrast but still legible.
- Monospace: only for source code, firmware values, timing, and technical data.

Prefer sentence case for normal actions and headings. Uppercase may remain for very short technical eyebrow labels or deliberate brand moments, not as the default language of the whole interface.

## 3. Color and appearance

Use semantic tokens instead of page-specific hardcoded surface colors.

Required roles:

- app background
- primary surface
- secondary/grouped surface
- separator/border
- primary text
- secondary text
- accent
- success
- warning
- destructive

Support both light and dark system appearance. Also account for increased contrast. Vallian yellow is primarily for primary actions, active states, focus, and small brand moments. Do not use it indiscriminately on noninteractive text.

## 4. Layout

- Group related controls visually and spatially.
- Give primary content more room than secondary metadata.
- Align repeated components to a consistent grid.
- Avoid dense walls of equally weighted cards and controls.
- Responsive layouts should remain recognizable as the viewport changes.
- Stack columns only when the full layout no longer fits comfortably.
- Respect safe areas on mobile using `env(safe-area-inset-top/right/bottom/left)`.
- Allow text to wrap and grow without overlapping nearby controls.

## 5. Navigation

### Mobile

Primary destinations must remain visible and reachable near the bottom of the viewport. Current primary destinations are:

- Home
- Editor
- Projects
- Builds
- Devices

Secondary tools remain available through the page-level tool navigation. Do not restore the old full-screen hamburger as the primary navigation.

### Desktop and tablet

Use a compact top navigation or toolbar with clear active state. Do not overload it with ornamental animation.

## 6. Controls and forms

- Use familiar browser controls unless a custom control materially improves usability.
- Inputs and selects should be large enough to use comfortably on touch devices.
- Labels belong next to their controls and must remain readable at larger text sizes.
- Primary actions use the accent fill.
- Secondary actions use neutral grouped surfaces.
- Destructive actions must be visually and textually distinct.
- Disabled state must remain understandable without disappearing entirely.
- Loading, success, error, and empty states need explicit text feedback.

## 7. Materials and depth

Blur and translucency are allowed for navigation and floating control layers when they improve separation. Content cards should prioritize legibility over glass effects.

Use shadows sparingly. Hierarchy should come primarily from spacing, typography, surfaces, and grouping.

## 8. Motion

- Keep transitions short and functional.
- Prefer fades and subtle state transitions over bouncing, glitch, or aggressive scaling.
- Motion must not delay access to core functions.
- `prefers-reduced-motion: reduce` must disable nonessential animation.

## 9. OLED-specific presentation

- Canvas output must preserve crisp pixel rendering with `image-rendering: pixelated` where needed.
- The physical OLED/device preview can remain dark and hardware-like in both appearance modes.
- Do not let decorative app chrome reduce the readability of 128x64 content.
- Technical dimensions, I2C addresses, pins, build metadata, and code can use monospace text when useful.

## 10. Review checklist

Before merging any future UI change, verify:

1. Mobile width around 320 to 440px is usable.
2. Tablet and desktop widths do not look stretched or sparse.
3. Safe areas are respected.
4. Light and dark appearances both work.
5. Text and controls remain readable with larger browser text.
6. Tap targets are comfortable.
7. Keyboard focus is visible.
8. Important states are not color-only.
9. Reduced motion is respected.
10. Existing compiler, OTA, media conversion, and project behavior still works unless intentionally changed.
