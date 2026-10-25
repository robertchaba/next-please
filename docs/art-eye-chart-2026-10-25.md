# Fully illustrated eye chart — 2026-10-25

The user requested replacing the eye chart with a complete generated illustration, including its letters. The built-in OpenAI `image_gen` tool and the `imagegen` skill produced one localized edit; no CLI/API fallback was used.

- Retained edit target: `public/assets/art/cabinet-eye-chart-reference.png`, 570 × 320, the approved cabinet before this change.
- Retained generated source: `public/assets/art/cabinet-eye-chart-source.png`, 1676 × 939, opaque PNG.
- Runtime asset: `public/assets/art/cabinet-workstation.png`, 570 × 320.
- Preparation: [prepare-workstation-polish.mjs](../scripts/prepare-workstation-polish.mjs).
- Preview: [cabinet in the game](eye-chart-screen.png).

The paper, top and bottom hanging rails, shadow and six decreasing rows of optotypes are all generated artwork. The sequence is E / F P / T O Z / L P E D / P E C F D / E D F C Z P. It is shared by Polish and English and recorded in both dictionaries in `src/i18n.ts`. These language-independent test letters are an intentional exception to separately drawn text. `src/scenes/shift.ts` no longer overlays the interface font on the chart.

The original semantic examination target at (249,16), 73 × 60, retains its localized name and keyboard behavior. The chart is part of the room background, so it follows the existing lamp dimming and is occluded naturally by paperwork. Gameplay, persistence and examination results are unchanged.

## Reproducible preparation

```sh
node scripts/prepare-workstation-polish.mjs /absolute/path/to/node_modules/sharp
```

The script first resizes the full generated source to 570 × 320 with nearest-neighbor sampling, then extracts (244,15), 77 × 62, covering the complete chart and its immediate shadow. It composites that rectangle alongside the established scale and fascia edits over `cabinet-corridor.png`. All runtime background pixels outside the chart rectangle remain identical to the retained reference. No lettering is repainted or synthesized during preparation or rendering. Sharp is an offline preparation tool, not a runtime dependency.

This is original project-generated artwork, with no acquired stock image or separate third-party asset license. Use and redistribution follow the applicable OpenAI terms for generated outputs. The approved clinic was inspected before editing. No location or other game-world facts are introduced.

## Verification

`npm run build`, 68 focused Vitest checks (game, desk, font and patient speech), and 12 Playwright checks (shift and patient) passed. The native scene was inspected at 2×. A browser check confirmed identical chart pixels in PL/EN, the aligned examination control, lamp dimming, and no runtime errors. A pixel comparison found no background changes outside the 77 × 62 chart rectangle.

## Exact generation prompt

Transparency requested: false. The reference path supplied to the tool was `public/assets/art/cabinet-workstation.png`, now archived as `cabinet-eye-chart-reference.png`.

```text
Use case: precise-object-edit
Asset type: original pixel-art clinic game background, logical canvas 570 × 320.
Input image: the existing cabinet-workstation.png is the edit target and exact composition/style reference.
Primary request: replace ONLY the blank wall-mounted eye examination chart in the upper-left part of the RIGHT room with a fully illustrated, finished eye chart, including its printed optotype letters. The chart currently occupies approximately x246–320, y16–76 on the 570 × 320 logical canvas. Keep its exact position, outer size, rectangular slightly wider-than-tall shape, slender dark aged top and bottom hanging rails, paper edges and cast shadow. Do not enlarge or move it.
Paper and printing: subdued yellowed beige, slightly weathered matte paper with faint age spots, matching the existing dim warm olive/ochre plaster and ordinary analog clinic. Clean, recognizable near-black charcoal block capitals printed into the paper, with subtle ink wear. The letters belong to the illustration, not a UI overlay. Six centered rows with progressively smaller letter size and generous spacing; preserve large blank side margins. The largest E should be only about 11 logical pixels high, so all six rows fit comfortably within the 53-pixel paper height.
Text (verbatim, each line is a separate row):
E
F P
T O Z
L P E D
P E C F D
E D F C Z P
Composition: keep the full original 570 × 320 scene composition and aspect ratio. The entire complete chart, including the frame and paper, should be rendered naturally together. Nothing else in the scene changes: walls, tiles, pendant lamp, pressure apparatus, scale, shelf, desk surfaces, bell, tray, dark patient alcove and wood dividers are invariant.
Style: match the reference's crisp low-resolution pixel clusters and restrained material textures. No smooth vector lettering, no glossy surfaces, no blur, no UI font, no extra graphics.
Avoid: captions, chart title, acuity scores, digits, country names, brands, red or green lines, new objects, people, watermarks. Opaque output.
```

