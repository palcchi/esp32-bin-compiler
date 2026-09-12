# Device Wiring V7 — Final Patch Plan

## Goal
Rebuild the Device Composer wiring experience around a physical breadboard model instead of a generic schematic. The beginner should be able to answer three questions immediately:

1. Which ESP32 pin is used?
2. Where is the matching pin on the component?
3. Which breadboard rail/hole path should be followed?

The renderer must never depend on HTML position for circuit routing.

## `site/device.html`

### Changes
- Replace the old wiring modes with exactly three beginner-facing tabs:
  - Pin Map
  - Breadboard
  - Wiring List
- Remove the standalone Schematic tab from the main beginner flow.
- Load `device-wiring-v7.css` and `device-wiring-v7.js`.
- Add `#pinDetailV7` below the detailed Pin Map.
- Add `#breadboardCanvasV7` as the physical wiring workspace.
- Add `#breadboardLegendV7` for per-device trace focus.
- Keep the existing hidden compatibility DOM required by `device.js`.
- Keep build, logic, simulation, and project state unchanged.

### Expected behavior
- Wiring state remains driven by `vallian-device-composer-v1`.
- Switching tabs never rebuilds the whole page shell.
- Mobile canvas is pannable instead of being shrunk until labels become unreadable.

## `site/device-wiring-v7.js`

### Architecture
This file is the only visual wiring renderer.

### Main functions
- `renderPinMap()`
  - Render all 38 ESP32 DevKit V1 pins.
  - Show secondary function labels.
  - Highlight used pins with the matching device color.
  - Tap a pin to populate `#pinDetailV7`.
- `renderBreadboard()`
  - Render ESP32, breadboard, rails, parts, pin headers, and jumper wires.
  - Board-mount suitable components are placed directly on the breadboard.
  - Larger modules are placed next to the breadboard with their connector pins facing it.
  - VCC/GND use shared rails instead of repeated long wires.
  - Signal wires use independent orthogonal routing lanes.
- `renderPart()`
  - Render the part body and visible functional pin anchors.
  - Return exact SVG coordinates for each logical pin.
- `renderList()`
  - Group steps into Power Rails and per-device sections.
  - Keep step colors consistent with the breadboard trace colors.
- `steps()`
  - Build the beginner sequence: create rails first, then connect each part.
- `wire()`
  - Draw a white separation underlay plus the actual colored trace.
  - Highlight only the active guided step when `Show me how` is running.

### Electrical simplifications
- Push Button uses SIG + GND rather than a fake VCC wire.
- LED uses signal + ground and visually includes a resistor cue.
- Servo / motor class devices use an external 5V rail and shared ground.
- Power/GND rails are created once and reused.
- Physical module pin order is shown as a learning aid, but users are warned to follow labels printed on their actual module because clone boards can differ.

### Routing rules
- No two signal wires may intentionally occupy the exact same lane.
- Power and ground may share their respective breadboard rails.
- Signal traces use 90-degree bends only.
- Text labels are not placed on top of traces.
- Device labels live on the part; GPIO labels live at the ESP32/pin map.
- Guided mode dims unrelated traces instead of adding more labels.

## `site/device-wiring-v7.css`

### Changes
- Create a single responsive wiring layout system.
- Make Pin Map and Breadboard SVGs horizontally pannable on mobile.
- Keep a minimum SVG width so pin text stays readable.
- Style trace focus chips, pin details, and grouped wiring steps.
- Keep the existing Apple-like white/gray UI around the technical wiring canvas.
- Do not use heavy glass effects inside the wiring diagram itself.

### Mobile rules
- Wiring tabs remain three equal-width buttons.
- Canvas scrolls horizontally when required.
- No fixed-width child may overflow the page shell.
- `Show me how` controls become a three-column row.

## `site/sticky-actions.js`

### Changes
- Device/Wiring sticky shortcut becomes:
  - Pin map
  - Breadboard
  - Build BIN
- Remove the old Schematic shortcut.
- Keep all other page sticky actions unchanged.

## `site/device.js`

### No structural rewrite
This file remains the source of truth for:
- component library
- project state
- GPIO selection
- preset loading
- automation rules
- generated firmware
- BIN build requests

V7 reads its state from localStorage and does not duplicate firmware logic.

## Validation checklist

### 4-device starter preset
- OLED pins visible.
- Button placed on breadboard.
- Buzzer placed on breadboard.
- Servo placed beside breadboard.
- 3V3 / 5V / GND rails are visually distinct.
- No repeated long VCC/GND lines.
- Signal routes use separate lanes.

### Mobile
- No text clipped by the page edge.
- Diagram may pan horizontally instead of shrinking below readability.
- Sticky action bar does not cover the active wiring controls.

### Pin Map
- All 38 pin positions visible.
- Used pins highlighted.
- Tap detail works.
- Input-only / boot-sensitive pins remain visible through the existing project warnings.

### Wiring List
- Shared rail setup appears before device wiring.
- Each device has its own section.
- Tapping a step keeps the same project state and updates the guide.
