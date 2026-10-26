# Modest weekend scene

Created on 26 October 2026 with the built-in `image_gen` tool using the imagegen skill. This is a new original project illustration; the existing `weekend-budget.png` was inspected as a style and composition reference. No stock imagery, copied game assets, API/CLI generation fallback or additional third-party license was used. The country remains unspecified.

- Exact prompt: [weekend-modest.txt](art-prompts/weekend-modest.txt).
- Retained unmodified generated source: [daily-scenes-source/weekend-modest.png](../public/assets/art/daily-scenes-source/weekend-modest.png).
- Runtime asset: [weekend-modest.png](../public/assets/art/weekend-modest.png), 570 × 320, opaque PNG.
- Preparation: `node scripts/prepare-daily-scenes.mjs /absolute/path/to/node_modules/sharp`. Only full-composition nearest-neighbor resizing; no illustrated objects are drawn or replaced by code. Sharp is an offline utility, not a project dependency.

The right side shows a plain potato, bread, weak tea, an empty wallet and a cardigan in a worn kitchen by a rainy window. The quiet dark left side accommodates the localized comment. The illustration contains no writing or location identifiers. The saved `settlement.weekend.modest` flag selects this picture and its comment for the Saturday/Sunday arrival card; ordinary weekends retain their existing picture. Budget and departure cards retain their established layouts.

Polish comment: “Wczasy pod gruszą. Gruszkę zjedzono w piątek. Został widok na ścianę.” English comment: “A weekend under the pear tree. The pear was Friday’s dinner. Enjoy the wall view.” Both comments and accessible illustration descriptions live in `src/i18n.ts` and use the original local bitmap font. Rendering never chooses a financial mode or consumes random values.

Verification: the runtime PNG and both browser screenshots were inspected at whole-number scale. The build, 354 Vitest checks and 21 relevant Playwright checks passed, covering affordability, debt protection, legacy migration, persisted Sunday plans, both languages and native text widths. Review captures: [Polish](home-weekend-modest-pl-screen.png), [English](home-weekend-modest-en-screen.png).
