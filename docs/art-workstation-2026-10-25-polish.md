# Workstation composition revision — 2026-10-25

This is the previous composition record. [The follow-up corrections](art-workstation-2026-10-25-corrections.md) supersede its pale telephone, rack height and scale crop. The original sources and exact prompts below remain archived.

The requested visual polish uses the built-in OpenAI `image_gen.imagegen` tool with the imagegen skill. No CLI/API fallback, third-party artwork, copied game assets, or generated-code substitute was used. The approved title and cabinet informed the palette, materials, perspective and restrained analog atmosphere. This revision changes presentation and supply pickup positions; the save format and gameplay rules stay unchanged.

## Retained sources and current runtime assets

| Asset | Retained generated source | Runtime |
| --- | --- | --- |
| Cabinet edit, first pass | `public/assets/art/cabinet-workstation-initial-source.png` (1675 × 939) | Archived intermediate; its scale was too tall for the clock |
| Cabinet edit, corrected scale | `public/assets/art/cabinet-workstation-source.png` (1675 × 939) | `public/assets/art/cabinet-workstation.png` (570 × 320) |
| Pale sage plastic telephone | `public/assets/art/workstation-phone-sage-source.png` (1500 × 1049) | `public/assets/art/sprites/workstation-phone.png` (73 × 51) |
| Tilted clip holder | Existing `public/assets/art/workstation-clips-source.png` | `public/assets/art/sprites/workstation-clips.png` (37 × 36) |
| Compact four-slot rack | Existing `public/assets/art/workstation-rack-source.png` | `public/assets/art/sprites/workstation-rack.png` (60 × 65) |

The cabinet generations are opaque; the telephone requested true transparency, retained during preparation. The original dark telephone, separate scale, original desk-front sprite and all earlier sources remain archived. The renderer now loads the scale and desk-front illustration as part of the cabinet background, without requesting their former separate sprites.

## Composition and semantic controls

- Both wooden desk fronts begin at y296 and end at y319. The left front is plain wood without a drawer, handle, basket or other object. The right retains the drawer and recessed waste opening. The original central divider remains intact.
- The new pale sage plastic rotary phone occupies (216,113), 73 × 51. Its material, curved handset and ivory dial remain clear at native resolution.
- The generated paperclip holder occupies (296,137), 37 × 36, beside the phone, with a six-degree clockwise tilt.
- The unlettered four-tier rack occupies (504,140), 60 × 65. Its two upper stocked slots supply paper and certificates; the two lower slots remain disabled. Visible captions were removed, while Polish and English accessible names remain.
- Stamp rests remain at x520, now y214 and y257. Their 36 × 36 footprints fit below the rack and above the front edge.
- The closed manual begins at (94,247), 88 × 48, close to the lower edge.
- The scale has a substantial cream dial, upright, height measure, platform and room shadow within the background. Its measurement target is (405,61), 42 × 67. It remains clear of the separately drawn clock and shares the room's lamp dimming.
- A newly taken blank or certificate appears in hand at its actual rack-slot center. Cancellation returns it to a safe main-desk location. These are temporary presentation coordinates, absent from exported saves.

The latest in-game composition, including the follow-up corrections, is [workstation-screen.png](workstation-screen.png). The native canvas remains 570 × 320 with integer coordinates and nearest-neighbor display.

## Reproducible preparation

`scripts/prepare-workstation-polish.mjs` resizes the corrected generated source to 570 × 320 with nearest-neighbor sampling, then composites only these regions over the approved `cabinet-corridor.png`:

| Source crop at 570 × 320 | Destination | Purpose |
| --- | --- | --- |
| x399, y61, 48 × 67 | x399, y61, 48 × 67 | Integrated scale and immediate wall |
| x0, y289, 204 × 31 | x0, y296, 204 × 24 | Plain left desk front |
| x210, y289, 360 × 31 | x210, y296, 360 × 24 | Matching right drawer and waste recess |

Everything outside those rectangles comes unchanged from the approved background. No scene-wide regeneration is used at runtime. `prepare-corridor-art.mjs` invokes the new preparation after reconstructing the earlier cabinet.

`scripts/prepare-workstation-sprites.mjs` selects `workstation-phone-sage-source.png`. Its alpha-bounds crop is (78,110), 1406 × 910, fitted without aspect distortion inside 73 × 51. The clip holder retains its original crop (231,407), 855 × 672; preparation fits it inside 33 × 30, then inverse-samples the six-degree rotation into 37 × 36. Each output pixel copies one source RGBA pixel. No painted background, synthetic object detail, antialiasing or runtime rotation is added.

`scripts/prepare-stationery-art.mjs` retains the original rack crop (84,73), 1039 × 1167, now resized to 60 × 65. It retains the existing paper and historical edge preparation.

Prepared with locally cached Sharp 0.35.5 as an offline tool; no dependency was added. To recreate:

```sh
node scripts/prepare-corridor-art.mjs /absolute/path/to/node_modules/sharp
node scripts/prepare-workstation-sprites.mjs /absolute/path/to/node_modules/sharp
node scripts/prepare-stationery-art.mjs /absolute/path/to/node_modules/sharp
```

## Provenance and redistribution

