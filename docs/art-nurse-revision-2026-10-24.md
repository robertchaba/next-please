# Archive nurse expression revision

Prepared on 2026-10-24 in response to the request for a neutral, indifferent expression rather than a sorrowful one.

- Method: built-in `image_gen` tool with the `imagegen` skill; no API/CLI generation fallback.
- Intent/use case: edit, `precise-object-edit`.
- Edit target: the original project-generated `public/assets/art/archives-clinic-source.png`.
- Retained generated revision: `public/assets/art/archives-clinic-neutral-source.png`, 1672 × 940, opaque PNG.
- Runtime result: `public/assets/art/archives-clinic.png`, 570 × 320, opaque PNG.
- Provenance and redistribution: original project-generated artwork and its generated revision; no acquired stock image, extracted game art, or separate third-party asset license. Both sources and the prepared result are retained for distribution with this project.

Only the generated face rectangle at source coordinates (1254,333), 108 × 102, is composited over the approved source. The preparation recipe in `scripts/prepare-panel-art.mjs` then resizes the complete composition to 570 × 320 with nearest-neighbor sampling. This keeps every pixel outside the face correction from the approved scene and avoids unrelated changes to its walls, furniture, uniform, hands and paperwork. The neutral eyes, level brows and relaxed closed mouth were visually inspected at native resolution. No text, setting facts or character identity were changed.

Recreate with `node scripts/prepare-panel-art.mjs /absolute/path/to/node_modules/sharp`. Sharp is used only for offline extraction, compositing and nearest-neighbor preparation; it is not a runtime dependency.

## Exact prompt

```text
Use case: precise-object-edit
Asset type: local original pixel-art background for the game Next, Please!, native viewport 570 by 320.
Input image: archives-clinic-source.png is the edit target. Keep the entire original composition.
Primary request: Change ONLY the woman's facial expression from sorrowful/downcast to quietly neutral and matter-of-fact. She is an ordinary medical secretary calmly handing over documents, emotionally indifferent, not sad or depressed. Relax the eyebrows into level natural arches, lift the drooping inner-eye expression, soften the heavy dark under-eye marks slightly, and make the closed mouth naturally level with relaxed corners. Keep her face recognizable, middle-aged and ordinary. No smile, no smirk, no glamour.
Invariants: Preserve her identity, hair, head position, face size, clothing, hands, document handoff, folder, all furniture, all filing cabinets, paperwork, lamp, room architecture, lighting, color palette, and dark quiet left wall. Change only the small facial expression details. Preserve the original 1672-by-940 landscape frame with no crop or composition shift.
Style: Match the existing crisp limited-palette pixel clusters, muted olive and charcoal institutional interior, yellowed lighting, hard pixel edges. No smooth face, no antialiasing, no new colors or photorealism.
Constraints: No words, letters, numbers, dates, flags, logos or watermark. No new objects, no changes outside the face. Opaque image.
```

