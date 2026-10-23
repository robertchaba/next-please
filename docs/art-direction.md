# Art direction

The game uses an original, subdued occupational-health clinic setting with an old-fashioned analog atmosphere. Institutional olive, charcoal, yellowed paper, and occasional brick-red stamps carry the atmosphere. Humor should come from forms, rules, institutional language, and uncomfortable decisions and everyday details. Keep the environment worn and ordinary rather than gory. Keep the artwork, characters, writing, and game identity original.

The visual reference for version 0.2 is an understated 1980s institutional interior: olive enamel furniture, wood veneer, cream electrical fittings, wool jackets, paper records, and a plain analog wall clock. This guides the artwork without identifying a country or displaying a decade in the game.

The current title-screen atmosphere is the approved baseline. Use paper records, rubber stamps, filing cabinets, worn furniture, tiled walls, institutional lighting, and clothing consistent with the existing artwork. Keep the setting unnamed and undated: do not explicitly identify a country, city, calendar date, year, decade, or real currency in the game's presentation or story. Polish and English are interface languages, not declarations of the story's location. [FACTS.md](../FACTS.md) records established world facts; whether the location is fictional remains undecided.

The title scene reserves its left 43–45% for the title and controls. The bright service window and doctor sit on the right. Put text in the interface rather than baking words into images so Polish and English share the same artwork. Preserve recognizable silhouettes and hard pixel edges at the native 570 × 320 viewport.

## Title background

- Runtime asset: `public/assets/art/title-clinic.png`, 570 × 320 pixels, PNG.
- Original generated asset: `public/assets/art/title-clinic-source.png`, 1673 × 940 pixels, PNG.
- Created: 2026-10-23.
- Method: the built-in `image_gen` tool, using the `imagegen` skill; no API/CLI image generation fallback.
- Intent: `generate`; use case: `stylized-concept`; one new image with no reference-image inputs.
- Transparency: false.
- Provenance: generated specifically for this project, not extracted from an existing game. Do not attribute it to a stock-image or third-party asset license.

The tool returned a larger image than the requested native size. The selected result was copied from the built-in generated-images directory into this repository. The runtime copy was resized with nearest-neighbor sampling using Sharp CLI:

```sh
npx --yes --package=sharp-cli sharp \
  -i public/assets/art/title-clinic-source.png \
  -o public/assets/art/title-clinic.png \
  resize 570 320 --kernel nearest --fit fill
```

This was asset preparation only; Sharp CLI is not a runtime dependency. The resize uses the full composition, and the negligible difference in aspect ratio is fitted to the native viewport. The resulting PNG was visually inspected at 570 × 320 and its dimensions verified with `sips`.

Render the runtime asset with image smoothing disabled and CSS `image-rendering: pixelated`. Scale the complete game viewport together, retaining its aspect ratio; prefer integer scale factors with letterboxing when room permits. Do not upscale the source image directly as the game background.

## Generation prompt

This is the exact archived prompt used to create the existing asset, not the current setting specification. Its place and period references are historical production notes and do not establish world facts. Future work follows the unnamed, undated art direction above and the established world facts in [FACTS.md](../FACTS.md).

