# Bankruptcy: the clinic cloakroom — 2026-10-26

The doctor’s bankruptcy ends with a new job in the clinic cloakroom: issuing brass tokens instead of medical certificates. The comment closes with the observation that coats never appeal a decision. The final budget precedes the epilogue, whose action starts a new game immediately.

- Runtime asset: [bankruptcy-cloakroom.png](../public/assets/art/bankruptcy-cloakroom.png), 570 × 320 PNG.
- Retained generated source: [daily-scenes-source/bankruptcy-cloakroom.png](../public/assets/art/daily-scenes-source/bankruptcy-cloakroom.png), 1672 × 940 PNG.
- Exact generation prompt: [bankruptcy-cloakroom.txt](art-prompts/bankruptcy-cloakroom.txt).
- Preparation recipe: [prepare-bankruptcy-art.mjs](../scripts/prepare-bankruptcy-art.mjs).

Generated with the built-in `image_gen` tool using the `imagegen` skill, in one call, as new opaque artwork. No CLI/API fallback, third-party imagery or stock assets were used. The existing project homecoming illustration and portrait contact sheets were inspected for palette and visual context; no image was submitted as an edit target. The output was copied from the built-in generated-images directory into this repository. It is original project artwork; generated-output use and redistribution follow applicable OpenAI terms, with no separately acquired asset license or third-party attribution claim.

The illustration keeps the unnamed 1983 analog clinic atmosphere: olive tiles, a worn wooden hatch, wool coats, subdued brass and a white coat hung aside. The left wall stays dark for separately localized text. No text, location, date or emblem is embedded in the image.

Preparation resizes the complete source once with nearest-neighbor sampling, without drawing, cropping, retouching or invented geometry:

```sh
node scripts/prepare-bankruptcy-art.mjs /absolute/path/to/node_modules/sharp
```

Sharp is an offline preparation tool, not a runtime dependency. The local PNG loads with the existing scene assets; Canvas uses integer coordinates and disabled smoothing. Polish and English share the illustration and use their own title, narrative, accessible scene description, game-over caption and restart label in `src/i18n.ts`. The original pixel font supplies all lettering; the body wraps to 286 native pixels to leave the hatch frame clear. The semantic restart control matches `(23,272,318,30)` and works with mouse and keyboard. Reduced motion shows the complete text; otherwise Enter first reveals it.

Reviewed captures: [Polish](bankruptcy-pl-screen.png), [English](bankruptcy-en-screen.png). Browser coverage in `tests/browser/bankruptcy.spec.ts` verifies settlement, both languages, export/import, failed-import preservation and a complete restart. `tests/notes-ending.test.ts` checks the negative/zero boundary, forced closing, terminal actions and historical-save migration.
