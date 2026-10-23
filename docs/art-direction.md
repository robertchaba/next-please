# Art direction

The game uses an original, subdued occupational-health clinic setting with an old-fashioned analog atmosphere. Institutional olive, charcoal, yellowed paper, and occasional brick-red stamps carry the atmosphere. Humor should come from forms, rules, institutional language, and uncomfortable decisions and everyday details. Keep the environment worn and ordinary rather than gory. Keep the artwork, characters, writing, and game identity original.

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
