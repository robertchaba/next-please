# Mobile speech balloon revision — 2026-10-25

The mobile call's speech now originates at the receiver's upper speaker. Its replacement balloon has an upward-left tail, allowing the body to sit below that speaker.

- Method: built-in `image_gen`, using the imagegen skill; edit mode, no API/CLI fallback.
- Edit reference: `public/assets/art/mobile-balloon.png`, the original generated clinic balloon.
- Source: `public/assets/art/mobile-balloon-up-source.png`, 1760 × 894 pixels.
- Runtime: `public/assets/art/mobile-balloon-up.png`, 260 × 132 pixels.
- Preparation: `node scripts/prepare-mobile-balloon.mjs /absolute/path/to/node_modules/sharp`.
- Crop: source x = 5, y = 27, width = 1753, height = 827, found from alpha > 8. Generated alpha is retained inside that crop; nearest-neighbor resizing supplies the native runtime sprite.
- Runtime anchor: the top tail tip is at approximately (67, 0); it joins the body around (82, 34). Keep text inside x = 10–248 and y = 42–119. Four lines of the existing document font at 2× fit.
- Provenance: original generated artwork for this project, not acquired from a third party or copied from another game; no separate stock or third-party attribution requirement. No localized text is baked into the image.

The existing bottom-tail source and runtime files remain available as historical assets. The upper-tail variant is meant to be positioned using the handset's rendered upper-speaker location, including object-fit cropping and rotation.

## Exact prompt

```text
Use case: precise-object-edit
Asset type: blank mobile comic speech balloon sprite for the original subdued pixel-art analog clinic game Next, Please!
Input image: edit target and exact palette/edge style reference, existing blank cream comic balloon. Keep the same charcoal olive outline and ivory cream fill, quiet empty interior and hard chunky pixel edges.
Primary request: replace the bottom-left speaking tail with one tail extending UPWARD AND SLIGHTLY LEFT from the TOP edge. The entire bottom edge is now uninterrupted, with no bottom tail.
Composition: final runtime image will be 260 pixels wide by 132 pixels high. Broad rounded rectangular body from y=28 to y=130. A single triangular speaking tail extends from top edge near x=88,y=28 to a sharp tip at x=64,y=0, pointing upper-left into the upper earpiece of a telephone above it. Tail is connected seamlessly to body, its interior same cream. All outline and top tail fully visible. Broad unobstructed blank interior x=10..248, y=36..122 for four short text lines.
Style: crisp low-resolution 2D pixel art matching reference, 2 native pixel charcoal #171d19 outline, ivory #ded9bb fill, restrained olive shadow. Hard square edges, no antialiasing, no blur, no painterly texture.
Background: genuine alpha transparency. No surroundings or objects.
Text: none. No letters, numbers, scribbles, symbols, logos, or watermark. Do not include the telephone. No second tail.
```

