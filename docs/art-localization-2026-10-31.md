# English insurance-office seal — 2026-10-31

The English institution name is **SIO (Social Insurance Office)**, paired with ZUS in Polish. Its generated blue rubber impression replaces the baked ZUS letters only when the English locale is selected, including compact envelopes and full-size correspondence. The original Polish asset is retained. NAL aviation headings and stamps use the existing unlettered generated artwork with localized text.

- Source: [`document-seal-sio-source.png`](../public/assets/art/document-seal-sio-source.png).
- Runtime: [`sprites/document-seal-sio.png`](../public/assets/art/sprites/document-seal-sio.png), 36 × 24 RGBA.
- Exact prompt: [`seal-sio.txt`](art-prompts/localization/seal-sio.txt).
- Reference/edit target: [`document-seal-zus-source.png`](../public/assets/art/document-seal-zus-source.png).
- Method: built-in `image_gen`, transparent background, one text-localization edit. Original project-generated art; no acquired third-party stock or official logo. The output is retained for redistribution with the game's assets under the project's existing terms; no additional third-party asset licence applies.

Preparation uses [`prepare-localized-seal.mjs`](../scripts/prepare-localized-seal.mjs): locate alpha above 8, crop transparent margins at `(128, 252, 1290, 584)` from the 1536 × 1024 source, resize to 36 × 24 with nearest-neighbor, preserve generated alpha. No text, shapes or substitute artwork are drawn during preparation.

```sh
node scripts/prepare-localized-seal.mjs /absolute/path/to/node_modules/sharp
```

The crop and runtime size match the original seal's footprint. `drawDocumentSeal` selects the local asset using the supplied locale, without altering the persisted `zus` sender. The generated initials were inspected after reduction on cream paper and in the [English directive preview](localization-sio-en-screen.png). Sources and prompts remain in the repository for reproducibility.
