# Mobile reception artwork — 2026-10-25

The original three assets and the later loose-note and sound-icon revision were created with the built-in image_gen tool using the imagegen skill (no API/CLI fallback). Generated specifically for Next, Please!, not acquired or extracted from another game. No separate stock or third-party license applies. Original source images are retained under public/assets/art/mobile-{handset,note,balloon}-source.png. The approved clinic art was visually inspected for palette and style; the initial three generations had no reference-image inputs. The loose-note edit uses the retained original note; the muted icon uses the generated sound-enabled icon as its reference.

Runtime assets: mobile-handset.png (320 × 480), mobile-note.png (280 × 260), mobile-balloon-up.png (260 × 132), and mobile-sound-{on,off}.png (18 × 18, displayed at 36 × 36). The paper, balloon and sound icons preserve generated alpha. The final note is a loose sheet with no tape, pin or other fastening. Its comfortable writable area is x = 28–250, y = 22–234; irregular paper edges and shadow lie outside it. All text is localized at runtime; the handwritten note uses the project's original bitmap glyphs with deterministic ink slant and baseline variation. No text is baked into an image.

Preparation: `node scripts/prepare-mobile-art.mjs /absolute/path/to/node_modules/sharp`. This retains the full handset composition and crops imperceptible transparent margins from the other assets, then resizes with nearest-neighbor sampling. The revised note source, mobile-note-loose-source.png, is cropped at (93,147), 1293 × 920, then fitted to 280 × 260. Both sound sources, mobile-sound-{on,off}-source.png, share the same crop at (102,235), 1120 × 840, preserving the speaker position between states; they are contained within 18 × 18 with transparent padding. The original taped source remains archived and is no longer consumed. Sharp is an offline tool only. The responsive mobile reception is separate from the unchanged 570 × 320 desktop game viewport.

## Handset prompt

```text
Use case: stylized-concept
Asset type: original full-screen portrait illustration for the mobile reception of Next, Please!, an analog clinic game. Produce a tall portrait image, 2:3.
Primary request: a very large worn dark olive-gray bakelite telephone RECEIVER alone, hanging diagonally and almost filling the frame. This is the chunky receiver from an ordinary 1983 rotary desk telephone. The upper earpiece sits near upper left/center, the handle descends through center, the lower mouthpiece sits near lower right. A black coiled cable hangs from its lower end and curls off the bottom. No telephone base, no dial, no hand, no person.
Style: crisp original low-resolution 2D pixel art matching a subdued institutional clinic: charcoal #141a18, olive #353e32 #6b7252, restrained dirty beige #c9c3a1 highlights. Hard clustered square pixels, sparse dithering, no anti-aliased painting, no glossy 3D or blur.
Backdrop: very dark charcoal olive wall with faint worn plaster texture and quiet edges. A modest warm side light defines the old molded receiver, scratches and earpiece grille. Strong readable silhouette. Leave uppermost 8 percent and bottommost 10 percent subdued and uncluttered for separately placed interface text.
Composition: the receiver occupies approximately 80 percent of image height and 70 percent of width, fully visible with breathing room at the edges; convincing substantial handset proportions.
Text: none. No lettering, numbers, logos, watermark, decorative objects, buttons, borders, or other UI. This is a project-original asset, not a recreation of another game's art.
```

## Original taped-note prompt (superseded)

```text
Use case: stylized-concept
Asset type: one blank paper note sprite for an original subdued pixel-art analog clinic game.
Primary request: a slightly skewed, unruled small rectangle of worn yellowed cream stationery, viewed straight from above, on a truly transparent background. Gently uneven torn lower edge, subtle worn corners and a faint fold. Width to height about 5:4. Quiet ivory center with ample blank space for separately rendered handwriting. A small piece of faded olive-beige adhesive tape attaches its top edge. All of paper including corners and tape is visible.
Style: crisp low resolution 2D pixel art, chunky hard square clusters suitable for display at 260 by 210 pixels, sparse ordered dithering, muted dirty beige #c9c3a1 and cream #ded9bb, charcoal outline one or two native pixels, restrained soft-looking shadow built only from hard pixel clusters. Original clinic stationery from 1983, no location identifiers.
Text: completely blank. NO letters, scribbles, lines, logos, dates, text or watermark. No objects beside the paper, no pen, no surface backdrop. Preserve real alpha transparency, no checkerboard artwork.
```

The active speech balloon has an upward tail anchored to the upper earpiece. Its source, exact prompt and separate `scripts/prepare-mobile-balloon.mjs` recipe are recorded in [the upward balloon revision](art-mobile-balloon-2026-10-25.md). The original downward-tail `mobile-balloon.png` remains archived.

## Original downward-tail balloon prompt (superseded)

