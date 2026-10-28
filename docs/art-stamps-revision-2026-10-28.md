# Institutional ink impressions — revision, 2026-10-28

The three rubber-ink impressions were created specifically for **Next, Please!** using the built-in `image_gen` tool and the `imagegen` skill. This revision responds to the request for more convincing stamps, institutional headings and lettering rather than ornamental paper borders. No external artwork, stock image, copied credential template or real airline emblem was acquired. There is no separate acquired-asset license or attribution requirement.

Each image is an isolated impression with a genuine transparent exterior and interior. Localized words are intentionally omitted from the generated artwork and are composited at runtime so both languages remain readable at native resolution. The employer uses a distressed violet rectangle; the militia uses a navy double-ring oval; the LOT medical-office impression uses a navy rectangle and a tiny original wing motif. They establish no country and do not reproduce LOT's crane logo or any official national emblem.

| Asset | Source | Source size | Native image | Crop (left, top, width, height) |
| --- | --- | --- | --- | --- |
| Employer | `public/assets/art/stamps-revision/employer-source.png` | 2016 × 780 | `employer.png`, 62 × 24 | 82, 112, 1852, 554 |
| Militia | `public/assets/art/stamps-revision/militia-source.png` | 1619 × 971 | `militia.png`, 50 × 30 | 49, 58, 1523, 856 |
| Aviation office | `public/assets/art/stamps-revision/lot-source.png` | 2017 × 780 | `lot.png`, 62 × 24 | 57, 118, 1909, 541 |

All source and native files are in `public/assets/art/stamps-revision/`. The exact prompts are [employer](art-prompts/stamps-revision/employer.txt), [militia](art-prompts/stamps-revision/militia.txt) and [LOT](art-prompts/stamps-revision/lot.txt). Each asset was a separate built-in generation call, with no CLI/API fallback or reference-image input.

Preparation is reproducible with:

```sh
node scripts/prepare-stamps-revision-art.mjs /absolute/path/to/node_modules/sharp
```

The script detects crop bounds at alpha > 8, retains generated alpha inside the crop, and resizes with nearest-neighbor sampling. It does not paint synthetic distressed edges, seals or emblems. Sharp is an offline preparation tool rather than a project or runtime dependency. Sources remain untouched.

The native outputs were visually inspected and checked for dimensions and transparent centers. Suggested empty text areas are employer x5–57/y5–19; militia x9–41/y8–22; LOT x20–58/y5–19. All coordinates are relative to each native sprite. Main words should be readable original bitmap lettering; these larger footprints replace the earlier tiny decorative seal icons in the forms selected by the renderer. Runtime placement, localized imprint words and missing/unclear authentication behavior are described in the main document-design record.
