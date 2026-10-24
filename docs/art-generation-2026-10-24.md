# Generated clinic artwork — 2026-10-24

## Compact mechanical stamp revision

Created on 2026-10-24 with the built-in `image_gen` tool and the `imagegen` skill (`precise-object-edit`, transparent background). The original `mechanical-stamps-source.png` was the edit target; `title-clinic.png` supplied atmosphere and palette only. The selected 1774 × 887 RGBA result is retained unchanged as `public/assets/art/mechanical-stamps-compact-source.png`. It is original project artwork, with no acquired third-party asset or separate stock license. The earlier stamp source remains archived.

`scripts/prepare-stamp-art.mjs` splits the source into equal cells, finds visible subject bounds using alpha > 8, preserves the generated alpha inside those bounds, and prepares `sprites/stamp-fit.png` and `sprites/stamp-unfit.png` at 48 × 48 with nearest-neighbor sampling. It runs from the cabinet preparation recipe using the same offline Sharp argument. Both tools were inspected at their 36 × 36 resting and 48 × 48 carried sizes on a dark wooden background. The redesign uses a compact solid black press handle, olive or oxblood front inset, stout steel frame and rectangular base; fewer tiny open details keep the silhouette legible at native size.

Exact prompt:

```text
Use case: precise-object-edit
Asset type: production transparent sprite pair for an original low-resolution clinic game.
Input images: Image 1 is the existing stamp pair to redesign; image 2 is only the game's approved atmosphere/palette reference, never a background to reproduce.
Primary request: redesign these two awkward tall thin mechanical rubber stamps as handsome compact sturdy old office self-inking stamps, with a broad dark bakelite press handle, a much shorter dense steel mechanism, a few readable highlights on heavy side rails and a solid rectangular dark base. Keep mechanical rubber-stamp identity, replace ornate exposed miniature machinery with bold believable compact shape. At 36x36 pixels each should instantly read as a stamp with a substantial handle and working mechanism, not a printing press, chair, tower, stapler, or plastic toy. Short broad proportions, overall approximately square. The left stamp has a muted olive enamel handle inset; right has an oxblood enamel handle inset. Most of each press handle remains dark charcoal bakelite. Two identical matching tools except accent color.
Composition: precisely two equally scaled isolated objects side by side with generous genuine transparent margins, each centered in its half of a wide 2:1 image, no labels. Gentle three-quarter view slightly from above, front and right side visible; same view for both, feet on same baseline. Each object fills 75% of its square half.
Style: authentic crisp coarse pixel art designed at approximately 40x40 logical pixels per object and enlarged in integer pixel blocks. Deliberate large contiguous pixel clusters, dark hard outlines, limited subdued charcoal/olive/aged steel/dirty cream palette, small dull metal glints, restrained wear. No intricate noise, no tiny filigree, no smooth shading. Match reference's ordinary worn analog institution.
Constraints: genuine alpha transparency between all mechanisms and around every silhouette. No background, no ground plane, no cast floor shadow, no text, no numbers, no logos, no watermarks. Preserve two-tool composition and matching scale. Draw complete objects without clipping.
```

## Earlier corridor and mechanical stamp revision

The current cabinet uses `public/assets/art/cabinet-corridor.png` (570 × 320), prepared from the final generated `cabinet-corridor-source.png` (1675 × 939). It replaces the upper rooms with a deep empty corridor and an examination wall: neither upper area contains an extra counter, desk or couch. The lamp is on the right. The lower desk surfaces and physical dividers are cropped from the approved original `cabinet-clinic.png`; the title image is unchanged. The room number is still separately drawn and localized words are never embedded.

The earlier mechanical `sprites/stamp-fit.png` and `sprites/stamp-unfit.png` were 48 × 48 crops of `mechanical-stamps-source.png` (1774 × 887, RGBA). They depict spring-loaded self-inking metal mechanisms with olive and brick-red press handles. The introduction's `intro-stamp-mechanical-source.png` (1672 × 941) supplies the revised `intro-stamp.png` (570 × 320), using the same brick-red mechanical design and preserving the blank right side for narration. The original wooden sprites remain in the archived original atlas, and `intro-stamp-source.png` retains the original wooden illustration; their prompts below are historical.

These assets were generated with the built-in `image_gen` tool and imagegen skill, without API/CLI fallback. The cabinet was an edit of the local original, inspected before use. The stamps were a new transparent atlas. They are original project art; no acquired third-party license or attribution applies. Redistribution follows the project's terms. Generated alpha is preserved. `scripts/prepare-corridor-art.mjs` records exact crops, composites and nearest-neighbor resizing; it uses the same offline Sharp installation as the original recipe. Running `prepare-clinic-art.mjs` also runs the revised recipe, so it cannot leave the obsolete stamp sprites installed. Runtime uses only local prepared assets.

Patient portraits remain the original sprites. Their animation now changes integer position and dimensions as they emerge from corridor depth, with an opaque dark silhouette becoming lit; the environment remains stationary. The final handoff target remains aligned to the settled portrait at (38,32), 94 × 96. There are 24 supplied frames advanced every 60 ms; exit adds a 900 ms stationary pause before its first six held frames, allowing about 1.5 seconds of readable farewell before recession. The renderer does not advance animation or time.

### Exact cabinet edit prompt

Reference/edit target: `public/assets/art/cabinet-clinic.png`. Transparency: false.

