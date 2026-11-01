# Press and identity-card polish — 1.0.5

The author requested red lettering and yellower paper for Głos Wzajemności, proper quotation marks throughout the game, returnable identity cards and a filled inspector-card thumbnail.

## Generated press artwork

Four edits were produced on 1 November 2026 with the built-in `image_gen` tool and the `imagegen` skill. Each used its previously inspected runtime sprite as the edit target, preserving the newspaper silhouette or existing masthead lettering. The paper becomes muted yellowed straw; the mastheads become brick red in both languages. The folded newspaper carries the same colors. No third-party artwork was acquired, and no external attribution or redistribution license is introduced; these are original project-specific generated derivatives of the project’s own art.

| Asset | Retained source | Exact prompt | Runtime size |
| --- | --- | --- | --- |
| Open weekly | [union-spread.png](../public/assets/art/press-revision-source/union-spread.png) | [prompt](art-prompts/press-revision/union-spread.txt) | 300 × 180 |
| Folded weekly | [union-folded.png](../public/assets/art/press-revision-source/union-folded.png) | [prompt](art-prompts/press-revision/union-folded.txt) | 88 × 56 |
| Polish masthead | [union-masthead-pl.png](../public/assets/art/press-revision-source/union-masthead-pl.png) | [prompt](art-prompts/press-revision/union-masthead-pl.txt) | 268 × 30 |
| English masthead | [union-masthead-en.png](../public/assets/art/press-revision-source/union-masthead-en.png) | [prompt](art-prompts/press-revision/union-masthead-en.txt) | 268 × 30 |

Runtime files retain their names under `public/assets/art/story/`. Earlier generated originals remain under `story-source/`. `scripts/prepare-story-art.mjs` selects the revised sources for the four `union-*` assets, crops at alpha greater than 8, and resizes with nearest-neighbor sampling. It preserves source alpha, uses the established fill geometry for the open paper and mastheads, and contains the folded paper within its footprint. Source dimensions, crop rectangles and pixel hashes are recorded in [preparation.json](../public/assets/art/story/preparation.json). No recoloring, drawing or retouching occurs in the recipe.

```sh
node scripts/prepare-story-art.mjs /absolute/path/to/node_modules/sharp
```

Sharp is offline preparation tooling, with no new runtime dependency. The built-in outputs were copied from the session’s generated-images directory; the workspace sources above are the durable copies.

## Inspector identity

The thumbnail reuses the existing generated inspector card and the matching inspector portrait. `drawInspectorIdentity` now serves the exchange shelf before pickup as well as carried and placed cards. Compact localized text supplies ZUS/SIO, the surname (initials if needed at 48 pixels wide) and K/41–K/43. Full-size cards retain all original fields. This fixes the formerly empty shelf form without introducing a new illustration or placeholder. Every text mark uses integer coordinates at native font size.

## Verification

Vitest covers quotation marks in all font roles, compact card bounds in both languages for all three inspectors, card ownership, bundles, repeat handoff, drawer/import recovery, J2 ownership and closing rollback. Playwright covers mouse and keyboard card return while a stamped certificate remains in the bundle, persistent absence after reimport, both newspaper languages and inspector shelf/carried/full-size views.

Verified in-game newspaper views: [Polish](union-newspaper-1.0.5-pl.png), [English](union-newspaper-1.0.5-en.png). Both retain their complete localized article, corrected guillemets and existing reading controls.

Filled inspector-card shelf views: [Polish](inspector-id-shelf-1.0.5-pl.png), [English](inspector-id-shelf-1.0.5-en.png).

Final release checks: `npm run build`; all 616 Vitest tests with `npm test -- --maxWorkers=2`; 49 Playwright tests across story, inspection, drawers and welcome; both root/subpath deployment tests. The 12 newspaper browser tests also passed in the earlier 44-test press/story/inspection run. The first unrestricted Vitest run hit 5-second time limits under concurrent CPU load; the complete two-worker run passed without changing test timeouts.
