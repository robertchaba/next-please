# Return-home scenes — introduced in 1.0.9

Four original return-home illustrations were created on 1 November 2026 with the built-in `image_gen` tool and the `imagegen` skill. The approved hallway, evening room, radio and kitchen were inspected before generation. No stock assets, extracted game art or API/CLI generation fallback were used.

The four budget illustrations originally delivered alongside them were rejected and removed in 1.0.10, including their source/reference images. The entire former budget pool is superseded by the [minimal notebook-and-pen catalog](art-budget-scenes-2026-11-02.md). This page and its galleries now cover the retained home scenes only.

## Active home catalog

All runtime images are opaque 570 × 320 PNGs under `public/assets/art/`.

| New file | Role | Scene |
| --- | --- | --- |
| `home-stairwell.png` | Weekday arrival | Worn stairs and warm light through an apartment door |
| `home-courtyard.png` | Weekday arrival | Courtyard entrance at dusk, bicycle and damp paving |
| `home-supper.png` | Weekday arrival | Soup, bread and tea at the kitchen table |
| `home-kettle.png` | Weekday arrival | Steaming enamel kettle on an old stove |

Weekday arrivals also use the original `homecoming`, `weekend-budget`, `weekend-reading`, `weekend-radio` and `weekend-soup` images. These nine options are available all year. `weekend-rain-tram` is the tenth option in March–April and September–November, using the same season window as weekends. Each of the four new and five reused domestic/transit scenes has two weekday-specific comments in Polish and English under `home.arrivalSceneComments`; the hallway keeps its twelve original comments. Weekday text does not claim the doctor had no admissions that day.

Weekend arrival selection keeps its established priorities: modest meal, saved trip, first other expense, then ordinary seasonal scene. It retains its existing captions and season windows. Expense events, payments, timings, costs and ending priorities are unchanged. Departures always use `going-to-work.png`; hospital and cloakroom endings retain their artwork. These are presentation changes, not new events or world facts.

## Selection and persistence

`src/scenes/home-art.ts` chooses weekday arrival artwork from saved RNG bits shifted by eight plus the day. Weekday captions use bits shifted by sixteen, separately from scene choice, so both variants remain reachable. Weekend arrival selection stays in `src/scenes/weekend.ts`.

No selection advances the RNG, reads the host clock, mutates game state, adds costs or writes preferences. Language changes, repainting and importing the same settled save preserve the image and caption. Separate days may repeat an image; no cross-day appearance history is stored. Save format v36 is unchanged.

## Sources, exact prompts and preparation

- [Exact generation prompts](art-prompts/home-scenes-2026-11-01.json): one built-in call per retained arrival image, with `transparent_background: false`.
- [Retained source directory](../public/assets/art/home-scenes-source/): four unmodified final generator originals.
- [Preparation recipe](../scripts/prepare-home-scenes.mjs): full-composition nearest-neighbor resizing only; now prepares only the retained arrivals.
- [Gallery recipe](../scripts/preview-home-scenes.mjs): assembles actual browser captures at native resolution, without adding illustration or text.
- [Retired budget prompts](art-prompts/retired-budget-scenes-2026-11-01.json): text-only production history; their image files have been removed.

These are original generated project assets; no separate acquired-asset license or attribution applies. The generator's original output files were left in place. Sharp is an offline preparation utility, not a package or runtime dependency.

## Review

The 1.0.10 check reruns the home, weekend, budget, localization and release tests and refreshes these galleries. See the [current budget verification record](art-budget-scenes-2026-11-02.md#review).

Gallery order: four new arrivals, reused radio/reading/soup/tram arrivals, then the retained kitchen arrival. Each tile is a real 570 × 320 game capture with keyboard focus. The empty last tile only fills the two-column contact sheet.

![Home scenes in Polish](home-scenes-pl-2026-11-01.png)

![Home scenes in English](home-scenes-en-2026-11-01.png)
