# Formality progression artwork — 2026-10-26

The v0.8 banknote and two additional seal impressions were generated with the built-in OpenAI `image_gen` tool and the imagegen skill. No CLI/API fallback or runtime generation was used. The existing generated `sprites/workstation-paper.png` supplies the specialist certificate and institutional letters; their localized wording is rendered separately. These additions follow the approved worn olive clinic, yellowed paper and subdued ink palette.

| Asset | Retained generated source | Runtime sprite | Native size |
| --- | --- | --- | --- |
| Old 100 zł with Ludwik Waryński | `public/assets/art/banknote-100-source.png` | `public/assets/art/sprites/banknote-100.png` | 92 × 42 |
| Medical Chamber seal | `public/assets/art/document-seal-chamber-source.png` | `public/assets/art/sprites/document-seal-chamber.png` | 24 × 24 |
| Unclear employer seal | `public/assets/art/document-seal-employer-unclear-source.png` | `public/assets/art/sprites/document-seal-employer-unclear.png` | 24 × 24 |

The banknote is a small pixel-art interpretation of the requested historical note: cream paper, rusty red ornament, two readable 100 denominations and Waryński's portrait on the right. Remaining microprinting is intentionally abstract. It introduces no new place name or readable issue date into the clinic scene. Its appearance does not establish the game's country.

The Medical Chamber uses an original brick-red oval impression around a physician's staff and one serpent. It is a fictional game seal, not a reproduction of an official chamber emblem. Color and silhouette distinguish it from the blue rectangular ZUS seal, violet employer cog and clinic cross. The unclear seal is a generated edit of the project's own employer impression, with broken rings and a smeared center. A missing seal is represented by omitting the impression; a clear seal uses the existing employer asset.

## Historical reference and provenance

The [Muzeum Papiernictwa catalogue, *Tysiące, miliony, miliardy*](https://muzeumpapiernictwa.pl/wp-content/uploads/2022/02/TysiaceMilionyMiliardy_2022-02-15_72dpi.pdf), printed p. 102, identifies the 100 zł note with Waryński on the right, dimensions 138 × 63 mm, dark-brown/red printing and yellow/red underprint. It credits Andrzej Heidrich for the banknote design, Bogusław Brandt for plate engraving and Jerzy Kamiński for guilloches. The [museum object published by Historia: Poszukaj](https://www.historiaposzukaj.pl/wiedza%2Cobiekty%2C1876%2Cobiekt_banknot_100_zl_z_wizerunkiem_ludwika_warynskiego_ze_zbiorow_muzeum_papiernictwa_w_dusznikach_zdroju.html) was also located during reference research.

The actual appearance reference inspected and passed to generation was the obverse photograph from [Antykwariat Numizmatyczny Karol Karbownik's OneBid listing](https://onebid.pl/pl/banknoty-polska-prl-100-zlotych-1975-seria-a/2088611), [image](https://img1.onebid.pl/img/5874/1715291_1b.jpg). That photograph was downloaded outside the project solely as a generation reference; it is **not bundled or redistributed**. No license to redistribute the auction photograph is claimed. The second reference was this project's own `cabinet-workstation.png`, used only for its pixel-art style and palette.

The delivered banknote sprite and its retained source are newly generated stylized artwork, not a resized copy of the photograph. Generated-output use and redistribution follow applicable OpenAI terms; this record does not assert a stock-image license or grant rights in an underlying historical currency design. The two seal assets are original project artwork, with no acquired third-party imagery or separate attribution requirement.

## Exact prompts and preparation

The complete prompts are retained as [banknote](art-prompts/v0.8/banknote.txt), [chamber seal](art-prompts/v0.8/chamber.txt), and [unclear seal](art-prompts/v0.8/unclear.txt). Transparency was requested for all three. The banknote used the two references described above; the chamber seal had no image input; the unclear seal used the existing generated `sprites/document-seal-employer.png` as its edit target.

Run the [preparation recipe](../scripts/prepare-progression-art.mjs) with an offline Sharp installation:

```sh
node scripts/prepare-progression-art.mjs /absolute/path/to/node_modules/sharp
```

The script uses alpha above 8 only to locate nonempty bounds, retains generated alpha within them, and resizes with nearest-neighbor sampling. The chamber impression preserves its tall oval proportions within the transparent 24 × 24 frame. There is no drawing, repainting, invented geometry or smoothing in asset preparation. Sharp is an offline tool, not a dependency of the game.

Selected crops (left, top, width, height): banknote `(44, 48, 1770, 767)`, chamber `(224, 80, 805, 1093)`, unclear employer `(202, 204, 849, 872)`. All runtime sprites were inspected at native resolution and retain transparent margins. The banknote's portrait and value remain visible at the intended desk size; the two seals differ clearly in color and silhouette.

## In-game verification

The public save-import path and semantic controls are exercised by `tests/browser/progression.spec.ts`. Ten browser checks cover all three directive letters in both languages, valid and invalid specialist certificates, both hidden outcomes of unclear referral seals, recorded telephone conclusions, audible exchange and pulse-dial sounds with mute, banknote return and acceptance, the normal refusal bonus and the hospital ending. `npm run build` and the complete progression browser suite passed after integration.

Reviewed screenshots: [Medical Chamber letter](progression-chamber-letter-screen.png), [specialist conversation and certificate](progression-specialist-call-screen.png), [unclear referral](progression-unclear-referral-screen.png), [offered banknote](progression-banknote-screen.png), [hospital ending](progression-hospital-screen.png). Text and phone targets fit their paper, the banknote sits clear of the accumulated left-side documents, and the full ending text stays inside the established scene.
