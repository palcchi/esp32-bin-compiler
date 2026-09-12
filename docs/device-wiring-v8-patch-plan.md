# Device Wiring V8 — Final Per-File Patch Plan

## Goal
Make the Device Composer understandable on phone, iPad, and desktop without depending on fixed HTML positions. The breadboard renderer owns component placement, pin anchors, shared power rails, and signal routing.

The beginner should be able to see immediately:
1. where a component is placed,
2. where each functional pin is physically located,
3. which breadboard hole the pin lands on,
4. which ESP32 GPIO is connected to it.

## `site/device-wiring-v7.js`
The import path is intentionally kept stable, but the implementation is the V8 auto-layout engine.

### Pin Map
- Replace SVG text labels with responsive HTML/CSS rows.
- Render all 38 DevKit V1 positions.
- Each row contains the pin name, common secondary function, and current project use.
- Used pins inherit the device color.
- Tap a pin to update the detail card below the board.
- The central board remains visual only; text is no longer positioned inside an SVG coordinate system.

### Breadboard auto-layout
- Divide projects into zones of up to 8 parts.
- Automatically split parts between two breadboard rows.
- `BOARD_MOUNT` parts are placed directly on the breadboard.
- Larger modules are positioned above/below the breadboard, but their pin header anchors snap to breadboard hole coordinates.
- Calculate required breadboard columns from pin count instead of squeezing components into a fixed width.
- If more parts are added, create another vertical breadboard zone rather than shrinking the first one.

### Pin anchors
- `partPins(component)` creates the logical pin model.
- `renderPart()` renders visible pin circles and returns exact SVG endpoints.
- Every pin endpoint is aligned to a generated breadboard hole position.
- Pin labels live on the component, never on top of jumper wires.

### Power routing
- Create 3V3, 5V/external 5V, and GND rails once.
- A component connects to the nearest matching top/bottom rail with a short drop.
- Do not draw repeated long VCC/GND traces across the board.
- External 5V devices retain a common GND with the ESP32.

### Signal routing
- Route signal wires with 90-degree bends only.
- Decide top or bottom routing lane based on the physical destination position.
- Allocate an independent horizontal lane for every signal in the zone.
- Allocate a separate left-side escape lane from ESP32 pins.
- Do not intentionally share exact signal segments.
- Use a white underlay so an unavoidable crossing is still readable.

### Guided wiring
- `Show me how` highlights exactly one connection.
- Tapping a device highlights only that device and its wires.
- Wiring List remains grouped by shared rails, then by device.

## `site/device-wiring-v7.css`
The import path remains stable; styles now target the V8 renderer.

### Global device responsive corrections
- Enforce `min-width: 0` on grid/flex children.
- Keep Device Composer inside the viewport on mobile, tablet and desktop.
- Toolbar actions wrap to a two-column grid on mobile.
- Main composer tabs can scroll instead of clipping.
- Beginner steps become a horizontal scroller on tablet/mobile rather than forcing oversized fixed columns.

### Pin Map fixes
- Pin rows are HTML/CSS, eliminating Safari SVG text clipping bugs.
- Use a three-column layout: left pins / board / right pins.
- Reduce typography progressively for phone widths while preserving all 38 rows.
- Hide long project-use sublabels only on very narrow phones, while tap detail remains available.

### Breadboard workspace
- Keep the canvas horizontally pannable if the circuit is wider than the viewport.
- Never scale the circuit below readable pin size just to fit a phone.
- Preserve Apple-style white/gray page chrome around a technical, flatter wiring canvas.

## `site/device.html`
No structural rewrite is required for this patch.

Existing V7 IDs are intentionally preserved as compatibility hooks:
- `#pinMapCanvas`
- `#pinDetailV7`
- `#usedPinSummaryV7`
- `#breadboardCanvasV7`
- `#breadboardLegendV7`
- `#wiringList`

The renderer owns their internal layout, so the wiring geometry no longer depends on page HTML position.

## `site/device.js`
No rewrite.

Still owns:
- component library,
- project state,
- GPIO selection,
- presets,
- automation rules,
- firmware generation,
- BIN builds.

The wiring engine only reads `vallian-device-composer-v1` and reacts to component/pin changes.

## `site/sticky-actions.js`
No additional change required in this pass.

Device Wiring continues to expose:
- Pin Map
- Breadboard
- Build BIN

## Validation matrix

### Phone
- No page-wide horizontal overflow.
- Pin Map text does not overlap the central ESP32 board.
- 38-pin list remains tappable.
- Breadboard may pan horizontally instead of shrinking to illegibility.
- Sticky bars do not cover the wiring controls.

### iPad
- Beginner steps do not force the shell wider than the viewport.
- Pin Map uses wider text columns automatically.
- Breadboard retains readable part/pin labels.

### Desktop
- Device Composer max width is constrained.
- Wiring canvas fills available space without stretching SVG text.
- Additional components grow the board or create another zone.

### Routing
- Board-mounted parts visibly sit on breadboard hole coordinates.
- External module headers still snap to breadboard holes.
- Signal wires can use top or bottom lanes.
- Signal lanes do not intentionally share exact paths.
- Power/GND use shared rails and short drops.
- Device focus and guided-step focus still work.
