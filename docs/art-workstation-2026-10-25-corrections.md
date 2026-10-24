# Workstation corrections — 2026-10-25

This revision follows [the previous composition pass](art-workstation-2026-10-25-polish.md) and addresses the telephone's brightness and orientation, the rack height, and the stray line beneath the scale. The current scene is [workstation-screen.png](workstation-screen.png).

## Telephone

The built-in `image_gen.imagegen` tool and `imagegen` skill edited the pale sage telephone into a darker desaturated olive-gray molded-plastic phone. Its perspective now shows the left side of the body, with the dial facing toward the lower right and the short cord on the left. The existing (216,113), 73 × 51 runtime footprint and semantic control remain unchanged.

- New retained source: `public/assets/art/workstation-phone-olive-source.png`, 1500 × 1049.
- Runtime sprite: `public/assets/art/sprites/workstation-phone.png`, 73 × 51.
- Earlier pale source retained: `public/assets/art/workstation-phone-sage-source.png`.
- Edit target: the pale source. Supporting style and lighting reference: the cabinet background before this correction.
- True transparent background requested and preserved. No recoloring, painting, or runtime rotation is applied by code.

`scripts/prepare-workstation-sprites.mjs` selects the new source, identifies its alpha bounds above 8, crops (54,99), 1356 × 912, and fits that crop inside 73 × 51 with nearest-neighbor sampling and transparent padding. The alpha threshold affects bounds only; retained source pixels keep their original alpha.

## Rack, stamp spacing and scale join

The same generated four-tier rack moves from (504,140) to (504,112), retaining its 60 × 65 size. The follow-up spacing adjustment raises it six pixels from the first corrected position at y118. Its top now projects 16 logical pixels above the desk border at y128, while its feet remain on the desktop. All four semantic slot rectangles move with it: y114, y134, y148, and y162. The first two still supply blank paper and certificates; the others remain disabled. Pickup positions follow these shared rectangles.

The two 36 × 36 stamp rests and their initial positions now sit at (520,190) and (520,246). Their vertical gap grows from 7 to 20 pixels, and the lower stamp ends at y282, leaving 14 pixels above the desk front at y296. The rack ends at y177, leaving 13 pixels above the first stamp. Existing artwork and semantic controls use the same positions.

The previous scale crop imported a short piece of generated desk trim two pixels above the approved trim. `scripts/prepare-workstation-polish.mjs` now imports the main scale region at (399,61), 48 × 64, plus only the last dark row of the platform at (410,125), 26 × 1. The surrounding row125 and rows126–127 retain the original `cabinet-corridor.png` pixels. This removes the stray line without repainting the background or removing the scale's base. Exactly 118 pixels change compared with the previous workstation background. Lower desk-front crops remain unchanged.

## Preparation and provenance

Prepared with cached Sharp 0.35.5 as an offline tool; no project dependency was added:

```sh
node scripts/prepare-workstation-sprites.mjs /absolute/path/to/node_modules/sharp
node scripts/prepare-workstation-polish.mjs /absolute/path/to/node_modules/sharp
```

The telephone is original project artwork generated at Robert Chaba's request on 2026-10-25 using the built-in image generator; no CLI/API fallback or third-party asset was used. It follows the same redistribution terms as the existing original project artwork. The repository declares no open-source license; this record grants no separate public license. Preserve [Robert Chaba's creator credit](https://github.com/robertchaba).

## Exact telephone edit prompt

Inputs in order: `public/assets/art/workstation-phone-sage-source.png` as edit target; the pre-correction `public/assets/art/cabinet-workstation.png` as style and lighting reference. The reference background can be reproduced from the previous preparation recipe in the linked composition record. `transparent_background: true`.

```text
Use case: precise-object-edit.
Asset type: one transparent pixel-art rotary desk telephone sprite for the original game Next, Please!, intended runtime footprint 73 by 51 pixels.
Input image 1 is the EDIT TARGET: current pale sage telephone. Input image 2 is a supporting STYLE AND LIGHTING reference: the dark clinic cabinet background.
Primary request: redesign only the telephone color and horizontal orientation so it belongs naturally in the dim olive-and-walnut clinic. Keep the recognizable broad curved handset, molded-plastic wedge body, rotary dial, compact coiled cord, low seated doctor's viewing angle, and complete isolated silhouette.
Color correction: make the plastic substantially DARKER, a desaturated deep olive-gray green with charcoal green shadows and only small muted warm overhead highlights. Main plastic midtones near #454b38, shadow #202b24, restrained highlights near #72725a. The dial is aged dark buff/gray, not bright cream or white. No pale mint, no light sage, no bright specular outline, no shiny sheen. Preserve readable receiver and dial details at 73x51.
Orientation correction: reverse the current yaw, facing toward the RIGHT rather than left. Show the LEFT sidewall of the body in perspective, with the rotary dial/front plane aimed diagonally toward the lower RIGHT. In the image, the front lower-right corner is nearest the viewer; the bottom front edge slopes UPWARD as it runs from left to right. The short coiled cord now hugs the LEFT side. This is a horizontally opposite perspective to image 1, not merely a flat rotation.
Style: match image 2's restrained moody hard-edged textured low-resolution pixel-art clusters, sparse material wear and subdued contrast. Keep molded plastic, not rusty metal. No new objects, no stand or background shadow plane. No text, readable numerals, logo, brand, location or watermark.
Output: exactly ONE complete isolated telephone on genuine transparent alpha, including all openings beneath the receiver. Small transparent margins. Wider than tall, fit entire phone and short cord, no clipping. Do not include the reference room.
```

