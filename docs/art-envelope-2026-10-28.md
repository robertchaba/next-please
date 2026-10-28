# Kraft envelope without an address window

Created for **Next, Please!** on 2026-10-28 using the built-in `image_gen` tool and `imagegen` skill. The user requested removal of the cream address window/label because localized text and institutional marks did not reliably fit its illustrated bounds.

The previous full-resolution [envelope source](../public/assets/art/paperwork-v083/envelope-source.png) was the edit target. The generated revision replaces the complete cream patch and its shadow with continuous warm kraft paper. It retains the upper flap, muted red stripe, empty postage outline, curled opening corner, worn edges and transparent exterior. No new text, location or institutional logo is embedded in the image.

- Exact prompt: [no-window.txt](art-prompts/envelope-revision/no-window.txt).
- Untouched generated source: [no-window-source.png](../public/assets/art/envelope-revision/no-window-source.png), 1433 × 1098.
- Runtime sprite: [paper-envelope-no-window.png](../public/assets/art/sprites/paper-envelope-no-window.png), 188 × 144.
- Recipe: [prepare-envelope-revision-art.mjs](../scripts/prepare-envelope-revision-art.mjs).

```sh
node scripts/prepare-envelope-revision-art.mjs /absolute/path/to/node_modules/sharp
```

The recipe identifies nonempty bounds with alpha > 8, crops `(49,89,1336,928)`, retains generated alpha inside that rectangle and resizes with nearest-neighbor sampling. It does not paint over the label or synthesize replacement texture. Sharp is an offline preparation tool, without a new project or runtime dependency. The old source, sprite and prompt remain archived; their original recipe cannot overwrite the new sprite.

`src/render/clinic.ts` loads the new local sprite for closed letters and directives at all existing sizes. Localized text and sender impressions remain separate overlays on the brown paper. The recipient line now uses the same dark ink as the sender to retain contrast on kraft paper. Document footprints, keyboard controls and opening-corner targets remain unchanged. Gameplay and save data are unchanged.

This is original generated project artwork edited from the project's own generated source. No third-party artwork was acquired and no separate stock license or attribution requirement was introduced. Robert Chaba's creator credit and https://github.com/robertchaba remain unchanged.

## Review and validation

The native sprite and in-game [Polish](envelope-no-window-pl-screen.png) and [English](envelope-no-window-en-screen.png) views were inspected. A separate render review covered Medical Chamber, ZUS, the longest Polish employer name, militia and LOT envelopes in both languages. All retain readable wording and distinct impressions without a bounded address panel. Keyboard opening was also checked after importing a day-seven Medical Chamber directive.

`npm run build` passed. The five focused Vitest files (`document-layout`, `paperwork`, `letters`, `progression-paperwork`, `font`) passed all 47 checks. The three Playwright suites (`stationery`, `paperwork`, `letter-delivery`) passed all 24 scenarios, including asset loading, envelope opening, delivery, carrying and disposal.
