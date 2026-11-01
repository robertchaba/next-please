# ZUS inspections, archive covers and patients 101–110 — 2026-10-27

All artwork in this batch was created specifically for Next, Please! using the built-in OpenAI `image_gen` tool through the imagegen skill. Each asset was generated in a separate request with true transparent alpha. The approved cabinet, existing patient portrait and paper sprite were inspected as style references: restrained olive, charcoal, worn cream and brown, hard pixel edges, subdued warm light, frontal seated portraits. No acquired stock images, real credentials, copied characters or external runtime image sources were used.

These are original generated game assets. There is no separate third-party asset attribution or redistribution requirement; use and redistribution follow the applicable OpenAI terms for generated outputs. The identity card and fine are invented game props, with no replica government insignia. All words, names, dates and amounts remain separately localized by the game. Robert Chaba's existing creator credit is unchanged.

The penalty-notice design below is historical. Version 1.0.2 replaces its ornamental border with [generated perforated carbon-copy paper](art-endings-and-fine-2026-11-01.md); the original source remains archived.

## Files

Paths below are relative to `public/assets/art/`.

| Runtime asset | Retained source | Native size |
| --- | --- | --- |
| `sprites/zus-inspector-1.png` | `zus-inspector-1-source.png` | 94 × 96 |
| `sprites/zus-inspector-2.png` | `zus-inspector-2-source.png` | 94 × 96 |
| `sprites/zus-inspector-3.png` | `zus-inspector-3-source.png` | 94 × 96 |
| `sprites/inspector-id.png` | `inspector-id-v2-source.png` | 188 × 112 |
| `sprites/inspection-fine.png` | `inspection-fine-source.png` | 188 × 144 |
| `sprites/archive-folder.png` | `archive-folder-source.png` | 116 × 72 |
| `sprites/patient-101.png`–`sprites/patient-110.png` | `patients-source/patient-101.png`–`patients-source/patient-110.png` | 94 × 96 each |

The first identity-booklet draft is retained as `inspector-id-source.png`; it is not loaded by the game. Its generic baked portrait and center fold were superseded by the single flat card with an empty photo mounting area, allowing the correct inspector portrait to be composited at runtime. The approved card has a portrait frame at approximately x10–54, y15–79 and a clean text area at x65–176, y12–99. Its faint circular motif is an abstract decorative guilloche, not a real seal. The fine has a double burgundy border, restrained ornaments and a perforated lower edge; keep localized copy inside x9–177, y13–130. The archive folder has a cream name strip near x8–107, y9–17 for overlapping covers and hover/focus selection.

## Characters

The three inspectors are distinct: a middle-aged man in a three-piece suit with round glasses and a moustache; a woman with dark glasses and a tied ivory blouse; an older balding clean-shaven man. Their configured game identities are Marian Zawadzki, Irena Borucka and Tadeusz Radecki, respectively.

| Portrait | Visual direction | Intended age |
| --- | --- | --- |
| 101 | Woman, brown hair, muted green cardigan and cream blouse | 26 |
| 102 | Man, short dark hair and stubble, faded work shirt and canvas vest | 38 |
| 103 | Woman, dark practical curls, brown dress and muted plum shawl | 54 |
| 104 | Man, white hair and moustache, spectacles, tweed jacket and sweater | 63 |
| 105 | Woman, dark hair pulled back, cream blouse and charcoal cardigan | 34 |
| 106 | Man, reddish-brown hair and moustache, worn workshop jacket | 47 |
| 107 | Woman, gray hair, olive sweater and dark scarf | 60 |
| 108 | Man, wavy dark hair, tan casual jacket over a dark shirt | 25 |
| 109 | Woman, dark bob and large glasses, plain laboratory coat | 43 |
| 110 | Man, cropped gray hair, dark waistcoat and off-white shirt | 55 |

The ten added portraits are civilian; none adds a militia or pilot uniform or changes the existing seventh-working-day access rule. Character IDs 103–112 correspond to portrait filenames 101–110 because the first three legacy portraits use distinct unpadded filenames. Their five identities per portrait are specified separately in the patient catalog.

## Exact prompts

Every executed prompt is retained as plain text in [art-prompts/inspection](art-prompts/inspection/):

- `zus-inspector-1.txt`, `zus-inspector-2.txt`, `zus-inspector-3.txt`.
- `inspector-id.txt` (retained unused booklet draft) and `inspector-id-v2.txt` (approved flat blank-photo card).
- `inspection-fine.txt` and `archive-folder.txt`.
- `patient-101.txt` through `patient-110.txt`.

All requests used the built-in tool with `transparent_background: true`, without the CLI fallback, external APIs or image-model dependencies in the project.

## Reproduction and inspection

The generated originals were copied from the built-in generator's `.codex/generated_images` output into the source paths above. Run [the offline preparation recipe](../scripts/prepare-inspection-art.mjs) with Sharp installed outside the runtime project:

```sh
node scripts/prepare-inspection-art.mjs /absolute/path/to/node_modules/sharp
```

The recipe locates each source's nontrivial alpha bounds, ignoring alpha ≤8 only while finding the crop, preserves generated alpha inside that crop, and resizes with nearest-neighbor sampling. It does not repaint, recolor, synthesize geometry or add illustration detail. The approved flat card supersedes the original booklet without deleting its source. Missing sources are explicitly reported so the same recipe can prepare intermediate generation batches.

All sixteen final sprites were inspected at native scale or 2×. [The contact sheet](inspection-patients-roster-screen.png) shows all thirteen portraits in order: three inspectors, then patients 101–110. The review sheet's neutral background is not loaded by the game. Runtime assets retain alpha and integer logical dimensions; the game supplies localized text, corresponding identity portraits and state-dependent marks.

Integrated game previews: [identity card](inspection-id-screen.png), [penalty notice](inspection-fine-screen.png), [drawer preview](drawer-preview-screen.png), and [closing balance](home-balance-screen.png). These screenshots use the real localized Canvas and aligned semantic controls after browser verification.
