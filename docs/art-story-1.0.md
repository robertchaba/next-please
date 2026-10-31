# Story artwork — version 1.0

Created on 1 November 2026 with the built-in `image_gen` tool and the `imagegen` skill, using one request for each image. All 33 original generated sources are retained. No image-generation API/CLI fallback, stock asset, remote font or runtime network service was used. These original images were generated specifically for Next, Please! and are distributed with the project; no separate third-party asset attribution is required.

The user's `external-docs/wzajemnosc_logo.png` is the supplied visual reference for Wzajemność. Its authorship and permission to use it in this game come from the user's project contribution; no broader redistribution license is inferred. The image remains unchanged. Its brush-lettering character informs the new newspaper mastheads. Its crowd and flag are not inserted into game artwork. Following the user's instruction, documents use a simple red **W** in Polish and **M** in English, rendered as localized text; the full logo is not substituted for that mark.

## Retained sources and exact requests

- Untouched generator outputs: `public/assets/art/story-source/*.png`.
- Individual complete prompts: `docs/art-prompts/story/*.txt`.
- [Generation manifest](../public/assets/art/story-source/generation-manifest.json): exact prompts, reference-image paths, transparency requests, original tool-output paths, production date and method.
- [Preparation manifest](../public/assets/art/story/preparation.json): runtime dimensions, retained source dimensions, actual alpha-bound crop rectangles, resize rules and decoded-pixel SHA-256 hashes.

The references were visually inspected before generation: the approved title scene, cabinet workstation, bankruptcy scene, original civilian patient 103 and militia patient 76, existing paper, newspaper and ink sprites, and the user's union logo. Images are fictional original characters and ordinary institutional materials. They establish neither a country nor a city.

## Runtime manifest

All portrait files are in `public/assets/art/sprites/`, at 94 × 96 with transparent surroundings. New faces are reserved for their story actors and do not borrow an existing randomly assigned identity.

| Spec | Runtime filename | Character |
| --- | --- | --- |
| P01 | `story-agent.png` | Roman Kurek |
| P02 | `story-strike-leader.png` | Stefan Wolszak |
| P03 | `story-printer.png` | Jerzy Borkowski |
| P04 | `story-dispatcher.png` | Antoni Rybak |
| P05 | `story-sergeant.png` | Marek Czarnecki |
| P06 | `story-proofreader.png` | Zofia Witek |
| P07 | `story-volunteer.png` | Tadeusz Karski |
| P08 | `story-storekeeper.png` | Edward Król |
| P09 | `story-alias.png` | Andrzej Lis / Jan Sikora |
| P10 | `story-malec.png` | Henryk Malec |

[Portrait review sheet](story-portraits-review.png) shows those ten faces in order, left to right and top to bottom, at 2× nearest-neighbor scale. Each portrait retains its whole head, shoulders, forearms and hands, with a natural head scale. All variants of the same character reuse its portrait.

The following assets are in `public/assets/art/story/`.

| Spec | Runtime filename | Native size and use |
| --- | --- | --- |
| G01 | `leaflet.png` | 200 × 168; inexpensive gray-cream duplicated sheet |
| G02 | Localized red W / M text | User-specified abbreviated union mark; supplied full logo retained unchanged |
| G03 | `warning.png` | 200 × 168; austere twice-folded gray warning |
| G04 | `exposure.png` | 200 × 168; copied sheet with two faint fragment areas |
| G05-BHP | `bhp-paraph.png` | 46 × 20; blue angular safety-officer autograph |
| G05-EDITOR | `editor-paraph.png` | 46 × 20; distinct violet looped editorial autograph |
| G06 | `committee-seal.png` | 42 × 36; dry brick-red oval committee seal |
| G07 | `voluntary-imprint.png` | 162 × 24; purple dry-ink perimeter; localized phrase composited separately |
| G08 | `carbon-copy.png` | 200 × 168; thin pale-violet carbon copy |
| G09 | `private-note.png` | 200 × 168; plain private cream note |
| G10 | `party-card-cover.png`, `party-card-open.png` | 112 × 144 cover, 200 × 168 spread; burgundy booklet with blank data/photo space |
| G11 | `malec-photo.png` | 48 × 40; generated monochrome press photograph of the same Malec, using his portrait as the identity reference |
| G12 | `union-folded.png` | 88 × 56; thin gray folded weekly with abstract print texture |
| G13 | `union-spread.png` | 300 × 180; gray open newsprint, shallow center fold |
| G14 | `union-masthead-pl.png` | 268 × 30; “Głos Wzajemności” |
| G15 | `union-masthead-en.png` | 268 × 30; “Voice of Mutuality” |
| G16 | `security-seal.png` | 46 × 30; cool-blue clipped rectangular administrative seal |

