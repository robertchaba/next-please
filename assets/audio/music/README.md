# Music

The application repeats these seventeen tracks in order on the title screen, introduction, cabinet and clinic panels. Ordinary home/day settlement and unsuccessful game endings each use their own recording, listed below. Moving between ordinary clinic screens preserves playback; entering or leaving home, or reaching a terminal failure, changes the active playlist.

| File | Embedded title | Supplied by | Generation source |
| --- | --- | --- | --- |
| `Bureaucratic March - Opening the Office.mp3` | Bureaucratic March: Opening the Office | Robert Chaba | Previously credited as AI-generated with Suno; filename updated |
| `Bureaucratic March - The Waiting Room.mp3` | Bureaucratic March: The Waiting Room | Robert Chaba | Previously credited as AI-generated with Suno; filename updated |
| `Bureaucratic March - In Triplicate.mp3` | Bureaucratic March: In Triplicate | Robert Chaba | Previously credited as AI-generated with Suno; filename updated |
| `Happy Bureaucratic Anthem - Everything in Order.mp3` | Happy Bureaucratic Anthem: Everything in Order | User-provided project file | Suno identified by embedded metadata; source URL in the album manifest |
| `Negative Bureaucratic March - Application Denied.mp3` | Negative Bureaucratic March: Application Denied | User-provided project file | Suno identified by embedded metadata; source URL in the album manifest |
| `New Bureaucratic March - Revised Procedure.mp3` | New Bureaucratic March: Revised Procedure | User-provided project file | Suno identified by embedded metadata; source URL in the album manifest |
| `New Bureaucratic March - Further Instructions.mp3` | New Bureaucratic March: Further Instructions | User-provided project file | Suno identified by embedded metadata; source URL in the album manifest |
| `Officious March - By the Book.mp3` | Officious March: By the Book | Robert Chaba | AI-generated with Suno |
| `Square Stomp - Corridor Footsteps.mp3` | Square Stomp: Corridor Footsteps | User-provided project file | Suno identified by embedded metadata; source URL in the album manifest |
| `Bureaucratic Efficiency - Stamp and File.mp3` | Bureaucratic Efficiency: Stamp and File | Pre-existing user workspace file | Suno identified by embedded metadata; source URL in the album manifest |
| `Bureaucratic Loop - Please Wait.mp3` | Bureaucratic Loop: Please Wait | Pre-existing user workspace file | Suno identified by embedded metadata; source URL in the album manifest |
| `Bureaucratic Pulse - Office Hours.mp3` | Bureaucratic Pulse: Office Hours | Pre-existing user workspace file | Suno identified by embedded metadata; source URL in the album manifest |
| `Bureaucratic March - The Paper Trail.mp3` | Bureaucratic March: The Paper Trail | User-provided project file, registered 2026-10-25 | Suno identified by embedded metadata; source URL in the album manifest |
| `Bureaucratic Pulse - Under Pressure.mp3` | Bureaucratic Pulse: Under Pressure | User-provided project file, registered 2026-10-25 | Suno identified by embedded metadata; source URL in the album manifest |
| `File 42 - Pending Review.mp3` | File 42: Pending Review | User-provided project file, registered 2026-10-25 | Suno identified by embedded metadata; source URL in the album manifest |
| `Menu Loop - Before the Bell.mp3` | Menu Loop: Before the Bell | User-provided project file, registered 2026-10-25 | Suno identified by embedded metadata; source URL in the album manifest |
| `Untitled - A Note in the Margin.mp3` | Untitled: A Note in the Margin | Pre-existing user workspace file | Suno identified by embedded metadata; source URL in the album manifest |

| Special file | Embedded title | Use | Provenance |
| --- | --- | --- | --- |
| `Wissenschaftlicher Optimismus - Feierabend.mp3` | Wissenschaftlicher Optimismus: Feierabend | Repeats only at home during day settlement; excluded from the ordinary playlist and its previous/next navigation | User-provided project file, registered 2026-10-25; Suno identified by embedded metadata; source URL in the album manifest |
| `Game Over - The Final Stamp.mp3` | Game Over: The Final Stamp | Repeats for hospital, bankruptcy and all three negative chapter endings; excluded from ordinary work, ordinary settlement, and their previous/next navigation. A pending assault still uses work music until the ending occurs | User-provided project file, registered 2026-10-27; source identified as Suno by embedded metadata; redistribution terms pending confirmation; audio unchanged |
| `Victory Fanfare - All Clear.mp3` | Victory Fanfare: All Clear | Repeats for the three positive chapter endings; continuing work restores the ordinary playlist | User-provided project file, noted 2026-10-25; Suno identified by embedded metadata; source URL in the album manifest |

The older `Victory Fanfare.mp3` alias was removed at the user’s request on 2026-10-29 after confirming it was byte-identical to the recording now named `Victory Fanfare - All Clear.mp3` (original size 876,832 bytes; SHA-1 `f3cbd5155fee3660ddec79cf40e90efdf7666f58`). The retained success cue was registered for positive chapter endings in version 1.0.2 at the user’s request. The folder now contains twenty distinct recordings.

The original four user-provided files were copied unchanged from `dist/assets/audio/music/` into this source folder on 2026-10-23 so builds retain them. Robert identified that music's generation source as Suno. The game retains its Suno credit. Earlier rescans registered fourteen ordinary tracks. The 2026-10-25 rescan found six additional recordings: four ordinary tracks, the end-of-day recording, and the reserved success cue. The identical older success alias was subsequently removed from ordinary playback, leaving seventeen ordinary tracks. The initial rescans did not modify the recordings. On 2026-10-29, the metadata and cover were updated as described below; the MP3 audio payloads remain byte-for-byte unchanged.

