# Next, Please!

A darkly humorous indie game about occupational health. You are a doctor deciding who is fit for work. Bureaucracy, absurdity, and questionable medical decisions.

The approved visual direction is an old-fashioned institutional clinic. Its setting remains unnamed; dates of birth appear on patient referrals. Creative guidance lives in [the art direction](docs/art-direction.md). [FACTS.md](FACTS.md) contains established facts about the game world and explicitly marked open questions.

Created by **[Robert Chaba](https://github.com/robertchaba)**.

![Polish welcome screen](docs/welcome-screen.png)

## Run locally

Use Node 22.12+ (Node 22), Node 24, or Node 26+.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. Build with `npm run build`; serve the result with `npm run preview`. Deploy the contents of `dist/` to any static HTTP(S) host, including a subdirectory. No backend, database, account, or API key is needed. Opening the source HTML directly with `file://` is not supported.

Play on a desktop computer with a keyboard and mouse. Phones, tablets, and narrow portrait desktop windows receive a separate full-screen telephone vignette: an oversized olive receiver, an exchange tone, rotary dialing, and two brief replies from the clinic. Four presses of **Next** lead to a handwritten **Next, Please!** note explaining that the game requires a desktop. Large pixel-lettered PL / EN and Next controls remain keyboard accessible; a generated speaker icon toggles sound. Sound captions appear only while muted. The loose, untaped note uses enlarged handwriting, and the speech balloon points to the receiver's upper speaker. The mobile view omits the header title and creator footer; Robert Chaba's credit and link remain in the desktop credits. Sound begins only after an unmuted gesture; enable it or tap the receiver to hear the initial tone. The mobile route loads its own generated artwork and two local effects, without starting gameplay or the music playlist. Device detection is stable across rotation. Desktop windows also show the telephone when their width is at most 900 CSS pixels and at most 85% of their height. Widening the window restores the live game without reloading; the phone conversation also keeps its place. Hidden gameplay, shortcuts, and music pause, and preferences follow the visible view. [Mobile artwork and preparation](docs/art-mobile-2026-10-25.md).

## Version 0.5 — paperwork and correspondence

- Original generated artwork for the title, introduction, cabinet, patients, and tools, with separately rendered pixel lettering and a custom cursor. Credits list Robert Chaba, Codex and OpenAI models for programming, and Suno for music. Robert’s black-and-white pixel portrait is slightly tilted and attached to the top edge of the credits sheet with a drawn paperclip.
- Polish by default; English available through the PL / EN buttons. The title remains **Next, Please!** in both languages; the Polish welcome screen also displays **Następny, proszę!**.
- Fixed **570 × 320** Canvas 2D graphics on desktop. Whole-number enlargement, nearest-neighbor display, and letterboxing; small desktop windows fit proportionally below 1×. The mobile telephone uses a separate responsive layout.
- Working fullscreen button and **F** shortcut. Use **Tab / Enter** for controls and **Escape** to close a panel.
- Start opens four original illustrated cards: scalpel, catheter, pen, and stamp. Each carries one short sentence and a single **Next** action; the fourth enters the cabinet. Text appears with a mechanical typewriter sound; reduced motion shows it immediately.
- The consulting room fills the canvas with four clearly separated areas: patient against a dark alcove at upper left, examination wall at upper right, a compact exchange shelf at lower left, and the wider document desk at lower right. The left side occupies about 36% of the scene; stamps stand at the far right edge. The two desktop areas are taller than the room views above. A drawn **04** plate identifies the room. Patients emerge from the dark background with a constant head scale and sit down in 720 ms while the background stays still; reduced motion shows the final state immediately. The room begins empty. The lower interface surfaces are the desks, with no extra desk or couch in either upper room; the pendant lamp hangs from the ceiling between the eye chart and clock. Occasional greetings and farewells appear in small comic speech balloons. Most patients stay quiet; refusals end silently, and a failed eye test produces a hesitant reply. Patient details stay on documents, with accessible names and announcements for the controls.
- Click or tap a document, stamp or book once to pick it up; click again to place or use it. Held items follow the pointer. Documents are compact on the left and full size on the right desk. Right-side sheets may overlap the room while at least half remains over the desktop. Handwriting uses muted blue ink, distinct from the dark printed form headings and labels. Documents shrink when lifted from either desktop or the tray, keep their compact footprint while carried, and expand when placed on the right desk. Stamps remain the exception: they grow slightly in hand. Mechanical stamps return to their side rests and stay in hand after stamping, with a short, firm mechanical clack. The rulebook has an unlettered cloth cover: compact on the left shelf, smaller still while carried, and portrait-shaped when resting on the right. Placing it keeps it closed. Page corners appear only while the book rests on the right desk. Its first corner turn opens the cover; subsequent folded page corners navigate five instructional spreads, and turning back from the first spread returns to the cover. The smaller 9-pixel corners are part of the book artwork, with aligned controls and no arrow or close symbols. An original seven-row document face with five-pixel capitals and an eight-pixel line advance keeps paperwork compact in both languages. There is no coffee cup or pencil. Objects have no hover outlines, while keyboard focus remains visible. With the keyboard, **Tab** to an item, **Space** to lift it, **arrows** to move, **Enter / Space** to use or place it, and **Escape** to cancel. **Shift + arrows** moves faster. **Enter** opens or closes a focused book.
- A playable three-patient shift uses the bell, eye chart, pressure instrument, and a mechanical scale with a height measure integrated into the examination-room artwork. Take the employer referral, examine the patient, fetch a separate certificate form from the rack, enter the patient name with its pen corner, stamp it, and hand it to the patient. Referrals include the employer, initial/periodic examination, date of birth, sex, occupation, managerial responsibility, working conditions, and hazards. The certificate holds the patient's identity and fit/unfit decision, without examination results. Both wooden desk fronts share one lower edge; the left front is plain, and the right integrates the drawer and recessed wastepaper opening.
- A compact generated four-slot rack above the stamps on the right supplies blank sheets and certificate forms from its two active slots; two empty slots are reserved for later document types. The rack has no visible captions, while its controls retain localized accessible names. Each sheet is picked up from its slot and carried independently. The slightly tilted paperclip holder beside the telephone supplies clips that can be carried onto a document. Vision, pressure, weight and height findings appear on notes automatically. The pen corner (or Enter) adds supplementary information. Drop a sheet onto another sheet's attached clip to form a bundle; click the clip to separate it. Bundles move, file and retrieve together. The note belongs to that patient and day, so later patients cannot overwrite it. Carry paperwork to the drawer to keep it or to the basket to discard it; activate an empty-handed drawer to retrieve its most recently stored sheet. Supplies can be used repeatedly.
- A correct decision with vision, pressure, and body measurements complete earns ten points. A missing examination or wrong decision earns no bonus. Both `NORMAL` results require `FIT`; either `REVIEW` result requires `UNFIT`. These are fictional game rules; weight and height do not introduce medical thresholds. Stamping early and correcting a stamp remain possible.
- A mistaken approval delivers a sealed ZUS letter; a mistaken refusal delivers a letter from that patient's employer. Open the folded envelope corner or press Enter, read the paper, and carry it to the wastebasket. A correct decision with incomplete examinations loses the bonus without inventing a complaint from the wrong sender.
- The generated dark olive-gray plastic rotary telephone stands at the upper-left corner of the right desktop, projecting above its edge. It plays a locally synthesized exchange tone, respecting mute; calling remains unavailable. The closed rulebook sits near the lower edge of the left desktop. Checking seals/stamps and further document types are planned, with rules still undecided.
- A plain analog clock with hour and minute hands, without a second hand, starts at **07:57** and visibly advances with each action. Handling, page turns, stamps and decoration changes take one minute; vision, pressure, and body measurements take three, four, and two minutes respectively. Repeated work also takes time. The shift still has **08:00–14:00** bounds, but three cases no longer consume the entire six hours. Time advances through actions, not through a real-time countdown. Reduced motion skips the hand animation.
- Click the lamp to switch it on/off and the wall decoration to alternate a plant and a certificate. Both changes are saved. **Menu** or **Escape** opens a staff-room break with doctors and nurses talking over coffee, under the same **Next, Please!** title as the welcome screen and without a room caption; Escape first cancels carrying or closes an open book. Resume preserves the visit and desktop, and animations pause during the break. **Start over** asks for confirmation, then returns to the first-day introduction while retaining language and audio settings.
- The story takes place in **1983**; the exact date and further document stamps remain planned. Patient names, jobs, simplified test results, rewards, and the repeating three-case roster are initial playable content, not settled narrative or medical simulation rules. Broader career progression, varied days, economy, and additional instruments remain future work.
- The secretary hands over documents in the new save-screen illustration. Export and import transfer real progress as a compressed version 7 `.npsave` file, including intro position, tests, applied stamp (also before examinations), clock, decoration, notes, referrals, opened/sealed letters, clip bundles, manually written certificate names, supplementary notes, and drawer contents. Item positions, stacking order, open book/page, clock interpolation, patient movement and speech are temporary: a successful import resets them while restoring the saved appointment; a failed import preserves the live state. Version 1 sample saves migrate to an empty cabinet with their counters preserved. Version 2–6 progress remains importable with their existing clock values; saves on either removed intro card continue into the cabinet. Imports validate completely before replacing state. Only language, mute, and music volume preferences use browser storage; export before closing or reloading.
- Fourteen local music tracks play in a repeating playlist across the title screen, introduction, panels, and cabinet. Audio starts muted: enable it with the speaker button. Use the previous/next buttons beside it to change tracks, wrapping at either end without changing mute. Before playback begins, those buttons select the starting track without loading audio. A saved unmuted preference starts music on the first click or key press after reloading. Opening panels does not restart the music.

![Current workstation with a dark olive telephone, raised document rack, and clean desk edge](docs/workstation-screen.png)

![Version 0.5 cabinet with an active patient, separate notes, and an attached paperclip](docs/cabinet-screen.png)

![Closed portrait rulebook with an unlettered cloth cover](docs/manual-cover-screen.png)

![Open rulebook with page corners](docs/manual-screen.png)

![Medical secretary handling save files](docs/archives-screen.png)

![Staff-room break and in-game menu](docs/break-room-screen.png)

The typewriter, carriage return, paper handling, stamp, desk-bell, desktop telephone, and mobile exchange/dialing effects are original offline syntheses, stored as local WAVs. The 260 ms mechanical stamp effect combines a dry rubber-and-wood impact, faint mechanism slide and a separate quiet return clack; the desk bell rings for 680 ms. Enable sound with the speaker button; the saved mute preference applies to effects and music together. Recreate the WAVs with `node scripts/generate-effects.mjs`; the generator and provenance are included in the [audio notes](public/assets/audio/README.md).

Music lives in [`public/assets/audio/music/`](public/assets/audio/music/) and is registered in `src/core/music.ts`. The folder's [notes](public/assets/audio/music/README.md) record the track list and pending provenance. Add source assets here, not in the generated `dist/` folder, which is replaced on each build.

Language, fullscreen, music, and cabinet menu/save controls sit below the 570 × 320 scene, including in fullscreen. There is no title or department text above the scene; the PL / EN controls use a 14px font, and Menu / Saves use a larger 16px font. They remain keyboard accessible and are included in the display fitting calculation. The compact music controls include a volume slider (0–100%, initially 40%) that remembers its setting. Drag it or focus it and use the arrow keys; Home/End select the minimum/maximum. Volume changes preserve mute. Three tiny bars beside the speaker respond to the audio during audible playback; reduced-motion preferences keep the indicator static.

All runtime assets are local. There are no external runtime requests; following the GitHub credit is the only external navigation. Offline caching is not configured.

## Project map

| Location | Purpose |
| --- | --- |
| `src/main.ts` | Startup device detection and lazy selection of desktop or mobile entry point |
| `src/desktop.ts` | Desktop scene transitions, typewriter, patient movement and speech updates, panels, semantic controls, and integration |
| `src/mobile.ts` | Mobile telephone sequence, semantic controls, preferences, and gesture-triggered sound |
| `src/core/device.ts` | Pure mobile-device classification and browser capability detection |
| `src/render/mobile.ts` | Generated mobile note and balloon composition with localized bitmap lettering |
| `src/core/game.ts` | Pure gameplay actions, scripted cases, and simulated shift time |
| `src/core/desk.ts` | Temporary item positions, desktop bounds, and stacking order |
| `src/core/desk-input.ts` | Shared mouse, touch, and keyboard item movement |
| `src/scenes/shift.ts` | Intro/cabinet presentation and item hit areas |
| `src/render/clinic.ts` | Local generated artwork loading and composition, patient sprites, and analog clock |
| `src/render/paperwork.ts` | Referrals, notes, envelopes, complaint letters, and their accessible descriptions |
| `src/render/manual.ts` | Physical rulebook cover and spreads, page corners and accessible page descriptions |
| `src/i18n.ts` | Polish and English strings; optional preferences |
| `src/render/font.ts` | Original title and compact document bitmap lettering with Polish diacritics |
| `src/core/display.ts` | Native resolution, scaling, and cursor |
| `src/core/save.ts` | Validated gzip JSON save format and browser file operations |
| `src/core/audio.ts` | Lazy Howler audio registry and playback controls |
| `src/core/music.ts` | Local music manifest and playlist order |
| `src/core/effects.ts` | Local mechanical effects, desktop telephone, and mobile exchange/dialing sounds |
| `public/assets/` | Local art and audio |

The runtime uses **fflate** and **Howler**. **Vite**, **TypeScript**, **Vitest**, and **Playwright** are development tools. The committed lockfile pins the installed dependencies.

## Documentation

- [Game-world facts and open questions](FACTS.md)
- [Technical guidelines](docs/technical-guidelines.md)
- [Save schema and migration rules](docs/save-format.md)
- [Art direction, generation prompt, and provenance](docs/art-direction.md)
- [Archive and staff-room artwork, exact prompts and preparation](docs/art-panels-2026-10-24.md)
- [Neutral secretary expression revision](docs/art-nurse-revision-2026-10-24.md)
- [Creator portrait, permission and exact prompt](docs/art-creator-2026-10-24.md)
- [Generated telephone, scale and paperclips](docs/art-workstation-2026-10-25-assets.md)
- [Generated document rack, paper and integrated desk edge](docs/art-workstation-2026-10-25-stationery.md)
- [Workstation polish: integrated scale and aligned desk fronts](docs/art-workstation-2026-10-25-polish.md)
- [Current corrections: darker turned telephone, raised rack, and clean desk edge](docs/art-workstation-2026-10-25-corrections.md)
- [Mobile handset, speech balloon and note: sources, prompts and preparation](docs/art-mobile-2026-10-25.md)
- [Adding music and sound effects](public/assets/audio/README.md)
- [Repository instructions](AGENTS.md)

## Verify

```sh
npm test
npm run build
npm run test:browser
```

Browser checks use Playwright with installed Google Chrome against the built static site. Alternatively, run `npx playwright install chromium` and remove `channel: 'chrome'` from `playwright.config.ts` to use Playwright's bundled Chromium. Screenshots and downloaded test saves are written under the ignored `test-results/` directory.

Every new graphical element is generated, as required by `AGENTS.md` and the art direction; Canvas geometry is reserved for localized text and changing presentation marks. The title, cabinet, introduction, archive, staff-room illustrations, and transparent sprites were generated specifically for this project with the built-in OpenAI image generator. Prompts, original sources, and preparation details are retained in the art documentation. Runtime images and sprites live in `public/assets/art/`. Text remains a separate layer so Polish and English share the same artwork. The pixel font, cursor, and interface are original code. Acquired assets must include their source, author, license, and required attribution; see the technical guidelines.
