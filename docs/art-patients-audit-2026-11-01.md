# Patient cast audit — 1.0.8

The author's 1 November 2026 direction replaces selected civilian casting and idealized portraits with ordinary people suited to the game's PRL-inspired 1983 clinic atmosphere. The audit covers all 188 ordinary faces, the ten recurring story faces and three inspectors. Fifty ordinary portraits receive new original illustrations. The story and inspector cast remains visually consistent. The location remains unnamed.

Faces retain their established sex and intended age. Practical haircuts, worn wool and cotton, natural eyes, understated expressions and individual facial proportions replace fashion styling and doll-like faces. Young adults remain young adults. The selected replacement briefs use fair natural complexions and Central European civilian casting, with varied builds, haircuts and face shapes.

## Assets and provenance

All replacements were generated specifically for Next, Please! with the **built-in `image_gen` tool**, using the `imagegen` skill, one independent generation request per portrait and `transparent_background: true`. Portrait 152 received one further face-only edit to reduce glossy eyes while preserving her age, hair, clothes and pose. Its first generated source is retained in `public/assets/art/patients-source/revisions/patient-152-v108-first.png`; both prompts and source hashes are recorded in the manifest. No CLI/API generation fallback, stock image, real person's likeness or extracted game art was used. No additional third-party asset attribution applies. Sharp is only an offline preparation tool.

- [Exact prompts, intended ages, retained destinations and source hashes](art-prompts/patients-v108.json).
- Generated sources replace the corresponding `public/assets/art/patients-source/patient-NN.png` files byte for byte.
- Runtime sprites replace the corresponding `public/assets/art/sprites/patient-NN.png`, all at 94 × 96 with alpha.
- [Review sheet](patients-audit-roster-screen.png): five portraits per row, ascending ID, at 2× nearest-neighbor scale.
- Earlier sources, sprites and generation prompts remain available in Git history; the audit began at `df16d69db69d27b3ccc31b3c8145161e997f87b7`. Earlier production records describe their historical outputs. This record and its manifest take precedence for these 50 current sources.

Revised IDs, in review-sheet order:

```text
11  12  23  24  26
29  31  34  38  40
41  46  47  55  66
91 100 101 105 109
111 115 117 123 125
129 131 136 139 140
142 146 149 150 152
153 156 158 162 165
166 168 169 170 172
176 178 181 182 184
```

## Identity continuity

The [name revision table](art-prompts/patients-v108-identities.json) records the former and new Polish/English labels for all five identities of 19 portraits, totaling 95 current identities. Ten of those portraits also have historical cases; these use the first revised identity's name. Portrait 11's erroneous masculine names are corrected to feminine names. Other revised illustrations already have suitable names and retain them. English names follow the project's existing [localization glossary](localization-glossary.json).

All case and portrait IDs, ages, birth dates, sexes, occupations, employers, medical findings and queue history remain stable. Labels are resolved from case IDs, so current and imported paperwork use the new names without a save migration. Save v36 remains unchanged. The [illustrated identity catalog](patient-identities.md), art direction and world facts reflect the superseded naming rule.

## Preparation

```sh
node scripts/prepare-patient-audit-art.mjs /absolute/path/to/node_modules/sharp
npm run build
```

The [recipe](../scripts/prepare-patient-audit-art.mjs) checks retained source hashes, locates visible alpha > 8 bounds, rejects clipped or empty silhouettes, crops only transparent margins and resizes to 94 × 96 with nearest-neighbor sampling. It keeps generated alpha inside the crop. It checks transparent upper corners, every ordinary runtime footprint and unique decoded pixels across the entire ordinary cast. The plain contact-sheet background is a review surface only. The build copies runtime assets to the committed GitHub Pages output; original sources are not published twice.

## Verification

The patient catalog tests protect all prior case fields and all prior Polish labels except the explicitly approved name replacements. They check all five identities, six clinical variants and historical labels in both languages. Localization tests check names against the glossary, unique identities and Polish glyph coverage; existing document layout checks cover label widths. Browser checks import and display every numbered ordinary portrait in both languages, compare rendered faces and check missing assets. Revised identity samples also exercise all five alternative names through save import and localized document controls.

Completed on 1 November 2026:

- Preparation verified all 50 retained source hashes and complete silhouettes; all 188 ordinary runtime portraits have distinct decoded pixels. The 50 revised sprites total 891,386 bytes.
- `npm test`: 625 tests passed across 51 files.
- `npm run build`: passed; committed Pages output contains the reviewed sprites, with original sources excluded. Vite retains its existing large audio-chunk advisory.
- `npm run test:browser -- tests/browser/patient-uniforms.spec.ts tests/browser/patient-identities.spec.ts tests/browser/patient-expansion.spec.ts tests/browser/patient.spec.ts tests/browser/welcome.spec.ts --workers=3`: 21 tests passed.
- `npm run test:pages -- --output=/tmp/next-please-pages-results`: both repository-path deployment tests passed after updating their release-label expectations to 1.0.8.
- Visual review covered the native-size sprites at 2× and the actual cabinet: [portrait 11, Polish](patients-audit-clinic-pl-screen.png), [portrait 117, Polish](patients-audit-ordinary-face-screen.png), [portrait 169, English](patients-audit-clinic-en-screen.png).