```text
Use case: precise-object-edit. Asset type: original pixel-art clinic game background, 570x320 logical canvas, edit the attached environment. Keep worn olive/charcoal/cream palette, hard textured pixel clusters, same four quadrants and wooden division lines exactly, bottom two desktop quadrants and top-right examination couch, blank eye chart and pressure apparatus unchanged. PRIMARY CHANGES ONLY IN TOP HALF: remove the lamp from top left and remove the strip of foreground counter/desk across the top-left room: it must show a dark EMPTY CORRIDOR and its floor all the way down to the existing horizontal wooden divider, with no desk, no countertop and no chair. Expand the doorway into a deep dim corridor opening on the left side, centered approximately x75 at original logical coordinates, extending from ceiling down to floor. Corridor perspective and dark distance visible, empty space for later patient sprite; no person. Preserve small blank enamel number plaque near x129 y38 and a small brass call button on the wall near x264 y109. MOVE THE SAME olive lamp to the RIGHT room, mount it on right wall below the empty shelf: its shade should occupy x476–523 y61–72 in this original 570x320 image, small metal arm reaches up to shelf edge, modest cream light. Keep the right upper wall empty x440–470 y8–45 for later clock, no clock in image. Crucial: NO desk/counter visible within TOP LEFT room, only corridor walls and floor. Existing bottom desktops remain exactly as reference. No words, letters, digits, logos, UI, people, dates or country symbols. Landscape 16:9, same composition. Keep original texture, low resolution game aesthetic and warm dim lighting.
```

### Exact final correction prompt

Reference/edit target: the preceding generated corridor revision, inspected in the tool output. The selected result is the retained `cabinet-corridor-source.png`; the first intermediate result is not used by the game. Transparency: false.

```text
Use case: precise-object-edit. Edit this original pixel art game environment. Change ONLY the TOP RIGHT room: remove the entire examination couch/table/desk slab, legs and furniture along its lower-right edge. Replace it seamlessly with the same worn olive wall tiles and a narrow empty dark floor line. Keep pressure apparatus, blank eye chart, wall shelf and illuminated lamp in exact positions and same size. Keep the ENTIRE top-left dark corridor, doors, blank plaque and button exactly unchanged. Keep ALL the bottom desktop surfaces and wooden division lines exactly unchanged. The only visible desks are the bottom two interface quadrants; no extra table, counter, cabinet or couch in either upper room. Preserve same pixel art texture, palette, lighting and composition. No people, words, letters, digits or added objects.
```

### Exact mechanical stamp generation prompt

No reference images. Transparency: true.

```text
Use case: stylized-concept. Asset type: original pixel-art game sprite atlas on genuinely transparent alpha background, two equal cells side by side. Two MATCHING vintage mechanical self-inking office rubber stamps seen front three-quarter slightly from above, each complete, upright, separate with ample transparent margins. Left stamp dark olive enamel upper press handle, right stamp muted brick-red enamel upper press handle. Both have a chunky horizontal rectangular palm press at the top, visible sprung metal U-frame sides, silver rods and small exposed coil springs, central reversing rectangular rubber printing plate, sturdy dark rectangular foot/base. Clearly a push-down spring mechanism, NOT a wooden knob hand stamp, no long narrow handle, no modern bright plastic product. Each silhouette fits square 48x48 game sprite when downsampled, taller than wide, readable broad dark outline and strong clustered highlight pixels. Match worn institutional analog clinic, charcoal dark steel, yellowed brass, muted olive / brick red accents, realistic wear, crisp low resolution handcrafted pixel art with deliberate hard square clusters and restricted palette. No smoothing or painted blur. No cast ground shadow; no scene backdrop. No logos, lettering, labels, numbers or insignia. Each stamp occupies one equal square cell, same size and view, isolated without overlap. Output wide 2:1 with real transparency, intended downsampling each stamp to 48x48 native pixels.
```

### Exact introduction stamp edit prompt

Edit target: the original local `intro-stamp-source.png`; design reference: `mechanical-stamps-source.png`. Both were inspected first. Built-in `image_gen`, transparency false. The selected output is retained as `intro-stamp-mechanical-source.png` and replaces the runtime introduction image. `prepare-corridor-art.mjs` applies its nearest-neighbor resize after `prepare-clinic-art.mjs` prepares the original sources, so regeneration selects the current design while preserving the historical source.

```text
Use case: precise-object-edit. Asset type: full-bleed original pixel-art game introduction illustration. Image 1 is the EDIT TARGET; image 2 is a DESIGN REFERENCE for the stamp mechanism. In image 1 replace ONLY the wooden-handled rubber stamp with a heavy vintage mechanical self-inking stamp matching the RIGHT, brick-red press handle design in image 2: broad horizontal enamel palm press, exposed spring-loaded dark metal frame, brass details and rectangular platen/base. It stands at the exact same location and occupies a similar overall footprint on the paper, matching image 1 perspective, warm left light, cast shadow, worn institutional pixel textures and restrained olive/charcoal/sepia palette. The new stamp should be slightly taller than wide with a clear opening in its steel frame and visible coil springs. Preserve ALL other image 1 contents: paper sheets and blank red imprint, green cabinets, pencils, desk, shadows and composition. Crucially keep the entire RIGHT 55 percent empty dark wall exactly as it is, reserved for text rendered later. No words, letters, labels, numbers, logos, people or new objects. Preserve hard deliberate pixel clusters and the original aspect ratio, not smooth product rendering. Image 2 is reference only, do not include two stamps or its transparent backdrop. Opaque output.
```

## Original generation

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

