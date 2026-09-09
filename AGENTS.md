# ESP32 BIN Compiler Repository Rules

## UI design rules

For every UI task under `site/`, read and follow `.design-rules/SKILL.md` before editing interface code.

The local rules are adapted from `dickwu/apple-design-skill` and Apple Human Interface Guidelines principles for this browser-based mobile and desktop app.

### Required behavior

- Treat accessibility as a core requirement, not final polish.
- Preserve the Vallian yellow identity as an accent, not a decorative color for every surface.
- Use semantic color tokens and support light and dark appearance.
- Use the platform system font stack and a clear, scalable hierarchy.
- Respect iPhone and iPad safe areas with `env(safe-area-inset-*)`.
- Keep common mobile controls at least about 44px tall or wide where practical.
- Primary mobile navigation must stay visible and easy to reach. Do not restore a full-screen hamburger as the primary navigation.
- Keep desktop navigation compact and familiar.
- Do not communicate important state through color alone.
- Provide visible keyboard focus states and usable labels for controls.
- Respect `prefers-reduced-motion`, `prefers-reduced-transparency`, and increased contrast preferences where applicable.
- Keep OLED preview surfaces visually distinct from application chrome. The OLED itself may remain black even when app appearance is light.
- Prefer progressive disclosure and clear grouping over dense control walls.
- Preserve existing compiler, build, OTA, project, and media behavior unless a task explicitly requests functional changes.

### Files

- Shared visual system: `site/styles.css`
- Shared adaptive navigation: `site/nav.js`
- Page-specific lyrics UI: `site/lyrics.css`
- Detailed design contract: `.design-rules/SKILL.md`
