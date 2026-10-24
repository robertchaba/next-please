# Cabinet shadow, ceiling lamp and desk bell

Generated for this project on 2026-10-24 with the built-in image_gen tool and the imagegen skill. The existing local cabinet-corridor.png was inspected and supplied as the edit target. Opaque output; no stock assets, third-party imagery or API/CLI fallback. Redistribution follows the project's terms; no separately acquired asset license or attribution requirement applies.

The unmodified selected output is public/assets/art/cabinet-shadow-source.png (1675 × 939). scripts/prepare-corridor-art.mjs resizes it with nearest-neighbor to 570 × 320, retains both upper rooms, and crops the bell at (91,203), 44 × 40, onto the original left desk at (127,170). Original desktop surfaces and wooden dividers are retained. Runtime output is public/assets/art/cabinet-corridor.png; historical corridor sources remain archived. New compact stamp sources and prompts are recorded in art-generation-2026-10-24.md.

Exact edit prompt:

```text
Use case: precise-object-edit.
Asset type: original pixel-art game environment; Image 1 is the EDIT TARGET (570x320 game background). Keep its exact four-quadrant composition and pixel artwork. Output same wide 57:32 aspect, ideally 1710x960 (3x scale).
Change only these three things:
1) TOP LEFT rectangle logical x0..203 y0..127: replace the visible deep corridor, doorway, tiled wall and wall call-button with an almost-black charcoal/olive patient alcove. Entire upper-left area is a quiet dark background with very subtle worn plaster texture, darkest on the left and at the top; gentle muted ambient light only near bottom right. No visible door, corridor, lamps, switches, people or furniture. It must feel part of this old analog clinic, not a featureless black void. Tiny blank brass room plaque near logical x171 y15.
2) TOP RIGHT: remove the light fixture that hangs underneath the shelf at logical x454..531 y54..68, restoring the wall texture there. Retain shelf and blank chart and pressure apparatus in original positions. Add a proper olive enamel PENDANT LIGHT suspended by a short cord from the CEILING centered at logical x371, with domed shade at y20..35, width about 45 pixels. It is located in the EMPTY SPACE between the eye chart (ending x320) and the wall clock space (center x422), far LEFT of the shelf (x450+). Warm cream underside, hard pixel highlights, period institutional fixture. It must not overlap the pressure cuff apparatus below y58 or any shelf. This is a ceiling lamp, explicitly NOT under the shelf.
3) BOTTOM LEFT desk: add one beautiful small traditional brass SERVICE BELL on a dark round base, perspective seen from slightly above, centered logical x148 y187, about 38px wide by 26px tall. It sits on the olive desk blotter on the left desktop, above the eventual book, entirely in logical x128..169 y172..203. Warm aged brass dome, tiny round plunger, dark base and contact shadow. No wall button.
Preserve ALL remaining lower desk surfaces, tray, right desk, wooden dividers at x204..209 and y128..137, chart, pressure apparatus and shelf exactly. No text, letters, digits, arrows, labels, icons, people, extra objects or country identifiers. Keep hard pixel clusters, subtle textures, dark olive/sepia/charcoal palette and existing illumination. Do not add a clock or plant: those are separate runtime sprites. Opaque output.
```