```text
Use case: stylized-concept
Asset type: blank comic speech balloon sprite for an original subdued pixel-art clinic game.
Primary request: a single broad, gently irregular rectangular speech balloon with stepped round corners, an ivory cream interior and charcoal ink outline. Small triangular speaking tail projects from its bottom-left side, pointing down-left toward an old telephone receiver. Balloon width to height about 2.2:1; roomy uninterrupted blank center for 4 short lines of separately rendered dialogue.
Style: crisp original 2D low-resolution pixel art, hard square pixel edges, outline 2 native pixels at intended 260 by 118 pixel display size, subdued yellowed ivory #ded9bb and charcoal #171d19, tiny restrained offset pixel shadow. No bright white, no gradients, no glossy styling.
Background truly transparent with generated alpha. All outline and tail visible inside the image.
Text: none, no words or letters, no marks or icons or UI buttons. One balloon only, no other objects, no checkerboard artwork.
```

## Loose-note revision prompt

Input: `public/assets/art/mobile-note-source.png`, inspected before editing. Output retained as `public/assets/art/mobile-note-loose-source.png`. The prompt's initial 260 × 210 target was enlarged during preparation to 280 × 260 to accommodate the revised larger lettering.

```text
Use case: precise-object-edit
Asset type: loose paper note sprite for the original subdued pixel-art analog clinic game Next, Please!.
Input image: edit target is the supplied existing blank taped note. Preserve its yellowed cream paper, pixel clusters, restrained worn corners, subtle fold, slightly skewed rectangular silhouette and broad uninterrupted blank center.
Primary request: remove the adhesive tape completely from the top edge, restore a clean natural paper edge underneath it, and remove any suggestion that the paper is fastened to a surface. It is a single loose sheet. No tape, pin, clip, attachment, glue, hole, or support anywhere.
Composition: full sheet isolated on a genuinely transparent background, including corners and modest pixel shadow. Width to height about 5:4, prepared later to 260 by 210 pixels. Keep most of the center quiet and blank for separately rendered handwriting.
Style: crisp original low-resolution 2D pixel art, hard square clusters, muted yellowed cream #ded9bb and dirty beige #c9c3a1, restrained charcoal outline. Match the supplied paper's analogue clinic atmosphere. No smooth painted edges or blur.
Text: completely blank. No letters, scribbles, lines, logos, dates, watermark, other objects or backdrop. Preserve real alpha transparency.
```

## Sound-enabled icon prompt

No reference-image input. Output retained as `public/assets/art/mobile-sound-on-source.png`.

```text
Use case: stylized-concept
Asset type: one original small pixel-art sound-enabled speaker icon for an analog clinic game's interface.
Primary request: a very simple recognizable cream loudspeaker silhouette pointing right, with two separate short stepped sound-wave arcs on its right. One icon only. Design as if drawn on an 18 by 18 native pixel grid, enlarged with perfectly hard nearest-neighbor square blocks. Each block exactly follows a coarse square grid; extremely simple 2D low resolution sprite. No tiny texture.
Composition: centered isolated icon in a square image, with small transparent padding. Solid readable silhouette, straight blocky stepped horn profile, square speaker driver on left and two thick angular wave arcs right. The entire icon is visible.
Color palette: light muted warm cream #ddd6b5 with a small dark olive #83876a offset shadow for contrast on a charcoal #141a18 game background. Maximum three flat colors. Main cream strokes are chunky and crisp.
Background: genuinely transparent alpha.
Text: none. No letters, logo, frame, circle, button plate, gradients, antialiasing, glossy 3D, microphone, musical note or additional objects.
```

## Muted icon prompt

Input: the generated sound-enabled icon above. Output retained as `public/assets/art/mobile-sound-off-source.png`.

```text
Use case: precise-object-edit
Asset type: muted-state counterpart of the supplied small speaker icon for an original pixel-art analog clinic game.
Input image: supplied sound-enabled speaker icon is the edit target.
Primary request: preserve the entire cream speaker silhouette on the left, its position, size, chunky pixel style and olive outline. Replace ONLY the two sound-wave arcs on its right with one simple large chunky pixel X in muted brick-red #bc7b63 with dark olive offset edge. The X means sound is muted. Keep the X clearly separated from the speaker cone; put it in the same space formerly occupied by the sound waves, with at least one coarse pixel of transparent separation.
Composition: identical square image dimensions and transparent padding; no cropping, shifting or resizing of the speaker. Draw the X using few thick staircase blocks, legible at a final 18 by 18 pixel icon.
Style: original crisp low-resolution hard square pixel edges, simple readable shapes. Preserve cream #ddd6b5 and olive #83876a speaker; no added detail.
Background: preserve genuine alpha transparency.
Text: none. No letters other than the mute X symbol, no logo, no circle or frame, no new objects, no gradients, no antialiasing.
```
