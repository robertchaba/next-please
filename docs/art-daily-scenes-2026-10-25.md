# Daily life and weekend scenes

Created on 25 October 2026 with the built-in `image_gen` tool and `imagegen` skill. Five separate generation calls supplied original illustrations for Next, Please!; no CLI/API fallback, stock imagery or extracted game art was used. The approved `title-clinic.png` and existing `home-evening.png` were inspected for style and layout. The prompts describe the title scene as the visual reference. All calls used `transparent_background: false`.

## Retained source, prompts and runtime files

The complete, exact prompt set is retained in [`public/assets/art/daily-scenes-source/prompts.json`](../public/assets/art/daily-scenes-source/prompts.json). Unmodified source PNGs are beside it. These files are original generated project assets, not third-party licensed stock; no extra acquired-asset attribution or redistribution terms apply.

| Scene | Retained generated source | Runtime file, 570 × 320 |
| --- | --- | --- |
| Return home | `daily-scenes-source/homecoming.png` | `public/assets/art/homecoming.png` |
| Journey to work | `daily-scenes-source/going-to-work.png` | `public/assets/art/going-to-work.png` |
| Weekend household budget | `daily-scenes-source/weekend-budget.png` | `public/assets/art/weekend-budget.png` |
| Mountain resort | `daily-scenes-source/mountain-resort.png` | `public/assets/art/weekend-mountain-resort.png` |
| Seaside resort | `daily-scenes-source/seaside-resort.png` | `public/assets/art/weekend-seaside-resort.png` |

The mountain and seaside runtime files were renamed with the `weekend-` prefix on 30 October 2026. Original source filenames and generation prompts remain unchanged; the preparation recipe maps them to the current runtime names.

Source paths in the table are relative to `public/assets/art/`. The original evening room remains unchanged and supplies the weekday budget and ordinary expense cards. Generated scenes contain no localized writing, place names, dates, country identifiers or user-interface drawings. They do not establish household relationships or a named resort.

The five images retain the clinic's charcoal/olive palette, hard pixel clusters, worn ordinary materials and restrained warm light. Domestic objects and architecture occupy the right side; the left is quiet enough for larger localized comments and numbers. The late-autumn resorts have no distinctive real-world landmarks.

## Preparation

```sh
node scripts/prepare-daily-scenes.mjs /absolute/path/to/node_modules/sharp
```

Sharp is an offline production utility, not a runtime dependency. The recipe resizes each full generated composition to 570 × 320 using nearest-neighbor sampling. It does not draw or replace objects, invent geometry, recolor the scene or modify the retained sources. Runtime loading is entirely local through `src/render/clinic.ts`; rendering only composites those images, localized lettering and keyboard focus.

The sequence is return home / weekend morning, optional saved event, brief budget, then a departure card if the next day is a workday. The departure card uses the next day's date. The five-row budget and all comments use the document font at integer 2×; the title uses the title font at 2×. Typing/reveal and reduced-motion behavior share the existing introduction machinery. Reading cards, pausing or importing the same settlement never rerolls an event or changes its cost.

## Verification

Both language layouts were measured at native resolution, including every event comment, long Polish labels and maximum supported monetary values. Playwright covers arrival, typewriter reveal on each card, weekday budget, weekend mountain event and budget, next-workday departure, focus, reduced motion, music separation and save/import behavior. The full-size scene previews and runtime screenshots were visually inspected; illustrations remain legible behind the enlarged text.

Review captures: [`home-budget-large-pl-screen.png`](home-budget-large-pl-screen.png), [`home-weekend-budget-screen.png`](home-weekend-budget-screen.png), [`home-mountain-event-screen.png`](home-mountain-event-screen.png), [`home-return-screen.png`](home-return-screen.png), [`home-work-screen.png`](home-work-screen.png). Both budget captures were refreshed in 1.0.10 with the [replacement notebook-and-pen artwork](art-budget-scenes-2026-11-02.md); the kitchen illustration remains available for domestic arrivals and events.
