# Generated clinic artwork — 2026-10-24

The built-in `image_gen` tool produced these assets using the imagegen skill. The approved local title artwork was supplied as a style reference, not an edit target. No API/CLI fallback, stock assets, extracted game art or remote runtime resources were used. The images were generated for this project and have no separately acquired third-party asset license or attribution requirement. Redistribution follows the project's terms; do not invent a stock license for them. Source PNGs are retained alongside runtime assets in `public/assets/art/`. Transparency was requested for the sprite atlas and retained in extracted sprites. All other outputs are opaque.

Preparation uses cropping, atlas extraction and nearest-neighbor resizing only. Runtime rendering remains 570 × 320. Text is localized in code and is not generated into artwork. The clock hands and room number remain code geometry. The title image is unchanged.

## Saved assets and preparation

- Cabinet: `public/assets/art/cabinet-clinic-source.png` (1672 × 941) and `cabinet-clinic.png` (570 × 320).
- Introduction: `public/assets/art/intro-{scalpel,catheter,pen,stamp}-source.png` (1672 × 941 each) and corresponding runtime PNGs (570 × 320 each).
- Atlas: `public/assets/art/clinic-sprites-source.png` (1448 × 1086, RGBA). Its twelve extracted runtime assets are in `public/assets/art/sprites/`.
- Recipe: `scripts/prepare-clinic-art.mjs`, using offline Sharp 0.35.4. The recipe maps each environment quadrant to the existing viewport divisions, crops complete atlas subjects, ignores alpha values up to 8 only when finding visible crop bounds, preserves alpha inside those bounds, and resizes with the nearest kernel. It does not generate or repaint image content.

Prepared PNGs were inspected in the running game at native and enlarged resolution, with Polish/English text overlaid separately. The runtime downloads only the prepared images; retained source files are documentation assets.

## Exact generation prompts

### cabinet

```text
Use case: stylized-concept
Asset type: final pixel-art game environment background, 570x320 logical canvas.
Input image: style reference only, the approved original title scene. Match its atmospheric worn clinic, dark olive and charcoal shadows, yellowed light and richly textured deliberate pixel clusters. Not its composition.
Primary request: create a single original playable occupational-health consulting room background. Exact orthographic FOUR-AREA layout, width ratio 1:1. Vertical divider at 50% width, top 40% are two straight-on room views, bottom 60% are two top-down desk surfaces. Thin solid wooden joinery separates all four areas. No UI bars.
TOP LEFT: open doorway at x 20–95, quiet wall and empty space centered x170 for later patient sprite, hanging olive lamp centered x203 y20, small brass service bell on counter x256 y110. Room empty, no person. Blank tiny enamel room number plaque x103 y22, left blank for separately drawn 04. Counter edge at y120.
TOP RIGHT: faded cream plaster, olive tiled lower wall, blank eye chart paper at x308 y20 width47 height64 (no letters); EMPTY wall space x430–478 y7–54 for a separately drawn clock, EMPTY shelf x501–552 y66 for movable plant, analog pressure-cuff apparatus at x383 y78 width73 height44, examination couch at far right lower edge. No additional instruments or clock.
BOTTOM LEFT: worn dark walnut desk, empty narrow vertical paper tray x9 y163 width65 height126, empty olive blotter x82 y151 width194 height159, no papers on it.
BOTTOM RIGHT: dark worn walnut desk, entirely EMPTY for later tools and book sprites. Beautiful restrained grain and scuffs; no embedded objects.
Style: detailed cinematic crisp pixel art like reference, muted sepia, deep olive enamel, aged cream, low-key institutional lighting, no antialiasing, no flat vector look, no bright cartoon outlines. Object boundaries readable but moody.
Text: NO text, NO letters, NO numbers, NO logos. No people. No stamps, books, cups or loose papers. No dates, flags or country identifiers. Generate landscape 16:9 ideally 1710x960; designed to downsample to 570x320. Preserve exact layout proportions.
```

### scalpel

```text
Use case: stylized-concept
Asset type: full-bleed narrative illustration for a 570x320 pixel-art game introduction.
Input image: style reference only, match the approved original title scene's pixel detail, textures, low-key lighting and muted olive/charcoal/sepia palette.
Primary request: An atmospheric still-life of a single stainless steel surgical scalpel resting diagonally on a worn enamel instrument tray. No blood, no patient.
Composition: wide 16:9 frame. The object and tray/papers occupy the LEFT 40 percent, centered around x130 y150 of a 570x320 frame, readable silhouette large enough at native resolution. The RIGHT 55 percent is empty dark charcoal olive wall fading to almost black, reserved for separately rendered narration. Bottom right is also empty for one interface button. No picture frame, no inset card.
Setting: ordinary worn occupational-health clinic. Old olive enamel, dark wood and paper textures. Quiet institutional light falls onto the object from upper left. Subtle dust, hard pixel clusters and beautiful textured shading matching the reference, with no gradients or antialiasing. Rich restrained background texture, not flat geometric vector art.
Constraints: entirely original game artwork; no words, no letters, no numbers, no captions, no signage, no UI elements, no logos, no flags, no identifiable country or date, no hands, no people, no gore. 16:9 landscape, ideally 1710x960 to prepare at 570x320.
```

### catheter

