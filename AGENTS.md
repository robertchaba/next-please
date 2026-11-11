# Next, Please!

Read [FACTS.md](FACTS.md) for established facts about the game world, characters, story, and gameplay. Update it only as those facts are agreed, and keep undecided details explicitly marked. Technical details, credits, implementation status, and creative guidance belong in the README or dedicated docs. Read [the technical guidelines](docs/technical-guidelines.md) before changing the architecture. [Art direction](docs/art-direction.md) and [the save format](docs/save-format.md) are the canonical references for assets and persistence.

- Preserve the approved analog clinic atmosphere and follow the presentation constraints in the art direction. The location/country is unspecified; whether it is fictional is undecided. Language selection does not define its location.
- Keep the game client-side and statically deployable: Vite, strict TypeScript, Canvas 2D, and local assets. Do not introduce a backend, runtime API, remote font, or CDN dependency.
- Preserve the 570 × 320 logical viewport, integer coordinates, nearest-neighbor rendering, and whole-number scaling whenever at least 1× fits. Keep semantic DOM controls aligned with their canvas hit areas and usable by keyboard.
- English is the fallback; use the first supported language (English or Polish) in the browser's preference list unless the player has saved a language choice. Add every user-facing string and accessible label to both dictionaries in `src/i18n.ts`; verify Polish glyphs and label widths.
- Keep gameplay state separate from rendering. Do not mutate state or generate time/random values inside drawing code.
- Persist only preferences in `localStorage`. Gameplay saves go through the validated, versioned gzip JSON import/export code in `src/core/save.ts`; preserve live state when an import fails.
- Keep artwork, font, cursor, and game identity original. Record provenance and redistribution terms for acquired assets. Register local audio with Howler, respect mute settings, and unlock playback from a user gesture.
- Generate every new graphical element with the built-in image generator, matching the approved clinic artwork. Do not substitute Canvas/SVG/CSS drawings or geometric placeholders for new objects, furniture, tools, paper, or decorative assets. Keep generated source images, prompts, and preparation recipes. Rendering code may composite local generated assets and draw localized text, focus indicators, and state-driven marks such as clock hands or stamp impressions; these are not substitutes for illustrated assets.
- Keep the current start action a clearly labeled prototype placeholder until gameplay is implemented.
- Use the lockfile and focused dependencies. Run `npm run build` plus the relevant Vitest/Playwright checks for each meaningful change. Update the corresponding documentation when a contract changes.
- Preserve Robert Chaba's creator credit and link to https://github.com/robertchaba.
