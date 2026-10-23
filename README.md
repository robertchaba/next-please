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

## Current prototype

- Original clinic title artwork, pixel lettering, custom cursor, and creator credits.
- Polish by default; English available through the PL / EN buttons. The title remains **Next, Please!** in both languages; the Polish welcome screen also displays **Następny, proszę!**.
- Fixed **570 × 320** Canvas 2D graphics. Whole-number enlargement, nearest-neighbor display, and letterboxing; small windows fit proportionally below 1×.
- Working fullscreen button and **F** shortcut. Use **Tab / Enter** for controls and **Escape** to close a panel.
- Start displays a short placeholder; playable shifts are not implemented.
- Patient rosters, examinations, decision consequences, the economy, and narrative progression are not yet implemented or specified in detail.
- The save folder exports and imports sample state as a compressed `.npsave` file. Imports are validated before replacing state. Only language, mute, and music volume preferences use browser storage.
- Ten local music tracks play in a repeating playlist across the title screen and all panels, including the start placeholder. Audio starts muted: enable it with the speaker button. Use the previous/next buttons beside it to change tracks, wrapping at either end without changing mute. Before playback begins, those buttons select the starting track without loading audio. A saved unmuted preference starts music on the first click or key press after reloading. Opening panels does not restart the music.

Music lives in [`public/assets/audio/music/`](public/assets/audio/music/) and is registered in `src/core/music.ts`. The folder's [notes](public/assets/audio/music/README.md) record the track list and pending provenance. Add source assets here, not in the generated `dist/` folder, which is replaced on each build.

The compact music controls include a volume slider (0–100%, initially 40%) that remembers its setting. Drag it or focus it and use the arrow keys; Home/End select the minimum/maximum. Volume changes preserve mute. Three tiny bars beside the speaker respond to the audio during audible playback; reduced-motion preferences keep the indicator static.

All runtime assets are local. There are no external runtime requests; following the GitHub credit is the only external navigation. Offline caching is not configured.

## Project map

| Location | Purpose |
| --- | --- |
| `src/main.ts` | Welcome scene, panels, semantic controls, and integration |
| `src/i18n.ts` | Polish and English strings; optional preferences |
| `src/render/font.ts` | Original bitmap lettering with Polish diacritics |
| `src/core/display.ts` | Native resolution, scaling, and cursor |
| `src/core/save.ts` | Validated gzip JSON save format and browser file operations |
| `src/core/audio.ts` | Lazy Howler audio registry and playback controls |
| `src/core/music.ts` | Local music manifest and playlist order |
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
