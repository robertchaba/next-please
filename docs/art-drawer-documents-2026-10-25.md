# Generated drawer, calendar and ink — 2026-10-25

Eight original assets were generated separately with the built-in OpenAI `image_gen` tool using the imagegen skill. The existing cabinet and blank paper were inspected as visual references. All files are local; no remote asset dependency is added. The sources remain alongside runtime art.

These are original generated assets created specifically for this project. There is no acquired third-party asset license or attribution requirement; use and redistribution follow the applicable OpenAI terms for generated outputs. The fictitious signature is anonymous and the round seal has no real institutional identity.

## Files and preparation

| Asset | Source in `public/assets/art/` | Runtime path in that directory | Size |
| --- | --- | --- | --- |
| Empty wooden drawer | `drawer-interior-source.png` | `drawer-interior.png` | 570 × 320 |
| Desk calendar ([current revision](art-calendar-revision-2026-10-25.md); earlier sources retained) | `workstation-calendar-muted-source.png` | `sprites/workstation-calendar.png` | 48 × 40 |
| Fit, Polish | `imprint-fit-pl-source.png` | `sprites/imprint-fit-pl.png` | 116 × 32 |
| Unfit, Polish | `imprint-unfit-pl-source.png` | `sprites/imprint-unfit-pl.png` | 116 × 32 |
| Fit, English | `imprint-fit-en-source.png` | `sprites/imprint-fit-en.png` | 116 × 32 |
| Unfit, English | `imprint-unfit-en-source.png` | `sprites/imprint-unfit-en.png` | 116 × 32 |
| Round seal | `document-seal-source.png` | `sprites/document-seal.png` | 24 × 24 |
| Anonymous signature | `document-signature-source.png` | `sprites/document-signature.png` | 46 × 12 |

Preparation is reproducible with [the offline script](../scripts/prepare-drawer-documents-art.mjs):

```sh
node scripts/prepare-drawer-documents-art.mjs /absolute/path/to/node_modules/sharp
```

The drawer is resized directly. Other sources are cropped to alpha bounds (alpha at or below 8 is ignored only while locating the crop), then resized with nearest-neighbor sampling. Original alpha within the crop is preserved; there is no repainting, recoloring or synthesized detail. Sharp is an offline preparation tool, not a runtime dependency.

Calendar lettering is rendered in the local font, derived from the saved game day: day one is 3 November 1983. The [revised calendar](art-calendar-revision-2026-10-25.md) now sits at (349,118), 48 × 40, projecting slightly above the rear desk edge. Its darker beige paper displays only a small month and larger day in dark ink using the compact document font, without the year. The original source and prompt below remain archived. Documents retain their issue dates. The four localized decision impressions intentionally embed their short PL/EN words in generated distressed ink; their meaning also exists in both dictionaries and accessible descriptions. All other captions remain separately localized.

Visual review covered all four impressions, referrals, notes, letters and calendar in both languages at native resolution and 2×. The note seal was moved clear of its horizontal rule, and the drawer rim has no visible close caption. Printed Signature/Podpis captions were also removed; generated signatures and accessible descriptions remain. Native previews: [drawer](drawer-screen.png), [calendar](workstation-calendar-screen.png), [referral](paperwork-dated-pl-screen.png), [Polish certificate](certificate-imprint-pl-screen.png), [English certificate](certificate-imprint-en-screen.png).

## Exact generation prompts

### drawer-interior

Transparency requested: false.

```text
Use case: stylized-concept. Asset for original low-resolution 2D pixel-art occupational-health clinic game Next, Please!, set in 1983, unspecified country. Muted worn institutional olive, charcoal, brown wood, dirty cream, brick red. Crisp pixel clusters and sharp edges, no vector appearance, no smooth gradients, no modern objects, no stock logos or watermarks.
Generate a new full-screen background illustration: a directly top-down closeup inside an EMPTY pulled-out dark walnut desk drawer, landscape 570:320 aspect ratio. Heavy worn wooden rim at edges, brown aged wooden interior floor with subtle horizontal grain. Drawer fills entire image. One narrow vertical wooden divider at 75 percent width (logical x425 out of570), leaving a large EMPTY document compartment on left and narrower EMPTY tools compartment on right. All interior space y30..274 stays flat, dim yet readable. A thick wooden front lip spans bottom y282..319 with small central brass pull inset. Composition perfectly front-facing top-down, no perspective convergence; very restrained texture, space for overlaying actual documents. NO objects, NO papers, NO letters, NO symbols, NO text or dates. Final viewport exactly 570x320; preserve chunky 1-3 pixel clustered details at that resolution.
```

