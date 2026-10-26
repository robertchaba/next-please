# Patient portraits 51–75

Created on 26 October 2026 with the built-in `image_gen` tool and the imagegen skill, one separate generation request per portrait. The viewed `public/assets/art/patients-source/patient-01.png` supplies style, pose and lighting only. Each subject is a new fictional adult, with ordinary clothing compatible with the established 1983 analog clinic atmosphere. No country or fixed occupation is established by the illustrations.

These are original generated project assets, without acquired stock images, extracted game artwork or a separate third-party asset license. Use and redistribution follow the applicable OpenAI terms for generated outputs and the project's terms; the repository declares no open-source license, and this record grants no separate public license. Preserve [Robert Chaba's creator credit](https://github.com/robertchaba). No API or CLI generation fallback was used.

## Retained deliverables

- Original generated PNGs: `public/assets/art/patients-source/patient-51.png` through `patient-75.png`.
- Exact prompts, intended ages, names and reference: [`prompts-51-75.json`](../public/assets/art/patients-source/prompts-51-75.json). All calls request genuine transparency.
- Runtime sprites: `public/assets/art/sprites/patient-51.png` through `patient-75.png`, 94 × 96 pixels with alpha.
- [Review contact sheet](patients-51-75-roster-screen.png), IDs 51–75 from left to right, five per row, at integer 2× enlargement.

## Portrait identities

Ages below are completed years on 3 November 1983. Names appear identically in both localized dictionaries; birth dates and sex agree across each character's nine cases. Character IDs are 53–77. Case IDs 328–552 append after every established record, including the earlier general-examination variants.

| Portrait | Name | Age | Sex |
| --- | --- | ---: | --- |
| 51 | Wanda Czapla | 28 | female |
| 52 | Sylwester Dąb | 43 | male |
| 53 | Regina Kurek | 57 | female |
| 54 | Artur Jeż | 24 | male |
| 55 | Joanna Kalina | 36 | female |
| 56 | Marian Głóg | 62 | male |
| 57 | Alina Rosa | 49 | female |
| 58 | Rafał Sitar | 31 | male |
| 59 | Lucyna Wrzos | 54 | female |
| 60 | Hubert Cichy | 40 | male |
| 61 | Kinga Rój | 22 | female |
| 62 | Tadeusz Kania | 59 | male |
| 63 | Genowefa Biel | 46 | female |
| 64 | Łukasz Bór | 34 | male |
| 65 | Janina Cedro | 64 | female |
| 66 | Oskar Brzeg | 27 | male |
| 67 | Sabina Ruda | 51 | female |
| 68 | Bartosz Kret | 38 | male |
| 69 | Aniela Drozd | 60 | female |
| 70 | Józef Czerwiak | 45 | male |
| 71 | Dorota Gaj | 29 | female |
| 72 | Ignacy Duda | 55 | male |
| 73 | Agata Sikora | 42 | female |
| 74 | Daniel Rzepka | 25 | male |
| 75 | Gabriela Żyto | 48 | female |

## Reproducible preparation

```sh
node scripts/prepare-patient-expansion-art.mjs /absolute/path/to/node_modules/sharp 51
```

Sharp is an offline preparation tool, not a runtime dependency. The recipe bounds visible source pixels at alpha > 8, crops the surrounding transparent margin and resizes that crop to 94 × 96 with nearest-neighbor sampling. Alpha within the crop is preserved; no face, clothing or decorative pixels are painted by code. The original sources remain unchanged. The neutral contact-sheet background is a review aid, never a game asset.

## Integration and validation

The renderer loads each unique portrait from the patient catalog. New workday queues contain all 78 identities once; saved 28- and 53-person queues retain their original cases and ordering until the next workday. Save version 13 preserves the existing state shape and adds the catalog bounds; versions 1–12 retain strict historical validation. See [the catalog](patient-catalog.md) and [the save contract](save-format.md).

All 25 sources and runtime sprites were checked for alpha. Runtime sprites are exactly 94 × 96, retain transparent outer corners and have 25 distinct pixel hashes. Their total runtime PNG size is 417,183 bytes. The complete contact sheet was visually inspected for full hair/shoulder silhouettes, folded hands, scale, palette and distinguishable portraits. Generated source files are retained unmodified.

Validation completed: `npm run build`; all 297 Vitest tests; 25 Playwright checks across patient expansion, patient interaction, session/save restoration, home flow and welcome. The new browser test imports and displays every new identity, compares the 25 rendered portrait regions, exercises PL/EN and checks for missing artwork responses. Existing font and paperwork tests cover Polish glyphs and name widths in both dictionaries.
