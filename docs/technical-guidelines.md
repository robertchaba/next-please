# Technical guidelines

Established game-world facts and open questions live in [FACTS.md](../FACTS.md); keep technical details and implementation status in these guidelines or the README. Follow [the art direction](art-direction.md) for creative guidance, including its constraints on explicit dates and locations in visible and accessible interface text.

## Runtime and tooling

Next, Please! is a browser-only, client-side game. Vite and strict TypeScript produce static HTML, CSS, JavaScript, and local assets. There is no backend, account system, runtime API, CDN dependency, or remotely loaded font. The browser supplies Canvas 2D, file selection/download, and fullscreen support. Outside the game canvas, the page uses system monospace fonts.

Use Node 22.12+ on the Node 22 release line, Node 24, or Node 26+ to satisfy the current tooling. Install from the committed lockfile with `npm ci`. Keep runtime dependencies focused: `fflate` handles save compression; Howler handles local music and effects. Add libraries only when they solve an actual game requirement.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run build` | Type-check, then create the static `dist/` build. |
| `npm run preview` | Serve that build locally. |
| `npm test` | Run Vitest unit checks. |
| `npm run test:browser` | Run Playwright interface checks. |

## Display and input

- The canvas and its logical coordinate system are always **570 × 320**. Keep layout positions, hit areas, text, and sprite coordinates in native pixels.
- Use Canvas 2D with image smoothing disabled. Use `image-rendering: pixelated` for display scaling. Do not increase the canvas backing resolution to match the window or device pixel ratio.
- `src/core/display.ts` chooses a whole-number CSS scale when the available space permits at least 1×. Center the frame and leave unused space around it rather than stretching its aspect ratio. Fullscreen follows the same rule.
- Surrounding page text uses 18px above and 16px below the frame (14px on small screens). Measure its actual wrapped height when fitting the frame; language changes must also trigger fitting.
- Below native resolution, fractional fitting keeps the interface visible. Uneven or lost pixels are unavoidable at this size. Browser zoom and fractional device pixel ratios can also affect physical pixel alignment.
- Canvas-rendered controls have transparent semantic DOM buttons or links over the same native rectangles. Preserve keyboard focus, accessible names, tab order, and visible focus indicators. Keep the DOM controls and canvas inside the same scaled stage.
- `src/render/font.ts` is the original bitmap font, with Polish diacritics. Glyph cells are 5 × 9, ordinary capitals use the bottom seven rows, spaces are three pixels wide, and the gap between characters is one pixel. Multiline advance is twelve pixels. Measure text before placing it; never scale a label fractionally to make it fit.
- The pixel cursor is generated locally in `src/core/display.ts`; keep a browser cursor fallback.

## State, scenes, and localization

The current scope is the title screen, credits, settings controls, and a sample save workflow. The start button displays an informative placeholder. It does not start a playable shift.

As gameplay grows, keep scene transitions, simulation state, input handling, and drawing separate. Render from current state; drawing must not change game state, call `Date.now()`, or generate new random values. Advance time and randomness during explicit updates, and retain any values needed for reproducible saves. Avoid a framework or general scene engine until concrete scenes need it.

Polish is the default locale; English is equally supported. All user-facing text, accessible names, status messages, and errors belong in the typed dictionaries in `src/i18n.ts`. Keep both languages' keys and meaning aligned. Render the same artwork for both locales, with text drawn separately. Check Polish diacritics and the longest labels at native resolution.

Only locale, mute, and music volume preferences use `localStorage`. Music volume defaults to 40%; missing or invalid stored volume falls back to that default. Volume and mute remain independent. Storage may be blocked or unavailable, so preference reads and writes must remain optional. Gameplay progress is an explicit export/import operation, not browser storage.

## Portable saves

`src/core/save.ts` owns the versioned gzip JSON format and file operations. `fflate` compresses version 1 saves into `.npsave` files. See [save-format.md](save-format.md) for the envelope, limits, error codes, and migration rules.

Treat imports as untrusted data. Validate the entire file before replacing live state; failed imports must preserve the current state. Keep stable error codes in the save layer and translate their presentation in the interface. Export plain game data only: no DOM nodes, audio objects, functions, or temporary presentation state. Introduce an explicit migration when gameplay changes the save schema.

## Art and audio

Use the original generated title art documented in [art-direction.md](art-direction.md). The game draws inspiration from bureaucratic satire and period institutions; its art, characters, interface details, and writing must remain original. Do not import assets extracted from existing games or copy their proprietary characters or branding. The pixel font and cursor are project code.

Howler in `src/core/audio.ts` plays the ten local MP3s registered by `src/core/music.ts` as a repeating playlist. Music belongs to the application, so title/panel transitions and future gameplay share uninterrupted playback. Put source MP3s in `public/assets/audio/music/` and sound effects in `public/assets/audio/`; resolve manifest URLs through `import.meta.env.BASE_URL`. Registration and playlist preparation must not autoplay or download audio. The application starts muted unless the user saved another preference; unlock and begin playback only from an unmuted click or key press. The title screen's previous/next buttons wrap the playlist, stop the old track, and preserve mute. Before playback starts, they change only the selected track without loading audio. Muting silences an active playlist without resetting it. Maintain separate music and effect volumes. Skip missing/undecodable playlist tracks, stop after all tracks fail, and report playback failure with a localized message; a later gesture can retry. Keep the manifest and both localized credit lists aligned with the source folder; `tests/music.test.ts` checks for missing, renamed, or unregistered MP3s.

For acquired audio or other third-party assets, record the title, author, source URL, license and license URL, required attribution, and modifications alongside the files. Verify permission for redistribution and the intended game use. Download approved files into the repository; do not hotlink them. User-provided files also need provenance recorded before distribution. See [the audio notes](../public/assets/audio/README.md).

Music icons use muted olive and seven-pixel shapes while retaining their 23 × 20 native hit areas. The 50 × 20 volume range input aligns with a canvas track and four-pixel thumb; it supports pointer dragging, arrow keys, and Home/End. Its 0–100% value updates Howler and preferences without toggling mute. The speaker's three one-pixel meter bars use seven height levels sampled from a Web Audio analyser on Howler's existing master mix. The analyser is a side branch with no extra connection to the output. Sample at most ten times per second, only on the visible title screen, and render from the stored values. Muting, zero volume, loading, and stopped playback leave the indicator still. Reduced motion and HTML audio fallback use a static playing indicator. Localize the speaker's playback description without repeatedly announcing individual meter changes.

## Verification and deployment

Use Vitest for save round-trips, invalid imports, size limits, and scaling behavior. Use Playwright for the actual welcome interface: language switching, accessible controls, credits, save import/export, and viewport changes. Add checks for meaningful behavior, not copies of the implementation. Run `npm run build` with the relevant tests before considering a change complete.

Deploy the contents of `dist/` to an HTTP(S) static host. Vite uses `base: './'` to support hosting under a subpath; resolve asset URLs accordingly. No server-side application or secrets belong in this project. Development and built output require a static server; double-clicking the source `index.html` is not a supported launch method. An offline cache or service worker is not part of the current foundation.