### workstation-calendar

Transparency requested: true.

```text
Use case: stylized-concept. Asset for original low-resolution 2D pixel-art occupational-health clinic game Next, Please!, set in 1983, unspecified country. Muted worn institutional olive, charcoal, brown wood, dirty cream, brick red. Crisp pixel clusters and sharp edges, no vector appearance, no smooth gradients, no modern objects, no stock logos or watermarks.
Generate a SINGLE small desktop tear-off calendar/date stand sprite, isolated on fully transparent background. Original period 1983 clinic stationery: squat worn dark olive metal or brown bakelite wedge base, straight-on upright front, slightly visible right side and base, twin small dark steel binder rings at top, one aged CREAM BLANK page with clean rectangular area occupying most of front. Page faces viewer flat and almost orthogonal so game code can put readable type on it. Silhouette wider than tall (target sprite 52x44 pixels). Wide blank paper face from 15% to 85% width and 18% to75% height. Only a few strong pixel details; no writing, no numbers, no words, no modern UI, no cast background. True transparent alpha.
```

### imprint-fit-pl

Transparency requested: true.

```text
Use case: stylized-concept. Asset for original low-resolution 2D pixel-art occupational-health clinic game Next, Please!, set in 1983, unspecified country. Muted worn institutional olive, charcoal, brown wood, dirty cream, brick red. Crisp pixel clusters and sharp edges, no vector appearance, no smooth gradients, no modern objects, no stock logos or watermarks.
Generate a SINGLE flat rubber-stamp INK IMPRESSION, not the rubber stamp object, for a medical work-fitness certificate. Isolated true transparent alpha background, NO paper or backdrop. Wide horizontal rectangular frame, proportions 116:32, entirely faded dark desaturated olive green #4e674e ink, double thin imperfect ruled border, readable bold condensed upright uppercase lettering centered inside. EXACT text and ONLY text: "ZDOLNY". Spelling must be perfect. Lettering tall and broad and very legible after downsampling to 116x32 pixels. Dry uneven mechanical rubber ink, broken tiny edge flecks, small naturally missed ink spots but do not compromise letter identification. Subtle one-degree imperfect alignment already baked in, no dramatic angle, ample transparent padding around entire impression. Vintage simple clinical authority, no stars, no emblems, no dates, no secondary text, no decorations.
```

### imprint-unfit-pl

Transparency requested: true.

```text
Use case: stylized-concept. Asset for original low-resolution 2D pixel-art occupational-health clinic game Next, Please!, set in 1983, unspecified country. Muted worn institutional olive, charcoal, brown wood, dirty cream, brick red. Crisp pixel clusters and sharp edges, no vector appearance, no smooth gradients, no modern objects, no stock logos or watermarks.
Generate a SINGLE flat rubber-stamp INK IMPRESSION, not the rubber stamp object, for a medical work-fitness certificate. Isolated true transparent alpha background, NO paper or backdrop. Wide horizontal rectangular frame, proportions 116:32, entirely faded oxblood brick red #914c3c ink, double thin imperfect ruled border, readable bold condensed upright uppercase lettering centered inside. EXACT text and ONLY text: "NIEZDOLNY". Spelling must be perfect. Lettering tall and broad and very legible after downsampling to 116x32 pixels. Dry uneven mechanical rubber ink, broken tiny edge flecks, small naturally missed ink spots but do not compromise letter identification. Subtle one-degree imperfect alignment already baked in, no dramatic angle, ample transparent padding around entire impression. Vintage simple clinical authority, no stars, no emblems, no dates, no secondary text, no decorations.
```

### imprint-fit-en

Transparency requested: true.

