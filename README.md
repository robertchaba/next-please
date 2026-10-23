# Next, Please!

A darkly humorous indie game about occupational health. You are a doctor deciding who is fit for work. Bureaucracy, absurdity, and questionable medical decisions.

The approved visual direction is an old-fashioned institutional clinic; its presentation avoids explicit dates and countries. Creative guidance lives in [the art direction](docs/art-direction.md). [FACTS.md](FACTS.md) contains established facts about the game world and explicitly marked open questions.

Created by **[Robert Chaba](https://github.com/robertchaba)**.

![Polish welcome screen](docs/welcome-screen.png)

## Run locally

Use Node 22.12+ (Node 22), Node 24, or Node 26+.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. Build with `npm run build`; serve the result with `npm run preview`. Deploy the contents of `dist/` to any static HTTP(S) host, including a subdirectory. No backend, database, account, or API key is needed. Opening the source HTML directly with `file://` is not supported.

## Version 0.2 — first shift

- Original clinic title artwork, pixel lettering, custom cursor, and creator credits.
- Polish by default; English available through the PL / EN buttons. The title remains **Next, Please!** in both languages; the Polish welcome screen also displays **Następny, proszę!**.
- Fixed **570 × 320** Canvas 2D graphics. Whole-number enlargement, nearest-neighbor display, and letterboxing; small windows fit proportionally below 1×.
- Working fullscreen button and **F** shortcut. Use **Tab / Enter** for controls and **Escape** to close a panel.
- Start opens four original illustrated cards: scalpel, catheter, pen, and stamp. Each carries one short sentence and a single **Next** action; the fourth enters the cabinet. Text appears with a mechanical typewriter sound; reduced motion shows it immediately.
- The consulting room fills the canvas with four clearly separated areas: patient and doorway at upper left, examination wall at upper right, paperwork at lower left, and tools at lower right. The two desktop areas are taller than the room views above. A drawn **04** plate identifies the room. Patients appear from the waist up and enter or leave through the distant doorway in a short six-frame animation; reduced motion shows the final state immediately. The room begins empty. Visible text stays on the documents and eye chart, with accessible names and announcements for the controls.
- Pick up, move, and drop the document, both stamps, rulebook, cup, and pencil with a mouse or touch. With the keyboard, **Tab** to an item, press **Space** to lift it, use the **arrow keys** to move, and press **Enter / Space** to drop or **Escape** to cancel. **Shift + arrows** moves faster. Items stay on the desktop, and their clickable areas follow them. Click or press **Enter** for the existing item actions, including opening the rulebook.
- A playable three-patient shift uses the physical bell, instruments, tray, and stamps. Take the referral, run both checks, apply a stamp to the document, and return it to the tray. Dragging a stamp onto the document applies it only after both checks; returning an unstamped document is rejected. The same actions remain available by clicking or keyboard activation. Correct decisions earn ten points; mistakes receive feedback and no bonus. Both `NORMAL` results require `FIT`; either `REVIEW` result requires `UNFIT`.
- A plain analog clock on the examination wall starts at **07:57**. Actions advance the condensed shift from **08:00 to 14:00**; the face has no work-hours markings. Three cases occupy the six-hour shift, and the next shift repeats the current training roster. This is action-based simulated time, not a real-time countdown.
- Click the lamp to switch it on/off and the wall decoration to alternate a plant and a certificate. Both changes are saved. **Escape** returns to the menu or closes a panel when no item is being carried. Menu → Resume keeps the current visit in memory.
- Patient names, jobs, simplified test results, rewards, and the repeating three-case roster are initial playable content, not settled narrative or medical simulation rules. Broader career progression, varied days, economy, and additional instruments remain future work.
- The save folder exports and imports real progress as a compressed version 3 `.npsave` file, including intro position, tests, applied stamp, clock, and decoration. Item positions, stacking order, and patient animation are temporary: a successful import resets them while restoring the saved appointment; a failed import preserves the live state. Version 1 sample saves migrate to an empty cabinet with their counters preserved. Version 2 progress remains importable; saves on either removed intro card continue into the cabinet. Imports validate completely before replacing state. Only language, mute, and music volume preferences use browser storage; export before closing or reloading.
- Fourteen local music tracks play in a repeating playlist across the title screen, introduction, panels, and cabinet. Audio starts muted: enable it with the speaker button. Use the previous/next buttons beside it to change tracks, wrapping at either end without changing mute. Before playback begins, those buttons select the starting track without loading audio. A saved unmuted preference starts music on the first click or key press after reloading. Opening panels does not restart the music.

![Cabinet with an active patient](docs/cabinet-screen.png)

The typewriter, carriage return, paper handling, and stamp effects are original offline syntheses, stored as local WAVs. Enable sound with the speaker button; the saved mute preference applies to effects and music together. Recreate the WAVs with `node scripts/generate-effects.mjs`; the generator and provenance are included in the [audio notes](public/assets/audio/README.md).

Music lives in [`public/assets/audio/music/`](public/assets/audio/music/) and is registered in `src/core/music.ts`. The folder's [notes](public/assets/audio/music/README.md) record the track list and pending provenance. Add source assets here, not in the generated `dist/` folder, which is replaced on each build.

Language, fullscreen, music, and cabinet menu/save controls sit below the 570 × 320 scene, including in fullscreen. There is no title or department text above the scene; the PL / EN controls use a larger 14px font. They remain keyboard accessible and are included in the display fitting calculation. The compact music controls include a volume slider (0–100%, initially 40%) that remembers its setting. Drag it or focus it and use the arrow keys; Home/End select the minimum/maximum. Volume changes preserve mute. Three tiny bars beside the speaker respond to the audio during audible playback; reduced-motion preferences keep the indicator static.

All runtime assets are local. There are no external runtime requests; following the GitHub credit is the only external navigation. Offline caching is not configured.

## Project map

| Location | Purpose |
| --- | --- |
| `src/main.ts` | Scene transitions, typewriter and patient animation updates, panels, semantic controls, and integration |
| `src/core/game.ts` | Pure gameplay actions, scripted cases, and simulated shift time |
| `src/core/desk.ts` | Temporary item positions, desktop bounds, and stacking order |
| `src/core/desk-input.ts` | Shared mouse, touch, and keyboard item movement |
| `src/scenes/shift.ts` | Intro/cabinet presentation and item hit areas |
| `src/render/clinic.ts` | Original pixel illustrations, cabinet, patients, and analog clock |
| `src/i18n.ts` | Polish and English strings; optional preferences |
| `src/render/font.ts` | Original title and compact document bitmap lettering with Polish diacritics |
| `src/core/display.ts` | Native resolution, scaling, and cursor |
| `src/core/save.ts` | Validated gzip JSON save format and browser file operations |
| `src/core/audio.ts` | Lazy Howler audio registry and playback controls |
| `src/core/music.ts` | Local music manifest and playlist order |
| `src/core/effects.ts` | Local typewriter, stamp, paper, and carriage effects |
| `public/assets/` | Local art and audio |

The runtime uses **fflate** and **Howler**. **Vite**, **TypeScript**, **Vitest**, and **Playwright** are development tools. The committed lockfile pins the installed dependencies.

## Documentation

- [Game-world facts and open questions](FACTS.md)
- [Technical guidelines](docs/technical-guidelines.md)
- [Save schema and migration rules](docs/save-format.md)
- [Art direction, generation prompt, and provenance](docs/art-direction.md)
- [Adding music and sound effects](public/assets/audio/README.md)
- [Repository instructions](AGENTS.md)

## Verify

```sh
npm test
npm run build
npm run test:browser
```

Browser checks use Playwright with installed Google Chrome against the built static site. Alternatively, run `npx playwright install chromium` and remove `channel: 'chrome'` from `playwright.config.ts` to use Playwright's bundled Chromium. Screenshots and downloaded test saves are written under the ignored `test-results/` directory.

The title background was generated specifically for this project with OpenAI image generation. Its full prompt and original source are retained. The pixel font, cursor, and interface are original code. Acquired assets must include their source, author, license, and required attribution; see the technical guidelines.
