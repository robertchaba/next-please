# Patients and the evening at home

Created on 25 October 2026 with the built-in `image_gen` tool using the `imagegen` skill. These are original illustrations generated for Next, Please!, with no stock imagery or extracted game assets and no separate third-party asset license. The approved clinic and original patient serve only as style references. All runtime assets are local; generation is an offline production step.

## Patient portraits

The 25 new portraits are separate built-in generation requests, not recolored versions of the original three characters. Exact prompts, in ID order, are retained in [`public/assets/art/patients-source/prompts.json`](../public/assets/art/patients-source/prompts.json). Each request uses `transparent_background: true` and references the viewed original [`patient-0.png`](../public/assets/art/sprites/patient-0.png). No image-generation API or CLI fallback was used.

Unmodified generated sources are `public/assets/art/patients-source/patient-01.png` through `patient-25.png`. Runtime copies are `public/assets/art/sprites/patient-01.png` through `patient-25.png`, all 94 × 96 pixels with alpha. Distinct hair, facial structure, age and period clothing provide recognizable identities. They face the doctor with forearms and folded hands along the bottom edge, preserving the existing seated pose and cabinet handoff area. The original three portraits remain unchanged.

| IDs | Depicted age and sex, in order |
| --- | --- |
| 01–05 | woman 26; man 53; woman 41; man 30; woman 59 |
| 06–10 | man 44; woman 33; man 61; woman 47; man 24 |
| 11–15 | woman 38; man 49; woman 55; man 36; woman 22 |
| 16–20 | man 57; woman 45; man 28; woman 63; man 40 |
| 21–25 | woman 31; man 52; woman 43; man 34; woman 50 |

## Evening at home

The original source is `public/assets/art/home-evening-source.png`; the runtime background is `public/assets/art/home-evening.png`, 570 × 320 pixels. The exact prompt is retained in [`public/assets/art/patients-source/home-prompt.txt`](../public/assets/art/patients-source/home-prompt.txt). The request uses `transparent_background: false` and the viewed [`title-clinic.png`](../public/assets/art/title-clinic.png) as a palette and rendering reference.

The modest domestic interior uses the established charcoal, olive, walnut and aged-paper palette with restrained warm evening light. Its left 60 percent is reserved for localized typewritten report text; furniture and everyday household objects occupy the right. Generated artwork contains no report labels, numbers, dates or currency marks. The scene establishes neither a country nor the doctor's household relationships.

## Preparation and verification

Run from the repository root:

```sh
node scripts/prepare-economy-art.mjs /absolute/path/to/node_modules/sharp
```

Sharp is used only for offline asset preparation and is not a runtime dependency. The recipe preserves source PNGs, finds each portrait's visible alpha bounds using the established alpha > 8 margin rule, and resizes that crop to 94 × 96 with nearest-neighbor sampling. Alpha within the crop is preserved. The full home composition is resized to 570 × 320 with nearest-neighbor sampling. No shapes, clothing, faces, furniture or decorative pixels are invented by the recipe.

Runtime portraits are visually inspected in a contact sheet against a dark clinic-colored background for head scale, complete silhouettes, alpha and readable facial differences. The home composition is inspected at native resolution and with its typed report in the application. Canvas rendering retains integer coordinates and disables smoothing.

The [complete roster contact sheet](patients-roster-screen.png) shows the 25 runtime portraits in ID order, five per row, at exactly 2× nearest-neighbor enlargement. Every runtime portrait was checked as 94 × 96 with alpha; all 25 have distinct file hashes. The home image was verified as 570 × 320. The dark left wall remains clear through x = 336 for the report and its keyboard-accessible action.