```text
Use case: stylized-concept
Asset type: full-bleed narrative illustration for a 570x320 pixel-art game introduction.
Input image: style reference only, match the approved original title scene's pixel detail, textures, low-key lighting and muted olive/charcoal/sepia palette.
Primary request: An atmospheric still-life of a sealed soft translucent catheter with a coiled rubber tube and a small empty collection bag resting on a worn enamel tray. Clearly medical tubing, not an IV stand. No body or fluids.
Composition: wide 16:9 frame. The object and tray/papers occupy the LEFT 40 percent, centered around x130 y150 of a 570x320 frame, readable silhouette large enough at native resolution. The RIGHT 55 percent is empty dark charcoal olive wall fading to almost black, reserved for separately rendered narration. Bottom right is also empty for one interface button. No picture frame, no inset card.
Setting: ordinary worn occupational-health clinic. Old olive enamel, dark wood and paper textures. Quiet institutional light falls onto the object from upper left. Subtle dust, hard pixel clusters and beautiful textured shading matching the reference, with no gradients or antialiasing. Rich restrained background texture, not flat geometric vector art.
Constraints: entirely original game artwork; no words, no letters, no numbers, no captions, no signage, no UI elements, no logos, no flags, no identifiable country or date, no hands, no people, no gore. 16:9 landscape, ideally 1710x960 to prepare at 570x320.
```

### pen

```text
Use case: stylized-concept
Asset type: full-bleed narrative illustration for a 570x320 pixel-art game introduction.
Input image: style reference only, match the approved original title scene's pixel detail, textures, low-key lighting and muted olive/charcoal/sepia palette.
Primary request: An atmospheric still-life of a single dark olive fountain pen with a worn brass nib resting diagonally on a few blank yellowed paper forms.
Composition: wide 16:9 frame. The object and tray/papers occupy the LEFT 40 percent, centered around x130 y150 of a 570x320 frame, readable silhouette large enough at native resolution. The RIGHT 55 percent is empty dark charcoal olive wall fading to almost black, reserved for separately rendered narration. Bottom right is also empty for one interface button. No picture frame, no inset card.
Setting: ordinary worn occupational-health clinic. Old olive enamel, dark wood and paper textures. Quiet institutional light falls onto the object from upper left. Subtle dust, hard pixel clusters and beautiful textured shading matching the reference, with no gradients or antialiasing. Rich restrained background texture, not flat geometric vector art.
Constraints: entirely original game artwork; no words, no letters, no numbers, no captions, no signage, no UI elements, no logos, no flags, no identifiable country or date, no hands, no people, no gore. 16:9 landscape, ideally 1710x960 to prepare at 570x320.
```

### stamp

```text
Use case: stylized-concept
Asset type: full-bleed narrative illustration for a 570x320 pixel-art game introduction.
Input image: style reference only, match the approved original title scene's pixel detail, textures, low-key lighting and muted olive/charcoal/sepia palette.
Primary request: An atmospheric still-life of a substantial wooden-handled rubber stamp with a brick-red rectangular base resting on a blank yellowed paper form, a small muted red rectangular ink impression without letters.
Composition: wide 16:9 frame. The object and tray/papers occupy the LEFT 40 percent, centered around x130 y150 of a 570x320 frame, readable silhouette large enough at native resolution. The RIGHT 55 percent is empty dark charcoal olive wall fading to almost black, reserved for separately rendered narration. Bottom right is also empty for one interface button. No picture frame, no inset card.
Setting: ordinary worn occupational-health clinic. Old olive enamel, dark wood and paper textures. Quiet institutional light falls onto the object from upper left. Subtle dust, hard pixel clusters and beautiful textured shading matching the reference, with no gradients or antialiasing. Rich restrained background texture, not flat geometric vector art.
Constraints: entirely original game artwork; no words, no letters, no numbers, no captions, no signage, no UI elements, no logos, no flags, no identifiable country or date, no hands, no people, no gore. 16:9 landscape, ideally 1710x960 to prepare at 570x320.
```

### sprites

```text
Use case: stylized-concept
Asset type: transparent original pixel-art game sprite atlas, a precise 4 columns by 3 rows contact sheet, twelve isolated sprites in equal square cells. Transparent background and transparent margins around every sprite.
Input image: style reference only. Match dark olive, charcoal, yellowed cream, sepia, brick red, detailed worn textures and cinematic low-key pixel art. No flat vector or cute cartoon look.
Read LEFT TO RIGHT, TOP TO BOTTOM:
Row1 cell1: wooden handled rubber stamp, green rectangular rubber base, front slightly top-down view. Cell2: same shape stamp with brick-red base. Cell3: closed horizontal landscape olive cloth rulebook, no text, worn leather spine, tiny embossed geometric frame. Cell4: aged off-white enamel mug filled with dark tea, handle on right, slightly top-down.
Row2 cell1: a single long vertical yellow wooden pencil, pink worn eraser and graphite tip down. Cell2: small potted houseplant with long dark green leaves, terracotta pot, front view. Cell3: small portrait-oriented framed blank certificate, worn wood frame and tiny red wax seal, no writing. Cell4: single circular analog wall clock housing with cream blank dial, no hands and no numbers, front view.
Row3 cell1: waist-up middle-aged woman archivist, brown bobbed hair, brown wool jacket and muted red scarf, weary reserved face, facing directly forward, hands at desk level. Cell2: waist-up middle-aged man industrial worker, short brown hair and mustache, olive-brown work jacket and shirt, facing directly forward, hands at desk level. Cell3: waist-up older woman driver with short grey hair and glasses, muted dark teal jacket, facing directly forward, hands at desk level. Cell4: one blank rectangular yellowed paper form, straight-on flat overhead, landscape ratio about 1.3:1, subtle paper grain at edges, unmarked and light cream center for text overlay.
Every sprite entirely inside its equal cell, centered, separated by ample transparent margins. No scene background, no cast shadows beyond small contact shadow, no text, no labels, no grid lines. All patient portraits same scale, complete head and shoulders and forearms, dark readable silhouette. Crisp detailed pixel art with hard square pixel clusters, not smooth painting. Generate 4:3 image ideally 2048x1536. This is a production sprite sheet for a 570x320 game.
```

