# Generated stationery and desk joinery — 2026-10-25

This is the initial generation record. The [composition revision](art-workstation-2026-10-25-polish.md) moves and resizes the rack to 60 × 65, removes its visible captions and integrates both desk fronts into the background. The original sources and exact prompts below remain archived.

These three original raster assets were generated with the built-in OpenAI `image_gen` tool, using the `imagegen` skill. Each asset used its own generation call. No CLI/API fallback, stock imagery, extracted game assets, or code-drawn substitute was used. The existing local `title-clinic.png` and `cabinet-corridor.png` were inspected as visual references before prompting; the new work follows their muted analog clinic palette and worn material detail. No text is embedded in the images. Labels and document content remain separately rendered and localized by the game.

The images are original generated assets created specifically for this project. They have no separate acquired third-party asset license or attribution requirement; their use and redistribution follow the applicable OpenAI terms for generated outputs. The retained source images and exact prompts below document their origin, rather than attributing them to an unrelated stock-image license.

## Files and preparation

| Asset | Retained source | Source dimensions | Runtime sprite | Runtime dimensions |
| --- | --- | --- | --- | --- |
| Four-tier rack | `public/assets/art/workstation-rack-source.png` | 1205 × 1305 | `public/assets/art/sprites/workstation-rack.png` | 85 × 92 |
| Integrated desk front | `public/assets/art/workstation-edge-source.png` | 1536 × 1024 | `public/assets/art/sprites/workstation-edge.png` | 360 × 24 |
| Blank writing sheet | `public/assets/art/workstation-paper-source.png` | 1432 × 1098 | `public/assets/art/sprites/workstation-paper.png` | 188 × 144 |

All three calls requested true transparency. Generated alpha is retained in the source and runtime files. The rack has exactly four slots, with cream paper in the upper two and empty lower slots reserved for future forms. Its label tabs are blank. The desk front combines the left drawer and right waste-paper recess in a shallow wooden strip intended for `(210,296)`. The rack is intended for `(58,145)`. The paper keeps its center quiet and substantially cleaner than the previous aged form texture.

Preparation uses [`scripts/prepare-stationery-art.mjs`](../scripts/prepare-stationery-art.mjs). It identifies each source's nonempty alpha bounds, ignoring alpha values at or below 8 only for locating the crop. It then crops and performs nearest-neighbor resizing. It does not repaint, recolor, synthesize details, or modify alpha within the crop. Sharp is an offline tool, not a runtime dependency.

```sh
node scripts/prepare-stationery-art.mjs /absolute/path/to/node_modules/sharp
```

The selected crops (left, top, width, height) are rack `84,73,1039,1167`; desk front `7,444,1521,150`; paper `49,52,1345,1000`. The desk front is resized to the integration footprint of 360 × 24. The sprites were inspected at native resolution after preparation; four compartments, drawer hardware, the dark waste opening and a clear blank page remain legible.

## Exact rack prompt

```text
Use case: stylized-concept
Asset type: original transparent pixel-art game sprite for Next, Please!, an analog occupational-medicine clinic. New artwork, not a photo and not a vector icon.
Primary request: a small four-tier desktop paper organizer rack, viewed almost from the front with a slight downward view onto its shallow shelves. Exactly FOUR stacked horizontal trays/slots for four paper types. The upper TWO slots each contain a modest, clearly visible stack of blank warm cream paper. The lower TWO slots are visibly EMPTY dark recesses. Each tray has a tiny blank brass or cream label tab on its front, with no lettering.
Composition: one isolated complete rack, no surrounding room or desktop, fully transparent background. Upright roughly 85:92 aspect ratio silhouette. Broad front-facing shelves with slight depth visible at top, not isometric. Complete object including small feet and restrained contact shadow fits in frame. Final sprite will be 85 by 92 native game pixels, so use deliberate readable pixel clusters and distinct four openings.
Style/medium: rich textured low-resolution pixel art matching the displayed clinic references: worn dark walnut and olive-painted metal, chipped edges, subtle wood grain, hard square pixel edges, sparse ordered dithering. The existing clinic has amber-brown varnished wood desks, charcoal shadows and muted olive furnishings. This is a physical everyday object with convincing depth and material, not flat pictogram geometry.
Lighting: quiet warm illumination from upper left, deep olive-brown shelf interiors.
Constraints: exactly four compartments, exactly two paper stacks in top two, bottom two empty. No text, numbers, logos, symbols, people, documents outside rack, surrounding background, pale outline, glossy 3D, blur or antialiasing. Preserve actual transparent alpha.
```