Existing formal cream paper, envelopes, medical/Chamber impressions, page corners and document signatures are reused where the specification calls for reuse. Document clues, signatures' printed names, institutions, dates, reports and copied evidence remain game data. Neither new seals nor signatures encode readable names or a real agency emblem. The small press photograph is the explicit exception to otherwise text-only newspaper articles.

## Six epilogue illustrations

`ending-e1.png` through `ending-e6.png` are each 570 × 320. [The review sheet](story-endings-review.png) presents them in order, left to right and top to bottom, at native size.

| Spec | File | Depicted scene |
| --- | --- | --- |
| F01 | `ending-e1.png` | Duplicated records and unused stamp on the desk, administrator waiting in the doorway |
| F02 | `ending-e2.png` | Closed consulting-room door, removed appointment sign and case folder |
| F03 | `ending-e3.png` | Two civilian officials gathering records, empty doctor's chair, open drawers |
| F04 | `ending-e4.png` | Committee letter and carefully placed stamp at dawn, waiting silhouette |
| F05 | `ending-e5.png` | Private note beneath the door and ordinary waiting workers |
| F06 | `ending-e6.png` | Empty clinic prepared for work, fresh paper, telephone and closed drawers |

The left area through approximately x295 is consistently quiet and dark. The epilogue's 264-pixel text column beginning at x25 fits there without a synthetic tint, paper panel or overlay. F02's room plate is intentionally blank for separate localized/state text. These images contain no readable story text, dates, flags or national insignia, and no violence is illustrated. Existing hospitalization and bankruptcy imagery remains unchanged.

## Reproduction and validation

```sh
node scripts/prepare-story-art.mjs /absolute/path/to/node_modules/sharp
```

The [offline recipe](../scripts/prepare-story-art.mjs) requires an existing external Sharp installation; Sharp is not a project or runtime dependency. Transparent assets are cropped to the visible alpha > 8 bounds. Portraits and ink signatures keep their proportions within the established footprint, with portraits aligned to the bottom so hands meet desk level. Full scenes and the press photo preserve aspect ratio with a centered crop. Flat writing surfaces and separately generated mastheads are normalized to the exact established document/press footprints, as in the existing stationery preparation workflow; this avoids transparent bands underneath fixed text margins. All resampling is nearest-neighbor. No pixels are painted, substituted or retouched, and generated alpha is preserved within each crop.

The recipe fails on missing/empty sources or a missing requested alpha channel. Its optional `--allow-missing` is a production convenience; the complete final run uses no missing-source exception. Review-sheet backgrounds are inspection surfaces only, never game artwork.

All 33 retained source files were compared byte-for-byte with their original built-in outputs. Final dimensions, alpha on every requested transparent asset, transparent upper portrait corners, and uniqueness of all 33 decoded runtime images were checked. The ten portrait silhouettes, six ending compositions, both exact masthead spellings (including Polish accents) and the prepared paper areas were visually inspected. Browser screenshots of the weekly, Malec's card, the forklift referral, Lis's separate identity report and Polish/English epilogues were also reviewed. That review led to a narrower epilogue text column and wrapped long card references. Browser integration and localized document-layout checks are part of the 1.0 verification performed by the main implementation task.