```text
Use case: stylized-concept. Asset for original low-resolution 2D pixel-art occupational-health clinic game Next, Please!, set in 1983, unspecified country. Muted worn institutional olive, charcoal, brown wood, dirty cream, brick red. Crisp pixel clusters and sharp edges, no vector appearance, no smooth gradients, no modern objects, no stock logos or watermarks.
Generate a SINGLE flat rubber-stamp INK IMPRESSION, not the rubber stamp object, for a medical work-fitness certificate. Isolated true transparent alpha background, NO paper or backdrop. Wide horizontal rectangular frame, proportions 116:32, entirely faded dark desaturated olive green #4e674e ink, double thin imperfect ruled border, readable bold condensed upright uppercase lettering centered inside. EXACT text and ONLY text: "FIT". Spelling must be perfect. Lettering tall and broad and very legible after downsampling to 116x32 pixels. Dry uneven mechanical rubber ink, broken tiny edge flecks, small naturally missed ink spots but do not compromise letter identification. Subtle one-degree imperfect alignment already baked in, no dramatic angle, ample transparent padding around entire impression. Vintage simple clinical authority, no stars, no emblems, no dates, no secondary text, no decorations.
```

### imprint-unfit-en

Transparency requested: true.

```text
Use case: stylized-concept. Asset for original low-resolution 2D pixel-art occupational-health clinic game Next, Please!, set in 1983, unspecified country. Muted worn institutional olive, charcoal, brown wood, dirty cream, brick red. Crisp pixel clusters and sharp edges, no vector appearance, no smooth gradients, no modern objects, no stock logos or watermarks.
Generate a SINGLE flat rubber-stamp INK IMPRESSION, not the rubber stamp object, for a medical work-fitness certificate. Isolated true transparent alpha background, NO paper or backdrop. Wide horizontal rectangular frame, proportions 116:32, entirely faded oxblood brick red #914c3c ink, double thin imperfect ruled border, readable bold condensed upright uppercase lettering centered inside. EXACT text and ONLY text: "UNFIT". Spelling must be perfect. Lettering tall and broad and very legible after downsampling to 116x32 pixels. Dry uneven mechanical rubber ink, broken tiny edge flecks, small naturally missed ink spots but do not compromise letter identification. Subtle one-degree imperfect alignment already baked in, no dramatic angle, ample transparent padding around entire impression. Vintage simple clinical authority, no stars, no emblems, no dates, no secondary text, no decorations.
```

### document-seal

Transparency requested: true.

```text
Use case: stylized-concept. Asset for original low-resolution 2D pixel-art occupational-health clinic game Next, Please!, set in 1983, unspecified country. Muted worn institutional olive, charcoal, brown wood, dirty cream, brick red. Crisp pixel clusters and sharp edges, no vector appearance, no smooth gradients, no modern objects, no stock logos or watermarks.
Generate a SINGLE small circular bureaucratic ink seal impression for a clinic paper, isolated on true transparent alpha background, not on paper. Two thin concentric imperfect circular ink rings and a small simple four-armed medical plus at center. Tiny worn anonymous dash-like unreadable marks along lower arc. Faded muted blue-violet fountain/stamp ink, uneven pressure, naturally broken rings, period office texture. At final 24x24 pixel size still clearly reads as a circular authenticating stamp. NO legible letters, NO names, NO country, NO flags, NO emblem of existing authority, no dates, no border outside seal.
```

### document-signature

Transparency requested: true.

```text
Use case: stylized-concept. Asset for original low-resolution 2D pixel-art occupational-health clinic game Next, Please!, set in 1983, unspecified country. Muted worn institutional olive, charcoal, brown wood, dirty cream, brick red. Crisp pixel clusters and sharp edges, no vector appearance, no smooth gradients, no modern objects, no stock logos or watermarks.
Generate a SINGLE anonymous handwritten signature ink mark for an imaginary 1983 clinic document, isolated on true transparent alpha. Wide compact connected illegible cursive pen flourish with 2 larger initial loops and a modest underline tail; muted blue-black fountain pen ink, natural varied pressure and slightly broken dry ink, very sparse but readable as an actual hand signature at final 46x12 pixels. Fully fictional non-legible scribble, no real name, no readable text, no paper, no other objects, no shadow. Horizontal landscape proportions roughly 4:1.
```

