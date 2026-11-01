# Dedicated endings and revised penalty notice — 1.0.2

Created on 2026-11-01 using the built-in OpenAI image generator and the imagegen skill. Both outputs were copied into the project; no CLI/API fallback, stock art, extracted game art, runtime generation or new runtime dependency was used. These are original generated game assets; use and redistribution follow the applicable OpenAI output terms, with no separate third-party asset attribution. Robert Chaba's creator credit remains unchanged. The existing music files were not modified.

## Ending catalog

All eight outcomes have separate full-screen 570 × 320 illustrations and localized prose, descriptions and keyboard-accessible actions. Closure has two text variants sharing the same closure scene. The three positive chapter resolutions allow continued work; they do not erase the chapter history.

| Outcome | Runtime file under `public/assets/art/` | Music |
| --- | --- | --- |
| Hospital after retained bribe and refusal | `hospital-ending.png` (new) | Game Over - The Final Stamp.mp3 |
| Bankruptcy | `bankruptcy-cloakroom.png` | Game Over - The Final Stamp.mp3 |
| Spalona pieczątka / exposed | `story/ending-e1.png` | Game Over - The Final Stamp.mp3 |
| Gabinet zamknięty / closure | `story/ending-e2.png` | Game Over - The Final Stamp.mp3 |
| Do wyjaśnienia / detained | `story/ending-e3.png` | Game Over - The Final Stamp.mp3 |
| Pod opieką Komitetu / party | `story/ending-e4.png` | Victory Fanfare - All Clear.mp3 |
| Nasz lekarz / union | `story/ending-e5.png` | Victory Fanfare - All Clear.mp3 |
| Jutro zwykły dyżur / independent | `story/ending-e6.png` | Victory Fanfare - All Clear.mp3 |

The hospital scene replaces reuse of `homecoming.png`. The new picture shows quiet recovery, with a head bandage, metal bed, olive bedside cabinet and a flask. The left wall stays dark through x337. Full-composition nearest-neighbor preparation preserves the right-side scene; localized text stays separate. The two mechanical endings wrap their body to 286 native pixels. No ending condition, budget rule, action or save field changes.

## Source files and preparation

| Runtime file | Retained generated source | Exact prompt | Preparation |
| --- | --- | --- | --- |
| `public/assets/art/hospital-ending.png` | `public/assets/art/hospital-ending-source.png` | [Hospital prompt](art-prompts/hospital-ending.txt) | Complete source to 570 × 320, nearest-neighbor |
| `public/assets/art/sprites/inspection-fine.png` | `public/assets/art/inspection-fine-v2-source.png` | [Fine prompt](art-prompts/inspection-fine-v2.txt) | Alpha bounds `(0,16,1352,1084)` to 200 × 168, nearest-neighbor; generated alpha retained |

The hospital input was the approved `title-clinic.png`, inspected as a style reference. The fine input was the old generated `sprites/inspection-fine.png`, inspected before editing. Its original source remains at `public/assets/art/inspection-fine-source.png`. The selected replacement preserves the paper palette while replacing its decorative frame with perforation, carbon edge, fold, turned corner and faint paper watermark. Transparency was requested for the fine; the hospital is opaque.

Reproduce both runtime files with the offline script and a local Sharp installation:

```sh
node scripts/prepare-endings-and-fine-art.mjs /absolute/path/to/node_modules/sharp
```

`prepare-inspection-art.mjs` also points to the new fine source and dimensions, so rerunning the older batch does not restore the retired border. Build copies the prepared assets to the static deployment; generated source images stay outside the published copy.

The fine retains its existing 200 × 168 desktop footprint and aligned hit area. Runtime drawing adds localized ZUS/SIO, the notice title, ID, issue date, doctor addressee, requested visit date and patient, shortage reason, 50/200 zł amount, inspector and settlement note. The established generated seal and autograph supply ink detail. The title is right-aligned and measured in both languages; all graphic materials come from generated assets, with no drawn decorative frames. Accounting remains unchanged.

## Verification and previews

Vitest checks unique images for all eight endings, native sizes, save round-trips, ending precedence, continuation music, complete MP3 classification and Polish/English text widths. Playwright compares actual illustration pixels against each intended ending asset, exercises both languages and keyboard actions, and checks real Howler decoding, muted imports, track navigation, live chapter resolution and return to work/restart. Inspection previews wait for all local artwork to load.

- [Hospital, Polish](ending-hospital-pl-screen.png) and [English](ending-hospital-en-screen.png).
- [All eight endings, Polish](endings-1.0.2-review.png).
- [200 zł fine, Polish](inspection-fine-v102-pl-screen.png) and [English](inspection-fine-v102-en-screen.png).
- [50 zł fine, Polish](inspection-fine-v102-50-pl-screen.png).
