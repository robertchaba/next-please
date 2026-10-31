# Kurier Obywatelski — artwork and implementation, 0.8.7

The revised newspaper uses four original assets generated on 2026-10-31 with the built-in `image_gen` tool and the `imagegen` skill: folded newsprint, unfolded newsprint, and separate Polish/English mastheads. No API/CLI fallback, stock asset, external font or runtime service was used. These are project-generated assets with no acquired-asset attribution or third-party redistribution terms. Robert Chaba's creator credit is unchanged.

For the two paper sprites, the generator received `manual-spread-v083-source.png` and `cabinet-workstation.png` as palette/style references after visual inspection. Their warm muted paper and hard pixel clusters guide the revision. Mastheads were generated independently as transparent lettering: “Kurier Obywatelski” and “Civic Courier”. Exact prompts are archived separately for [unfolded paper](art-prompts/press/spread-v2.txt), [folded paper](art-prompts/press/folded-v2.txt), [Polish masthead](art-prompts/press/masthead-pl.txt) and [English masthead](art-prompts/press/masthead-en.txt).

| Asset | Retained source under `public/assets/art/` | Source size | Alpha crop (x,y,w,h) | Runtime size |
| --- | --- | --- | --- | --- |
| Unfolded paper | `newspaper-spread-v2-source.png` | 1619 × 971 | 30,49,1565,876 | 300 × 180 |
| Folded paper | `newspaper-folded-v2-source.png` | 1569 × 1002 | 211,170,1173,652 | 88 × 56 |
| PL masthead | `newspaper-masthead-pl-source.png` | 2032 × 774 | 27,224,1981,328 | 268 × 30 |
| EN masthead | `newspaper-masthead-en-source.png` | 1997 × 788 | 74,201,1869,368 | 216 × 30 |

Runtime sprites are `sprites/newspaper-{spread,folded,masthead-pl,masthead-en}.png`. Generated source copies are retained in the repository; the original built-in outputs remain under the generated-images directory. Crop bounds use alpha > 8, retaining the actual generated alpha inside. The recipe scales each crop to its intended native footprint with nearest-neighbor sampling, including a wider display aspect for the mastheads. No paper, rules, print texture, letterforms, wear or shadows are painted during preparation. Sharp is an offline preparation tool, not a project dependency.

```sh
node scripts/prepare-newspaper-art.mjs /absolute/path/to/node_modules/sharp
```

The first, rejected paper sources (`newspaper-spread-source.png`, `newspaper-folded-source.png`) and their original [spread](art-prompts/press/spread.txt)/[folded](art-prompts/press/folded.txt) prompts remain as production history. They are not loaded by the game. The revision replaces the two runtime paper sprites and adds the two masthead sprites.

## Composition and interaction

The newspaper begins folded at (94,188), 88 × 56, above the closed rulebook. Its generated abstract print needs no readable overlay. In hand it stays 64 × 40. Placing it on the right immediately shows the reading sheet at 300 × 180, equal to the open rulebook. Keyboard opening uses (216,134); pointer placement centers and clamps the same footprint. Turning pages only replaces the text. Closing returns it to the left. Picking up and cancelling restores the previous reading position and page.

Each view presents one full article, with a headline spanning the columns and body flowing down the left then the right. An edition has three or four articles/views. Columns start at x + 13 and x + 157, each 130 pixels wide. Article and classifieds headings use the existing title-screen bitmap font at native 1×, keeping seven-pixel capitals and Polish accents on the same single-pixel grid as the body. The headline begins at y + 56 in nine-pixel cells with twelve-pixel leading; body begins five pixels after the final line advance, with eight-pixel leading at 1×. Headline wrapping measures that same native font within 274 pixels. No clipping, ellipsis, fractional text scaling or article continuation is used. All 170 articles in both languages are checked against the column width and y + 158 body limit.

The mastheads sit at y + 4. The full simulated date, regional-daily strapline and working-day issue number are at y + 43. Byline and a plain page number are below the generated bottom rule, at y + 167. The folio sits at the outer edge, never across the fold. Existing generated manual corners indicate only available previous/next pages. No illustrations, seals, national emblems or city names are included.

The [20 accepted Polish materials](press-sample.md) have corresponding English text in `src/i18n.ts`; ten may repeat after the fresh pool runs out. Named authors and recurring local streets/institutions anchor a regional daily without establishing plot events. The revised text and presentation have been accepted by the user. Selection, persistence, morning timing and future editorial replacement slots retain the [technical](technical-guidelines.md#newspaper-and-early-mornings-087--save-v32) and [v32 editorial](save-format.md#version-32-newspaper-and-morning-arrivals) contracts. [Save v33](save-format.md#version-33-retained-newspaper-copies) adds dated physical copies without changing this artwork or the editorial stream.

Review images: [Polish newspaper](newspaper-pl-screen.png), [English newspaper](newspaper-en-screen.png), [folded newspaper](newspaper-folded-screen.png). Browser checks exercise direct opening on placement, unchanged bounds through all pages, full accessible articles, pickup cancellation, folding back left, failed-import preservation, the early bell and the 07:55 boundary in both languages.

## Stored editions

Each retained issue uses the same generated folded paper in either drawer. Five copies fit each batch: x294/x444, y35/99/163, with the last right position reserved for the rulebook. A date beneath the hovered/focused copy identifies its issue without adding text to the compact illustration. No new graphical asset was needed. The manual and its semantic rectangle have been raised from y236 to y216, clear of the drawer front. [Drawer preview](newspaper-drawer-screen.png).
