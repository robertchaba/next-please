# Additional patient portraits

Created on 25 October 2026 with the built-in `image_gen` tool using the `imagegen` skill. The 25 portraits are separate generation requests, using the viewed existing `public/assets/art/patients-source/patient-01.png` only as a style and pose reference. Each depicts a distinct fictional identity with period-compatible ordinary clothing, loosely folded hands and a waist-up silhouette. No country, city, named employer or fixed occupation is established by the artwork.

These original assets were generated specifically for Next, Please! They contain no acquired stock imagery or extracted game assets and have no separate third-party asset license or attribution requirement. All runtime images are local. No image-generation API or CLI fallback was used.

## Sources and prompts

- Exact per-image prompts and generation settings: [`public/assets/art/patients-source/prompts-26-50.json`](../public/assets/art/patients-source/prompts-26-50.json).
- Unmodified generated PNG sources: `public/assets/art/patients-source/patient-26.png` through `patient-50.png`.
- Runtime PNG sprites: `public/assets/art/sprites/patient-26.png` through `patient-50.png`, each 94 × 96 with alpha.
- Visual review contact sheet: [`patients-expansion-roster-screen.png`](patients-expansion-roster-screen.png), ID order, five per row at 2× nearest-neighbor enlargement.

All requests explicitly used `transparent_background: true`. Generated alpha is preserved within the selected crop. Existing patient artwork remains unchanged.

| IDs | Depicted age and sex, in order |
| --- | --- |
| 26–30 | man 32; woman 46; man 60; woman 27; man 39 |
| 31–35 | woman 54; man 23; woman 64; man 48; woman 35 |
| 36–40 | man 56; woman 29; man 42; woman 58; man 25 |
| 41–45 | woman 51; man 37; woman 62; man 44; woman 30 |
| 46–50 | man 55; woman 40; man 33; woman 47; man 59 |

## Preparation recipe

```sh
node scripts/prepare-patient-expansion-art.mjs /absolute/path/to/node_modules/sharp
```

The recipe finds visible alpha bounds using the established alpha > 8 margin rule, crops transparent margins, and resizes to the 94 × 96 portrait footprint with nearest-neighbor sampling. It preserves source files and generated alpha inside the crop. No faces, clothing, objects or decorative pixels are invented by preparation code. Sharp is used only offline and is not a runtime dependency. Missing sources are explicitly reported so completed batches can be prepared during generation.

The generated source portraits and native sprites are inspected for complete hair and shoulder silhouettes, readable differences, usable transparency and consistency with the existing subdued olive, charcoal, wool and paper clinic palette. The neutral dark contact-sheet background is a review aid, not a new game asset.

All 25 runtime sprites were verified as 94 × 96 PNGs with alpha, transparent outer pixels, visible foreground and distinct SHA-256 hashes. The complete 5 × 5 contact sheet was visually inspected after preparation. The new IDs continue the established portrait footprint and handoff position.