## Exact desk-front prompt

```text
Use case: stylized-concept
Asset type: original transparent pixel-art horizontal desk-front joinery strip for a 570 by 320 analog clinic game.
Primary request: the extremely wide and shallow BOTTOM EDGE of an aged walnut office desk. This is only a narrow horizontal front fascia, not an entire desk or room. Integrated into its LEFT third is one closed pull-out filing drawer with a warm brass label holder and an ordinary dark brass pull handle. At its RIGHT end is an integrated recessed waste-paper bin/opening, visible from slightly above: a recognizable rim, a deep dark cavity, and just one or two small pieces of crumpled cream paper inside. The bin belongs to the desk edge, not a separate floating wastebasket.
Composition: the complete strip silhouette is exactly about 360:24, fifteen times wider than tall. Render it as a VERY WIDE SHALLOW STRIP across the middle of the image with transparent empty area outside the strip if necessary. Left drawer occupies x12 to122 out of360; right waste opening occupies x268 to336; the middle is quiet thin empty wood. Straight horizontal top and bottom edges, front-on perspective with only a slim upper bevel. The right opening must fit within this shallow fascia. No legs, floor, room, tabletop objects or broad desktop surface. Final asset is 360 by24 native game pixels, composited along the very bottom of an existing wooden desk.
Style/medium: detailed textured low-resolution pixel art, hard square pixels and sparse dithering. Match the displayed cabinet's aged dark amber walnut, dark olive shadows, warm worn wood grain and subtle scratched varnish. Existing reference desk is the lower half of the cabinet image. Material-rich physical wood, not flat code-drawn icons.
Lighting: dim warm overhead/upper-left clinic light, modest highlights on worn brass and drawer edges.
Constraints: actual transparent background outside the single rectangular fascia asset; inside the fascia opaque wood and recesses. Drawer left, integrated waste opening right. No labels or text, no letters, numbers, logos, people, modern design, glossy 3D, vector outlines, antialiasing, blur or extra objects.
```

## Exact blank-paper prompt

```text
Use case: stylized-concept
Asset type: original transparent pixel-art blank paper sprite for a bureaucratic clinic game, to hold separately rendered text.
Primary request: a single clean blank warm cream sheet of writing paper, landscape orientation, seen directly from above. It should feel like ordinary analog medical-office stationery: a very subtle fine fiber texture, restrained variation in cream color, and slightly worn imperfect edges. This is MUCH CLEANER and more uniform than a heavily stained parchment form. Broad center must be very quiet and bright enough for small dark pixel lettering.
Composition: one flat complete sheet at an exact 188:144 landscape aspect ratio, centered, edge-on to canvas axes without rotation, minimal thin warm-brown edge shading and very subtle tiny lower-right contact shadow. Fully transparent outside the paper. Final sprite will be 188 by144 native pixels. Sheet fills nearly the whole frame.
Style/medium: authentic subtle textured pixel art matching the muted olive, charcoal, cream and aged wood clinic references. Deliberate square pixels, a small original warm cream palette and sparse stippling only near the edges, hard clean silhouette.
Constraints: entirely blank: no text, numbers, handwriting, rules, stamp, letterhead, ornament, border frame, folded corner, paperclip, holes, tears, stains or objects. No heavy dark dirt, parchment scroll, gradients, blur, glossy rendering or antialiasing. Preserve actual transparent alpha outside the sheet.
```

