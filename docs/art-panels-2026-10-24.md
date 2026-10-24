# Archive and staff-room illustrations

Created on 2026-10-24 with the built-in `image_gen` tool and the imagegen skill, using the approved `title-clinic.png` as the sole style reference. Both are new original scenes, use case `stylized-concept`, with opaque backgrounds. No API/CLI generation fallback was used. Neither source is acquired stock artwork or extracted game art; no separate third-party asset license or attribution is required. The original generated files are retained in the repository for project redistribution together with the prepared runtime copies.

| Scene | Retained source | Runtime asset |
| --- | --- | --- |
| Medical secretary handing over records | `public/assets/art/archives-clinic-source.png` | `public/assets/art/archives-clinic.png` |
| Staff talking over coffee | `public/assets/art/break-room-source.png` | `public/assets/art/break-room.png` |

Both runtime PNGs are 570 × 320, prepared from the full source composition with nearest-neighbor sampling. The archive source is 1672 × 940 and the staff-room source is 1675 × 939. The left wall remains quiet for separately rendered localized controls; the characters and activity occupy the right. No dates, place names, or lettering establish a location or period in the artwork. The staff room has coffee cups, a kettle, a small ashtray and a subtly held cigarette as requested. These are static original scenes; their rendering does not generate time or randomness.

Recreate using `node scripts/prepare-panel-art.mjs /absolute/path/to/node_modules/sharp`. Sharp is an offline tool, not a project/runtime dependency. Visually inspected both prepared runtime files at native resolution. Image smoothing remains disabled by the game renderer. `loadClinicArt` loads both assets from the local Vite base URL; `drawPanelIllustration` draws either scene without embedded interface text.

## Exact archive prompt

```text
Use case: stylized-concept
Asset type: original low-resolution pixel art game background, final native frame 570 by 320; landscape 16:9.
Primary request: A medical secretary handing the viewer a small stack of patient documents in the worn occupational-health clinic from the reference. Create a NEW scene, matching only the reference's subdued pixel-art atmosphere and palette.
Input image: the attached title-clinic image is a style and lighting reference, not an edit target.
Scene and subject: On the RIGHT HALF, a tired middle-aged medical secretary in a pale institutional coat sits behind a worn green reception counter. Her face remains modestly lit and simple. One hand extends a stack of yellowed blank forms toward the viewer over the counter, the other steadies a plain manila folder. Filing drawers and uneven piles of paperwork behind her; small cream lamp above the counter. Recognizable human figure and clear paper handoff.
Composition: LEFT 47 PERCENT is very dark, quiet charcoal-olive wall, with only subtle faint plaster texture and no objects or strong highlights. This left space must remain fully usable for separate menu text from top to bottom. Main secretary, forms, furniture, lamp and all bright detail are entirely on the RIGHT, beyond x=275 in the final 570-pixel-wide frame. Straight-on medium-wide composition, no split-screen border.
Style: crisp handcrafted low resolution 2D pixel art, hard square pixel edges and deliberate clusters at native 570x320 scale; sparse ordered dithering, worn wood veneer and olive enamel, analog clinic fittings consistent with an understated 1980s institutional interior. Neither illustration painting nor photographic render; no blur, antialiasing, glossy 3D or smooth gradients.
Palette and mood: nearly black charcoal #141a18, dark olive #353e32, faded green #6b7252, dirty beige #c9c3a1, dull cream #ded9bb, tiny brick red accents; low yellow institutional light, bleak everyday bureaucracy, no horror.
Constraints: absolutely no text, letters, numbers, logos, watermark, readable paperwork, UI, flags, calendar, dates, country identifiers or recognizable characters from another game. This is an unnamed and undated clinic.
```

## Exact staff-room prompt

```text
Use case: stylized-concept
Asset type: original low-resolution pixel art game background, native game frame 570 by 320; landscape 16:9.
Primary request: A quiet staff break room in the worn occupational-health clinic from the reference. Doctors and nurses talk over coffee during a break. Create a NEW scene matching only the reference's subdued pixel-art atmosphere and palette.
Input image: title-clinic.png is a style and lighting reference, not an edit target.
Scene and subject: Entirely on the RIGHT HALF, three ordinary tired adult clinic workers sit or lean around a small wood-veneer table: a middle-aged doctor in a pale coat turned toward two nurses in simple pale institutional uniforms. Their relaxed poses indicate low-key conversation. Ceramic coffee cups on the table, a plain kettle on an old side cabinet, one small ashtray and one subtle lit cigarette held by the doctor with a thin pixelated wisp of smoke. Simple faces partly in shadow. Worn olive chairs, yellowed plaster above olive enamel wainscoting, subdued overhead light. They are resting after routine bureaucracy, not celebrating.
Composition: LEFT 47 PERCENT is very dark quiet charcoal-olive wall and deep shadow with only faint plaster texture, no furniture, people, objects or bright detail. Reserve this entire left area from top to bottom for separate menu lettering. All staff, table, coffee and bright detail must fit on the RIGHT beyond x=275 at final 570-pixel-wide frame. A low-key doorway edge may divide the dark foreground from the room near the center. Straight-on medium-wide composition, readable silhouettes, no split-screen border.
Style: crisp handcrafted low resolution 2D pixel art, hard square pixel edges, deliberate 1-to-3-pixel detail clusters at native 570x320, sparse ordered dithering, analog fittings and clothes consistent with an understated 1980s institutional interior. No antialiasing, blur, digital painting, photographic render, smooth gradients or glossy 3D.
Palette and mood: nearly black charcoal #141a18, dark olive #353e32, faded green #6b7252, dirty beige #c9c3a1 and dull cream #ded9bb, tiny brick red accents. Dim yellow institutional light, mundane slightly melancholy break, no horror.
Constraints: absolutely no text, letters, numbers, logos, watermark, UI, flags, calendar, dates, country identifiers or recognizable copied game characters. Unnamed and undated clinic.
```