```text
Use case: stylized-concept
Asset type: original pixel art background for a Polish indie game's welcome/title screen, final game canvas 570 by 320 pixels. Generate landscape 16:9, ideally exactly 570x320 or a clean integer upscale of that resolution.
Primary request: A bleak, darkly funny occupational-health clinic reception in early-1990s Poland, viewed straight on from the waiting room. This is an original bureaucratic satire game environment.
Scene and subject: On the RIGHT HALF, a tired doctor silhouette in a pale coat behind a battered service-window partition, looking down over mountains of blank paperwork. Green metal filing drawers, old cream wall tiles, a hanging institutional lamp, a little desk with blank forms and a chunky brick-red rubber stamp. A dim olive clinic wall behind the glass. Cold oppressive ordinary bureaucracy, evocative small everyday details, no horror or blood.
Composition: Wide 570x320 game frame. LEFT 45 PERCENT must be very dark almost uniform charcoal-olive with only faint wall texture and deep shadow, no objects or high contrast, reserved for separately rendered title and menu text. The architectural partition begins around the center and a service window occupies the right 55 percent. Strong attractive readable silhouette, little yellowed light falling onto the papers, dark foreground. The bottommost 25 pixels are quiet and dark for a footer.
Style: Authentic crisp low resolution 2D pixel art, handcrafted limited palette, hard square pixel edges, 1 to 3 pixel details at the 570x320 intended scale, deliberate clustered pixel shading and sparse ordered dithering. No antialiasing. No blurred edges, no digital painting, no gradients, no glossy 3D. Polished moody indie game background.
Palette: 14-18 muted colors dominated by nearly black charcoal #141a18, dark olive #353e32, faded military green #6b7252, dirty beige #c9c3a1, dull cream #ded9bb, small brick red #a34b3d accents. Doctor's face indistinct in shadow.
Text: absolutely no text, no letters, no numbers; all paperwork and signs remain blank or abstract scribbles too small to read. No logo, no watermark, no recognizable copied game character, no UI buttons, no border around the image.
```

The palette in the prompt describes the visual target; the generated PNG is not an indexed 18-color image. Future interactive sprites should use a smaller explicit palette and consistent one-pixel outlines where useful for readability.

## Introduction and cabinet artwork

`src/render/clinic.ts` contains the original code-drawn introduction illustrations, cabinet, three patient portraits, furniture, instruments, and decorations added for version 0.2. These assets were authored specifically for this project as Canvas 2D geometry; they contain no extracted game art, stock imagery, or third-party asset dependencies. Their provenance is the project source code and they have no separate third-party attribution requirement.

The four illustrations show a scalpel, soft catheter tubing, a fountain pen, and a rubber stamp. Each appears with one brief sentence and a Next action; the final card enters the cabinet. Avoid intro headings, repeated captions, progress strips, and footer bars. They carry no embedded text, dates, flags, or place names.

The cabinet continues the title palette with worn olive tiles, yellowed plaster, a wooden desk, a green document blotter, and a switchable plant/certificate decoration. Physical wooden dividers make four areas immediately legible: patient and doorway at upper left, examination wall at upper right, paperwork at lower left, and loose tools at lower right. The vertical divider occupies x = 282–287, and the horizontal divider occupies y = 128–137. The upper areas are 128 pixels high; the lower desktop areas are 182 pixels high. Keep those larger lower areas clear enough to move the document, stamps, rulebook, cup, and pencil.

Patients use three distinct original silhouettes and faces, seen from the waist up behind the doctor's desk, without detailed patient-chair furniture. A distant open doorway, corridor, cast shadow, and original pixel-drawn enamel **04** plate give the room depth and identity. Entry and exit use six simple poses with small changes to position, walking bob, and the door. Reduced motion shows the settled state immediately. The plain analog clock on the examination wall displays simulation time provided by the gameplay state, without work-hour labels or colored sectors.

Shapes are drawn with integer rectangles, pixel lines, and scanline polygons so diagonal edges retain deliberate hard pixels. Decorations, examination controls, document controls, and localized narration remain separate from the illustration geometry. The artwork renderer reads the supplied state and never creates time or random values.

The introduction and consulting room use the full 570 × 320 scene without interface header/footer bars; the cabinet's internal divisions are physical joinery. Settings, music, language, fullscreen, and cabinet navigation belong below that area. There is no title or department label above the scene, and PL / EN use 14px page lettering. In the room, use recognizable objects and aligned hotspots without panel captions or object labels. Confine lettering to the physical paperwork and eye chart; draw the 04 plate as pixel geometry. Keep patient details and results on the documents and provide action feedback through accessible descriptions and announcements. Moved objects retain hard pixel edges and cast a small shadow while lifted.

Document and rulebook text uses a separate original compact mixed-case bitmap face in `src/render/font.ts`, with Polish diacritics and an eleven-pixel line advance. The user-provided Papers, Please screenshot guides relative type size and heading hierarchy only; no font, artwork, interface, branding, or world details are taken from it. The approved title lettering stays unchanged.
