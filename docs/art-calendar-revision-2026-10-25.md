# Tear-off calendar revision — 2026-10-25

The user requested more breathing room below the day, black date ink, and tiny side printing like the name-day notes and household tips on older tear-off calendars. The existing generated calendar was inspected and supplied as an edit target to the built-in OpenAI `image_gen` tool, with transparency preserved.

- Original source retained: `public/assets/art/workstation-calendar-source.png`.
- Side-printing source retained: `public/assets/art/workstation-calendar-detailed-source.png`.
- Current source with darker paper: `public/assets/art/workstation-calendar-muted-source.png`, 1366 × 1151.
- Runtime sprite: `public/assets/art/sprites/workstation-calendar.png`, 48 × 40.
- Position: (349,118), next to the paperclip holder, projecting above the rear desktop edge.
- Preparation: [the shared offline script](../scripts/prepare-drawer-documents-art.mjs) crops alpha bounds and uses nearest-neighbor resizing, preserving generated alpha inside the crop.

The revised paper has tiny non-legible printed columns at its sides and a blank center. These decorative ink marks are generated artwork, not invented Canvas text. The localized month and day are drawn separately in dark ink using the compact document font: five-pixel-high capitals and ten-pixel-high day numerals. Neither the visible calendar nor its accessible description states the year. Calendar dates remain derived from the saved day.

The current source is cropped at (70,134), 1277 × 909, then resized to 48 × 40. The follow-up layout correction reduced the earlier 64 × 54 footprint by about 25% and moved it five pixels back from its first compact position, keeping its horizontal center unchanged. The month origin is (22,11); the day uses the compact font at 2× around (22,18). Visible ink occupies y = 12–16 and y = 20–29 relative to the sprite, leaving clear paper above and below. A second built-in `image_gen` edit subtly darkened only the paper to warm aged beige while retaining the stand, rings, side printing and transparent background. Native PL and two-digit EN layouts were inspected: [desk view](workstation-calendar-screen.png), [detail at 4×](calendar-detail-screen.png), [30 November in English](calendar-double-digit-en-screen.png).

The asset is original generated project artwork, with no acquired third-party image or separate asset license; use and redistribution follow the applicable OpenAI terms for generated outputs.

## Exact side-printing edit prompt

Transparency requested: true. Edit reference: the original calendar source above.

```text
Use case: precise-object-edit
Edit target: the supplied original transparent olive desk-calendar sprite. Preserve its worn analog clinic pixel-art style, olive metal/bakelite wedge stand, two dark binder rings, subtle cream paper texture, slight visible right side, and true transparent background.
Change the proportions of the cream tear-off calendar page to give it more usable paper and breathing room. Final sprite target is 64x54 native pixels. The flat front paper should occupy nearly the whole front (roughly x6..56, y10..45 of a 64x54 footprint), with only a slim olive base below it. Make the paper's center clean and completely BLANK for game-rendered date lettering, leaving a clear central column roughly 24 native pixels wide. Do not add any date, year, month name or large numeral.
Add two very narrow columns of tiny dark warm-gray preprinted typographic texture, one to the LEFT of the blank central date field and one to the RIGHT. These should suggest the miniature name-day notes, household tips or recipe snippets found on old tear-off calendars, but be non-legible at native resolution: short uneven lines made of small glyph-like clustered ink marks, about 4 to 6 short lines per side, low contrast, entirely inside the page. Keep them to the outer side columns, around x9..16 and x47..54, mainly y22..37. The center and lower center must remain empty with generous cream paper margin below where a large day digit will later be drawn. No legible names, recipes, country, year, emblems or additional calendar objects.
Hard crisp original low-resolution pixel clusters, nearest-neighbor-like square edges, muted cream/olive/brown palette matching the reference. No blur, glossy 3D, vector icons, harsh outlines or invented UI controls. Keep alpha transparent outside the complete object. This is one revised calendar sprite, not a scene or mockup.
```

## Exact paper-color edit prompt

Built-in `image_gen`, transparency requested: true. Edit target: `public/assets/art/workstation-calendar-detailed-source.png`. Result retained as `public/assets/art/workstation-calendar-muted-source.png`; no CLI/API fallback was used.

```text
Use case: precise-object-edit
Asset type: original transparent pixel-art desk calendar sprite for Next, Please!
Input image: the supplied workstation-calendar-detailed-source.png is the EDIT TARGET, not a loose style reference.
Primary request: make ONLY the cream paper page slightly darker and less luminous, so it blends quietly into a dim old-fashioned olive clinic. Lower the paper brightness about 15–18 percent to a subdued warm aged beige, approximately #d4c3a3 in its central light areas. It must still look like light paper, not dark brown cardboard.
Preserve the exact existing object silhouette, proportions, two binder rings, olive stand, rust and wear, right sidewall, perspective, paper edges, tiny illegible side-printing, and blank central field. Preserve the pixel clusters and framing as closely as possible. Keep the olive stand and metal rings at their current brightness; the color change applies only to the paper. Do not invent new objects, marks, details, text, numbers, dates, shadows, or backgrounds. No date lettering: localized month and day are drawn separately by the game.
Retain true transparent alpha outside the complete object, with no opaque background, no checkerboard, no new border, and no glow. Keep hard square pixel edges, restrained texture, and the same approved analog-clinic illustration. This is a subtle paper-color revision of the existing sprite, not a redesign.
```

