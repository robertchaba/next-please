# Stationery artwork — 0.8.3 (superseded proposal)

The ornamental-paper approach below was rejected. Its sources and recipe remain as a production archive; the game no longer loads or renders those bordered sheets or the small decorative militia/LOT seals. See [the replacement design](document-design-2026-10-28.md) for plain paper, new letterheads, larger readable stamps and revised typography. The kraft envelope remains in use.

Created for **Next, Please!** on 2026-10-28 with the built-in `image_gen` tool and the `imagegen` skill. No CLI/API fallback or acquired artwork was used. These are original game props, with no separate stock-asset license or attribution requirement; they are not reproductions of official credentials or institutional logos. Robert Chaba's creator credit remains unchanged.

The approved [clinic screenshot](paperwork-dated-pl-screen.png) was the palette and style reference for each paper and the envelope. New shield and aviation seals use original motifs without national emblems or the actual LOT logo. Language does not establish the clinic's country. The generated assets contain no localized wording; all titles, identities, findings and accessible labels remain in `src/i18n.ts`.

## Sources, prompts and runtime assets

Every full generated source is retained in `public/assets/art/paperwork-v083/{name}-source.png`. Each exact prompt is retained in [art-prompts/paperwork-v083/](art-prompts/paperwork-v083/).

| Name / exact prompt | Runtime sprite | Dimensions | Use |
| --- | --- | --- | --- |
| [referral](art-prompts/paperwork-v083/referral.txt) | `sprites/paper-referral-v083.png` | 188 × 144 | Ivory employer referrals, additional-examination requests, opened correspondence |
| [militia](art-prompts/paperwork-v083/militia.txt) | `sprites/paper-militia-v083.png` | 188 × 144 | Gray-green militia referrals |
| [lot](art-prompts/paperwork-v083/lot.txt) | `sprites/paper-lot-v083.png` | 188 × 144 | Blue-edged pilot referrals |
| [certificate](art-prompts/paperwork-v083/certificate.txt) | `sprites/paper-certificate-v083.png` | 188 × 144 | Sage ornamental fitness certificates, blank dotted identity fields |
| [clinical](art-prompts/paperwork-v083/clinical.txt) | `sprites/paper-clinical-v083.png` | 188 × 144 | Specialist certificates and additional-examination reports, unruled body for findings |
| [envelope](art-prompts/paperwork-v083/envelope.txt) | `sprites/paper-envelope-v083.png` | 188 × 144 | Kraft envelopes, cream address label and curled opening corner |
| [seal-militia](art-prompts/paperwork-v083/seal-militia.txt) | `sprites/seal-militia-v083.png` | 44 × 44 | Original distressed shield, drawn at 22 × 22 |
| [seal-lot](art-prompts/paperwork-v083/seal-lot.txt) | `sprites/seal-lot-v083.png` | 64 × 44 | Original distressed aviation oval, drawn at 32 × 22 |

The original paper sources are approximately 1430 × 1100 pixels; their exact alpha bounds are printed by the preparation script. Preserved crop rectangles (left, top, width, height): referral `22,52,1390,1029`; militia `34,52,1366,1011`; LOT `45,60,1343,988`; certificate `33,52,1364,997`; clinical `34,47,1366,1006`; envelope `50,91,1335,925`; militia seal `58,64,1139,1129`; LOT seal `18,246,1219,836`.

## Preparation and integration

```sh
node scripts/prepare-paperwork-v083-art.mjs /absolute/path/to/node_modules/sharp
```

The recipe crops transparent margins (alpha > 8 selects bounds), preserves generated alpha inside those bounds, and resizes with nearest-neighbor sampling. It does not synthesize paper, ornament, ink or texture. Sharp is an offline preparation tool, not a project/runtime dependency. Sources remain untouched.

`src/render/clinic.ts` loads the local sprites through the existing artwork lifecycle. `src/render/paperwork.ts` chooses employer artwork from the stable profession: militia 45, pilot 46, ordinary employer otherwise. Missing seals remain absent and unclear impressions retain the existing smudged asset. Both variants preserve the same document fields, geometry and phone targets. The aviation heading sits below the generated wing ornament. Envelope text wraps within its 118-pixel address label; the sender seal sits below the label, clear of the opening corner. Medical notes retain the existing plain paper without a printed header or seal.

The four original bitmap faces in `src/render/font.ts` separate compact print, typewriting, handwriting and book lettering. They share glyph advances, seven-row cells, eight-pixel line spacing and Polish accent support. Localized text and state-driven circles/impressions remain runtime overlays. Long medical notes use the [generated rulebook folds](art-manual-2026-10-28.md), with twelve body rows per page and a folio below them.

## Review

Prepared assets were inspected at native resolution, then checked in the game in Polish and English. The report received a separate unruled clinical sheet after the certificate's dotted fields proved distracting beneath findings. The LOT heading was lowered to clear its generated ornament. Existing semantic document footprints, telephone hit areas, certificate writing corner and envelope-opening target are preserved.

Browser previews: [militia referral](paperwork-v083-militia-pl-screen.png), [LOT referral](paperwork-v083-lot-en-screen.png), [fitness certificate](paperwork-v083-certificate-pl-screen.png), [envelope](paperwork-v083-envelope-pl-screen.png), [additional report](paperwork-v083-additional-result-pl-screen.png). The [second page of medical notes](notes-v083-additional-results-screen.png) retains the psychiatric and X-ray findings. See also [rulebook assets and previews](art-manual-2026-10-28.md).
