# Rulebook artwork — 0.8.3

The portrait rulebook cover, open spread and page-turn folds were generated specifically for Next, Please! with the built-in `image_gen` tool and the `imagegen` skill on 2026-10-28. No CLI/API fallback, stock asset, copied game artwork, external font or runtime service was used. These project-generated illustrations have no separate acquired-asset license or attribution requirement. Robert Chaba's creator credit remains unchanged.

The approved `title-clinic.png` was supplied as a style/palette reference for the cover and spread. Both have the same unnamed analog clinic setting: worn olive cloth, subtle ochre details and warm cream paper. The unlettered cover has a small original embossed sprig, without a national emblem. The open pages reserve quiet light areas for localized text. All generated lettering is deliberately absent. The paper corner was generated separately against transparent alpha.

| Asset | Retained source | Source size | Runtime sprite |
| --- | --- | --- | --- |
| Portrait cover | `public/assets/art/manual-cover-v083-source.png` | 1151 × 1366 | `sprites/manual-cover-v083.png`, 138 × 164 |
| Open spread | `public/assets/art/manual-spread-v083-source.png` | 1627 × 967 | `sprites/manual-spread-v083.png`, 276 × 164 |
| Folded paper corner | `public/assets/art/manual-corner-v083-source.png` | 1254 × 1254 | `sprites/manual-corner-right-v083.png` and mirrored `manual-corner-left-v083.png`, 9 × 9 each |

Exact prompts are retained in [manual-cover.txt](art-prompts/v0.8.3/manual-cover.txt), [manual-spread.txt](art-prompts/v0.8.3/manual-spread.txt) and [manual-corner.txt](art-prompts/v0.8.3/manual-corner.txt).

Preparation is reproducible with:

```sh
node scripts/prepare-manual-v083-art.mjs /absolute/path/to/node_modules/sharp
```

The script crops transparent margins using alpha > 8 only for bounds detection, preserves generated alpha, resizes using nearest-neighbor sampling, and mirrors the right fold for the left page. Recorded source crops are cover `(66,66,1019,1253)`, spread `(28,32,1571,906)`, corner `(0,0,1059,1215)`. Sharp is an offline preparation tool, not a runtime dependency. No paper, grain, ornament or folded corner is redrawn by Canvas code.

`src/render/manual.ts` composites the loaded sprites. The established generated compact closed-book silhouette remains on the left shelf and while carrying. The full portrait cover keeps its footprint; the open spread is composited at 300 × 180 with nearest-neighbor sampling. Page-turn controls follow its corners. The original document alphabet from `0732752^` prints the provision numbers at integer 2× and the uppercase titles at 1×. The upright original reading typewriter face carries the complete body text, reflowed into at most ten lines per 114-pixel column at eight-pixel leading. Small typewriter text is reserved for page count and edition label. Later supplements have muted brick-red headings. The outside margins are 22 pixels and binding margins are 14 pixels. Body lettering stops before the footer; folios are centered on each page at y + 146, above the printed bottom ornament and clear of the paper edge. Text remains in both dictionaries; no rule thresholds, keyboard interactions, supplement availability, save fields or localization contracts change.

The prepared cover and spread were inspected at native resolution. `npm run build`, 15 focused manual/font unit checks and both PL/EN manual browser checks passed. Browser checks cover edition progression, accessible copy and keyboard navigation. The new appearance is recorded in [the Polish additional-examination annex](manual-v083-pl-screen.png) and [the English specialist erratum](manual-v083-en-screen.png).
