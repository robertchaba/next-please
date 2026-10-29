# Envelope postage stamp

Created for **Next, Please!** on 29 October 2026 with the built-in `image_gen` tool and `imagegen` skill. The existing kraft envelope had an empty postage outline. This revision adds an original olive botanical postage stamp with a pale perforated edge and a worn cancellation, keeping the brown paper, red stripe, flap and curled opening corner. The stamp contains no readable country, value, currency or institution. Localized sender and recipient text remain separate overlays.

- Edit target: [previous no-window source](../public/assets/art/envelope-revision/no-window-source.png), visually inspected before generation.
- Exact prompt: [postage.txt](art-prompts/envelope-revision/postage.txt); `transparent_background: true` with the previous source as the sole referenced image.
- Untouched output: [postage-source.png](../public/assets/art/envelope-revision/postage-source.png), 1433 × 1098.
- Runtime sprite: [paper-envelope-postage.png](../public/assets/art/sprites/paper-envelope-postage.png), 188 × 144.
- Preparation: [prepare-envelope-postage-art.mjs](../scripts/prepare-envelope-postage-art.mjs).

```sh
node scripts/prepare-envelope-postage-art.mjs /absolute/path/to/node_modules/sharp
```

The offline recipe finds visible bounds using alpha > 8, crops `(49,88,1336,929)` and resizes with nearest-neighbor sampling. Generated alpha within the crop remains intact. It never paints the stamp or synthesizes replacement pixels. Sharp is an offline tool; no dependency is added to the game. The previous source, sprite and recipe remain archived.

`src/render/clinic.ts` loads the revised local sprite for closed letters and directives. The envelope footprint, sender seals and keyboard opening control are preserved. This decorative revision adds no gameplay or save fields.

This is original generated project artwork edited from the project's own generated image. No third-party stock artwork was acquired and no separate asset attribution is required. Robert Chaba's creator credit and https://github.com/robertchaba remain intact. No CLI/API fallback was used.

The source, native sprite and in-game [Polish](envelope-postage-pl-screen.png) and [English](envelope-postage-en-screen.png) previews were visually inspected. The botanical stamp remains legible without obscuring sender text or the institutional impression. The stationery browser suite passed asset-loading, language switching and keyboard opening checks.
