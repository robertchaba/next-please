# Separate employer and ZUS seals — 2026-10-25

Two original transparent ink assets were generated separately with the built-in OpenAI `image_gen` tool using the imagegen skill. They match the existing muted analog clinic artwork. They are stylized game assets, not reproductions of official seals or real company branding.

| Institution | Retained source | Runtime sprite | Runtime dimensions |
| --- | --- | --- | --- |
| ZUS | `public/assets/art/document-seal-zus-source.png` | `public/assets/art/sprites/document-seal-zus.png` | 36 × 24 |
| Employer | `public/assets/art/document-seal-employer-source.png` | `public/assets/art/sprites/document-seal-employer.png` | 24 × 24 |

The ZUS impression is a worn blue rectangle with readable ZUS initials; the employer seal is a faded violet double circle with an industrial cog. Shape and color distinguish them at native resolution. The existing round medical seal remains on clinic notes. Referrals use the employer asset; letters and envelopes select the asset from the persisted sender, including compact sheets and stored papers. ZUS stays ZUS in both interface languages; its accessible description is localized. This does not add authenticity-checking mechanics.

Use [the preparation script](../scripts/prepare-drawer-documents-art.mjs) with an offline Sharp installation:

```sh
node scripts/prepare-drawer-documents-art.mjs /absolute/path/to/node_modules/sharp
```

Preparation crops transparent margins (alpha values at or below 8 are ignored only to locate bounds) and resizes with nearest-neighbor sampling. Generated alpha inside the crop is retained. No code-drawn substitute, repainting or runtime generation is used. The original source files remain alongside the prepared sprites.

Selected crops (left, top, width, height): ZUS (127,251,1289,585); employer (250,251,754,757). Both were inspected on the cream paper at native resolution: [ZUS letter](letter-seal-zus-screen.png), [employer letter](letter-seal-employer-screen.png).

These images were generated specifically for this project. No acquired third-party asset license or attribution is involved; use and redistribution follow the applicable OpenAI terms for generated outputs.

## Exact prompts

### document-seal-zus

Transparency requested: true.

```text
Use case: stylized-concept
Asset type: original transparent raster ink-stamp sprite for the 570x320 pixel-art game Next, Please!, an unnamed 1983 occupational-medicine clinic.
Primary request: a single small WIDE RECTANGULAR institutional rubber-stamp impression identifying the letter sender ZUS. Exact readable central text: "ZUS" (Z, U, S), three clear block capitals. Thin worn double rectangular border, a few tiny unreadable bureaucratic ticks below the letters, uneven faded blue-black stamp ink, slightly broken edges and dry ink gaps. Original period impression, not a copy of a real official seal or modern logo.
Composition: flat impression viewed straight from above, horizontal 3:2 bounding-box proportions, complete border, transparent everywhere between ink marks, no paper or background. Final native sprite 36x24 pixels; make the three letters and rectangular silhouette readable at that size. Use strong deliberate square-pixel clusters and crisp nearest-neighbor-like edges. Muted desaturated blue ink around #435e7b, subtle pressure variation. Matches a worn analog clinic with olive furnishings and cream paperwork.
Avoid: round stamp, medical cross, coat of arms, eagle, modern branding, real address, dates, extra legible words, gloss, shadow, vector cleanliness, smooth antialiasing. True transparent alpha.
```

### document-seal-employer

Transparency requested: true.

```text
Use case: stylized-concept
Asset type: original transparent raster ink-stamp sprite for the 570x320 pixel-art game Next, Please!, an unnamed 1983 occupational-medicine clinic.
Primary request: a single small ROUND employer's rubber-stamp impression for industrial workplace referrals and employer correspondence. Worn double concentric circle with a simple small industrial cog in the center; around it sparse non-legible short radial ink ticks suggesting worn office lettering, no readable words or initials. Muted faded violet ink around #706083, dry gaps and uneven pressure. Clearly different from a rectangular blue ZUS stamp and from a clinic medical cross seal.
Composition: flat impression seen directly from above, circular silhouette square 1:1 bounding box, no rotation perspective, all of the outer circle visible. Fully transparent between ink marks; no paper or solid fill. Native target 24x24 pixels, readable at 22px: crisp deliberate square-pixel clusters, restrained detail, two thin distressed rings and a distinct central cog. Original fictitious generic workplace seal matching cream paperwork and worn olive analog clinic art.
Avoid: medical cross, ZUS letters, eagle, official coat of arms, modern logo, real company name, legible text, photo, 3D, glow, drop shadow, smooth vector lines or antialiasing. Preserve true alpha.
```