All supplied MP3s contain Suno generation comments and individual source URLs. Those URLs and the original artist/title tags have been transcribed into the [album manifest](../../../../docs/soundtrack-metadata.json); the linked pages have not been independently verified. Applicable redistribution terms/license URLs and any required attribution remain pending confirmation before distribution. Identifying the generation platform does not establish a redistribution license.

The manifest, ordinary, end-of-day, game-over and victory playlists and state-based playlist selector live in `src/core/music.ts`. Adding or renaming a file requires updating its classification there and this provenance record. Add any new confirmed required attribution to both dictionaries in `src/i18n.ts`. `tests/music.test.ts` accounts for every folder recording exactly once and keeps the special files out of the ordinary playlist. Always put source recordings here, not in `dist/`, which Vite replaces on every build. Keep original masters outside the deployed assets folder.

## Album metadata

Updated on 2026-10-29 at the user’s request. Artist and album artist are **Robert Chaba**, explicitly confirmed by the user. Album: **Next, Please! (Original Game Soundtrack)**. Genre: **Soundtrack**. Recording year: **2026**, matching the original generation timestamps; no release date or composer credit is inferred. Disc: **1/1**. Track tags run from **1/20** through **20/20**: the seventeen ordinary recordings in the existing playlist order, then the home, game-over and reserved success cues. On 2026-10-30, every embedded title received a distinct clinic-themed subtitle while retaining its original title wording, as listed above. Numbered marches and pulses now have descriptive names; the technical ` - EOD` and ` - SUCCESS` filename suffixes remain absent from title tags. Only the title (`TIT2`) frames changed in this revision: artist, album artist, album, track numbers, cover and every other metadata frame were compared before and after and preserved, along with the exact audio payloads. That title-tag revision preserved playback filenames, track IDs, registration, playlist order and context selection: seventeen ordinary tracks, dedicated home and game-over cues, and the reserved, unregistered victory cue.

On 2026-10-31, all twenty filenames were aligned with their embedded titles, replacing `: ` with ` - ` for filesystem compatibility and appending `.mp3`. The filename column above and the album manifest use these current names. Runtime mappings, browser checks and documentation were updated together; stable track IDs, playlist order and context assignments remain unchanged. Complete MP3 files, including every metadata frame and the audio payload, remain byte-for-byte identical.

The [album manifest](../../../../docs/soundtrack-metadata.json) records every track number, display title, filename, source URL, original artist/title, original-file SHA-256 and unchanged-audio SHA-256. The original artist tag was `otherworldlyaria442`. Existing Suno URLs, generation comments, lyrics markers, encoder information, custom frames and embedded C2PA data are retained. Retaining C2PA bytes does not re-sign the edited files or assert that their original whole-file credentials still validate; original files remain available in the pre-edit backup and repository history. The artist URL is [Robert Chaba’s GitHub profile](https://github.com/robertchaba).

The exact user-supplied **Next, Please_ Clinic Office Soundtrack.png** is retained as [soundtrack-cover.png](../../../../docs/soundtrack-cover.png). Its original 1254 × 1254 PNG bytes are embedded as the single front-cover APIC frame in every file, replacing the individual Suno pictures without resizing or recompressing the image. This adds approximately 2.15 MB of cover data per file. The user supplied and selected this image on 2026-10-29; its generation tool, prompt and separate redistribution terms were not supplied. No new artwork was generated for this edit and no separate public license is granted by these notes.

Reproduce or verify with [the offline tagging script](../../../../scripts/tag-soundtrack.py), from the repository root:

```sh
python3 -m venv /tmp/next-please-metadata-venv
/tmp/next-please-metadata-venv/bin/python -m pip install 'mutagen==1.47.0'
/tmp/next-please-metadata-venv/bin/python scripts/tag-soundtrack.py
/tmp/next-please-metadata-venv/bin/python scripts/tag-soundtrack.py --check
```

Mutagen is an offline preparation dependency only; nothing was added to the application’s dependencies or runtime. Tags remain ID3v2.4 with UTF-8 text; obsolete ID3v1 tags are removed to avoid conflicting fields. The script checks the manifest (including nonempty, case-insensitively unique titles) and original audio hashes before writing, stages each edit, verifies its tags, exact cover and preserved source frames, and replaces the source only after those checks pass. It never decodes or re-encodes audio. Keep original masters outside the deployed assets folder.

Audio starts muted. Click the speaker button to enable it. The previous/next buttons beside it select adjacent tracks within the current context, wrap at either end, and preserve mute. Before the first playback, they select a starting track without downloading audio. All three buttons work with Tab and Enter/Space and have Polish and English labels. The small volume slider remembers its setting independently of mute and supports dragging, arrow keys, and Home/End. Three tiny bars beside the speaker respond during audible playback and stay static with reduced motion. When an unmuted preference is saved, the first click or key press after loading starts the active playlist. The ordinary playlist repeats after seventeen tracks. The speaker toggle does not restart a track. Context changes cancel pending loads so a home or ending recording cannot start after returning to work or restarting. Loading a terminal save selects the game-over context while preserving mute and gesture unlocking. See the [audio notes](../README.md).

## Ending playback — 1.0.2 (2026-11-01)

The user assigned the existing Final Stamp recording to all negative endings and All Clear to all positive endings. No MP3 bytes, metadata or source attributions changed. Hospital and bankruptcy retain priority; exposed, clinic-closed (both variants) and detained use Final Stamp; party-continue, union-continue and independent-continue use All Clear while their epilogue is open. Imported endings select the same cue. Mute, volume, gesture unlock and previous/next isolation apply to both; continuation and restart restore ordinary music. Historical references above to the reserved success cue describe the pre-1.0.2 classification.