Created for Next, Please! at Robert Chaba's request on 2026-10-25 using the built-in image generator. These are original generated project assets, with no acquired third-party license or separate third-party attribution requirement. Their use and redistribution follow the same terms as the project's existing original generated artwork; the repository currently declares no open-source license, and this record grants no separate public license. Preserve [Robert Chaba's creator credit](https://github.com/robertchaba).

## Exact prompts and inputs

### Cabinet edit

Inputs, in order: `public/assets/art/cabinet-corridor.png` as edit target; the pre-revision `docs/workstation-screen.png` as supporting reference for the drawer and waste opening. The historical reference is retained as `docs/workstation-before-polish.png`.

```text
Use case: precise-object-edit.
Asset type: original pixel-art cabinet background for Next, Please!, native layout 570 by 320, keep the exact 57:32 wide composition.
Input image 1 is the EDIT TARGET (empty cabinet background); input image 2 is a supporting reference showing the current separate right desk-front drawer and waste recess.
Primary request: make TWO carefully localized improvements to input 1, preserving its camera, composition, textured pixel-art materials, palette and architecture.
1. Add a convincing integrated old mechanical medical weighing scale with tall height-measuring rod to the examination room, in the open wall area to the right of the pressure cuff and below/right of the clock's future space. In native 570x320 coordinates its complete visible silhouette should be around x=420..468, y=51..127. A substantial faded olive/cream enamel round analog dial, dark short ticks without lettering or numbers, upright support, height rod with horizontal measuring arm, and broad foot platform at y=121..127. It must be naturally embedded in the room, matching light, texture, perspective and contact shadow; the very bottom may be occluded by the horizontal wooden foreground partition at y=128. Do not float it or make it a tiny thin wire icon. Keep wall instruments, shelf and ceiling lamp unchanged. No clock or plant is to be added.
2. Replace ONLY the bottommost front edge of the two desks, native y=296..319, with consistent dark worn walnut wooden joinery: both sides have the same top trim line at y=296 and the same bottom edge at y=319, same material, light and depth. The LEFT side x=0..203 is one plain wooden front with absolutely no drawer, handle, hole, basket or objects. Retain the vertical divider at x=204..209. RIGHT side x=210..569 incorporates one shallow brass-handled drawer across x=222..332 and a recessed dark wastepaper opening across x=478..546. Use the SECOND IMAGE only as a reference for those right-side functions. Make the whole front as dark and subtle as the existing wooden desktop, not bright orange.
Constraints: outside those two small edited regions preserve everything, especially empty desktop surface, left green blotter, narrow paper tray, brass bell, dark empty patient alcove, four-area layout, 6px vertical divider at x=204..209 and horizontal wooden divider at y=128..137. Do not add desk accessories, labels, numerals, words, people, UI, modern equipment, logos or watermarks. Hard square pixel clusters, sparse worn texture, olive-charcoal shadows, restrained warm highlights matching original. Output full scene, not a sprite sheet. Opaque background.
```

### Scale height correction

Input: the first generated cabinet edit, retained as `public/assets/art/cabinet-workstation-initial-source.png`. A second built-in edit made the scale shorter so the separate wall clock would remain unobstructed.

```text
Use case: precise-object-edit. Input image is the edit target: a finished pixel-art clinic background. Make ONE localized correction: the mechanical weighing scale at the right of the pressure instrument is too tall. Shrink its entire physical device to about 70 percent of its present height and 85 percent of its present width, keeping its base planted at exactly the same level at the wooden horizontal partition. Move the whole device slightly to the RIGHT, by about half the old dial diameter. Its highest height-measuring horizontal arm must now be BELOW the horizontal bottom of the blank eye chart on the left, approximately at the uppermost tile row, not up near the lamp. The empty plaster area ABOVE the shorter scale is reserved for a separately composited round wall clock and MUST be completely free of any part of the scale. Its cream round weighing dial should now be at the height of the dangling pressure bulb to its left, not above the pressure instrument. Keep the same detailed mechanical scale, height rod, enamel, integrated wall shadow, and small floor platform. Redraw exposed wall naturally with existing plaster and tile grid. Everything else must stay exactly unchanged: both desks, bottom aligned wooden front with plain left panel and right drawer/waste recess, bell, paper tray, olive desk pad, blank eye chart, pressure instrument, ceiling lamp, shelf, dark patient alcove, empty wooden surfaces. No additional objects, no text, no clock, no plant. Same 570x320 logical scene composition and aspect ratio, same subdued original hard-edged pixel art, no blur.
```

### Pale sage telephone

Inputs, in order: `public/assets/art/title-clinic.png` and `public/assets/art/cabinet-corridor.png`, both style references only. `transparent_background: true`.

```text
Use case: stylized-concept.
Asset type: one original transparent pixel-art telephone sprite for Next, Please!, a 570x320 Canvas game. Input image 1 (approved clinic title) and input image 2 (cabinet) are STYLE REFERENCES only.
Primary request: replace a dark bakelite phone with an attractive pale sage-green molded PLASTIC rotary desk telephone inspired by ordinary utilitarian mid/late twentieth-century institutional design. An original unbranded design, slightly boxy rounded wedge base, broad chunky curved handset sitting left-to-right across its cradle, circular ivory rotary dial with finger holes, short dark muted green coiled cord resting beside the right base. Soft faded mint/sage green plastic with modest warm yellowed highlights and darker olive seams, gently aged rather than rusty. This should unmistakably read as pale green plastic.
Composition: entire isolated phone silhouette, slightly top-down seated doctor's desktop viewpoint, a little depth visible on its right side. Compact width-to-height about 73:51, wider than tall. Intended final runtime canvas 73 by 51 pixels, so receiver, dial, feet and material must remain clear in crisp readable pixel clusters. Detailed but restrained low-resolution pixel-art rendering matching the reference's warm wood/olive clinic atmosphere. Not a photograph, icon or smooth 3D render.
Constraints: true transparent background including spaces beneath handset; modest transparent margins; no desk, floor, background rectangle, extra objects, text, readable numbers, logo, brand, location, flag or watermark. Do not copy a particular commercial product. Generate only this single complete telephone.
```

