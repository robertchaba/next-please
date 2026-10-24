# Cabinet shadow, ceiling lamp and desk bell

Generated for this project on 2026-10-24 with the built-in image_gen tool and the imagegen skill. The existing local cabinet-corridor.png was inspected and supplied as the edit target. Opaque output; no stock assets, third-party imagery or API/CLI fallback. Redistribution follows the project's terms; no separately acquired asset license or attribution requirement applies.

The unmodified selected output is public/assets/art/cabinet-shadow-source.png (1675 × 939). scripts/prepare-corridor-art.mjs resizes it with nearest-neighbor to 570 × 320, retains both upper rooms, and retains the original lower desktop. The original bell crop at (91,203), 44 × 40, included an opaque green blotter rectangle; the transparent correction below replaces that crop at its current position (150,145). Original desktop surfaces and wooden dividers are retained. Runtime output is public/assets/art/cabinet-corridor.png; historical corridor sources remain archived. New compact stamp sources and prompts are recorded in art-generation-2026-10-24.md.

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


## Transparent bell correction

On 2026-10-24 the built-in `image_gen` tool extracted the bell onto true transparency. Its edit reference was the original (91,203), 44 × 40 crop, enlarged 10× with nearest-neighbor sampling for inspection. Retained output: `public/assets/art/bell-transparent-source.png`; prepared local sprite: `public/assets/art/sprites/bell.png` (44 × 40 RGBA). The preparation script resizes the complete canvas with nearest-neighbor sampling, retains its alpha, and composites it at (150,145). No green background travels with the sprite; the wood and blotter remain visible around its circular foot. The semantic target stays 44 × 40, and the separate keyboard focus indicator is unchanged. This is an edit of original project artwork, with no acquired asset or separate third-party attribution requirement.

Exact extraction prompt:

```text
Use case: background-extraction. Edit target: the provided cropped pixel-art brass clinic service bell. Remove ONLY the olive-green rectangular desktop background and all green texture around the bell, replacing it with true transparency (alpha). Preserve the exact bell design, plunger, dome, black circular foot, perspective, light direction, warm muted brass/charcoal colors, and hard square pixel clusters. Preserve only a small subtle semi-transparent dark contact shadow immediately beneath the circular base; no green rectangle, floor, paper, or scenery. Keep all bell pixels and full silhouette inside the frame. Do not redesign, smooth, sharpen, add detail or add text. Center with a small transparent margin. This is a tiny original 2D pixel-art game sprite, shown at 44x40 logical pixels in-game, so preserve its low-resolution chunky pixel character. Transparent PNG output.
```
