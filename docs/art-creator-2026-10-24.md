# Creator photograph

Created on 2026-10-24 with the built-in `image_gen` tool and the imagegen skill. No API/CLI generation fallback was used. The identity-preserving pixel portrait depicts Robert Chaba from the photographs he supplied with the explicit request to include his black-and-white pixel photograph, attached by a paperclip, on the credits page.

- Retained original generated source: `public/assets/art/creator-robert-source.png`, 1127 × 1396 pixels.
- Current clothing revision source: `public/assets/art/creator-robert-period-source.png`, 1127 × 1396 pixels.
- Runtime portrait: `public/assets/art/creator-robert.png`, 100 × 124 pixels.
- Reference photographs: `Screenshot 2026-10-24 at 22.48.28.png` (primary expression/likeness) and `PXL_20260607_165333320.jpg` (supporting likeness). The other supplied photographs were not used for generation.
- Style reference: the project's original `public/assets/art/title-clinic.png`.
- Provenance and permission: user-provided personal photographs, used at Robert Chaba's request to create his credits portrait for this game. The resulting portrait may accompany this project's game assets for that requested use; this records the task-specific authorization, not a general stock-photo or open license for the original photographs. The original personal photographs remain outside the repository and are not bundled with the game.
- The generated portrait uses neutral grayscale. A warm paper border, small shadow and steel wire paperclip are original deterministic Canvas geometry in `src/render/clinic.ts`; no text is embedded in the image. The portrait description is localized in both dictionaries.

Recreate the runtime image using `node scripts/prepare-creator-art.mjs /absolute/path/to/node_modules/sharp`. This uses full-composition nearest-neighbor resizing; Sharp is an offline preparation tool and is not a runtime dependency. The portrait was enlarged by about 19% for the requested layout revision. On image load, the game prepares a 110 × 140 paper mount, rotates it four degrees clockwise through nearest-neighbor integer pixel sampling into a cached 120 × 148 canvas, and prepares its matching shadow. Drawing uses the cached result at (350,13), beside the document’s top edge, with no smoothing or repeated resampling. An open steel-wire clip crosses the top edge at (384,5); its rear leg is drawn behind the photograph. The mount remains clear of both languages’ credit text and controls. Robert Chaba's creator credit and GitHub link are preserved.

The original generated source is retained. The first archived prompt below records the original smaller target; the later size, placement, tilt and clip revision is local asset preparation and Canvas composition, without further image generation. At the user's subsequent request for clothing matching the game's atmosphere, the built-in `image_gen` edited the clothing into a pale collared shirt and plain dark wool V-neck sweater. The likeness, monochrome pixel treatment and composition were preserved. The preparation script now reads the clothing revision; the 100 × 124 runtime size, paper mount, tilt, placement and clip are unchanged. No country, date or new game-world fact is established by the outfit.

## Exact generation prompt

```text
Use case: identity-preserve
Asset type: black-and-white pixel portrait photo for the creator credits in an original analog clinic game. It will be printed at 84 by 104 logical pixels inside a paper photograph frame, with a paperclip added separately by code.
Primary request: Create a recognizable monochrome pixel-art head-and-shoulders portrait of the same adult man shown in references 1 and 2. Preserve his face shape, broad dark square glasses, short side-parted salt-and-pepper hair, gray beard and moustache, and friendly subtle closed-mouth smile. Reference 1 is the primary likeness/expression reference, reference 2 supplies additional facial structure.
Input images: Image 1 close portrait and Image 2 larger portrait are identity references. Image 3 is only a pixel-art style reference from the game; do NOT copy its scene or colors.
Composition: portrait rectangle with ratio 21:26. Frontal or very slight three-quarter portrait, whole hair and head visible, face large and centered, dark plain crewneck top, shoulders cut by the bottom edge. Plain middle-gray photo studio backdrop. Head and beard occupy most of the photograph so the man remains recognizable at 84x104.
Style: deliberately low-resolution pixel clusters, coarse crisp square edges, restrained ordered dithering, vintage black-and-white personnel photograph translated to hand-crafted pixel art. Use a small palette of neutral grayscale values only. No blur, no smooth gradients, no painterly strokes.
Constraints: preserve the identity of the man. No text, no lettering, no logos, no watermark, no border, no frame, no paperclip, no additional people or objects. Full opaque rectangular portrait; the code supplies paper border and clip.
```

## Exact clothing edit prompt

Method: built-in `image_gen`, identity-preserving edit of the original generated source, opaque output. No CLI/API fallback. This derivative shares the project's existing portrait provenance and task-specific authorization.

```text
Use case: identity-preserve
Asset type: edited monochrome pixel portrait for an existing game's creator credits, displayed at 100 by 124 pixels.
Input image: creator-robert-source.png is the edit target, the approved portrait of Robert Chaba.
Primary request: Change ONLY the man's clothing from the plain modern dark crewneck top to an ordinary pale collared shirt underneath a plain dark wool V-neck pullover, matching the understated old-fashioned institutional clinic aesthetic. The shirt has a modest pointed collar visible on both sides of the neck; the sweater has a clearly readable V neck and restrained knit texture. Everyday modest office clothing, not fancy costume or medical uniform.
Invariants: Preserve the EXACT existing face, expression, gaze, glasses, hair, beard and moustache, head and neck proportions, head position, pose, shoulder silhouette, crop, background, lighting and all pixels outside the clothing region. Do not redraw the face, change the person's age, remove the beard or glasses, or zoom out. Clothing occupies only the existing visible lower shoulders/chest. Preserve the full original portrait composition and 1127 by 1396 dimensions.
Style: Match the existing deliberate crisp square pixel clusters, sparse grayscale dithering and neutral black-and-white palette. Clothing must remain legible after nearest-neighbor reduction to 100x124. No antialiasing, smooth gradients, blur, painted brushwork or color.
Constraints: No tie, no jacket, no modern sportswear, no patterns/logos, no new props, no text, no border, no paperclip. Do not identify any country or date. Opaque rectangular image.
```
