# Music

The application repeats these seventeen tracks in order on the title screen, introduction, cabinet and clinic panels. Ordinary home/day settlement and unsuccessful game endings each use their own recording, listed below. Moving between ordinary clinic screens preserves playback; entering or leaving home, or reaching a terminal failure, changes the active playlist.

| File / title | Supplied by | Generation source |
| --- | --- | --- |
| `Bureaucratic March 1.mp3` | Robert Chaba | Previously credited as AI-generated with Suno; filename updated |
| `Bureaucratic March 2.mp3` | Robert Chaba | Previously credited as AI-generated with Suno; filename updated |
| `Bureaucratic March 3.mp3` | Robert Chaba | Previously credited as AI-generated with Suno; filename updated |
| `Happy Bureaucratic Anthem.mp3` | User-provided project file | Track-specific source pending confirmation |
| `Negative Bureaucratic March.mp3` | User-provided project file | Track-specific source pending confirmation |
| `New Bureaucratic March 1.mp3` | User-provided project file | Track-specific source pending confirmation |
| `New Bureaucratic March 2.mp3` | User-provided project file | Track-specific source pending confirmation |
| `Officious March.mp3` | Robert Chaba | AI-generated with Suno |
| `Square Stomp.mp3` | User-provided project file | Track-specific source pending confirmation |
| `Bureaucratic Efficiency.mp3` | Pre-existing user workspace file | Track-specific source pending confirmation |
| `Bureaucratic Loop.mp3` | Pre-existing user workspace file | Track-specific source pending confirmation |
| `Bureaucratic Pulse.mp3` | Pre-existing user workspace file | Track-specific source pending confirmation |
| `Bureaucratic March 4.mp3` | User-provided project file, registered 2026-10-25 | Track-specific source pending confirmation |
| `Bureaucratic Pulse 2.mp3` | User-provided project file, registered 2026-10-25 | Track-specific source pending confirmation |
| `File 42.mp3` | User-provided project file, registered 2026-10-25 | Track-specific source pending confirmation |
| `Menu Loop.mp3` | User-provided project file, registered 2026-10-25 | Track-specific source pending confirmation |
| `Untitled.mp3` | Pre-existing user workspace file | Track-specific source pending confirmation |

| Special file / title | Use | Provenance |
| --- | --- | --- |
| `Wissenschaftlicher Optimismus - EOD.mp3` | Repeats only at home during day settlement; excluded from the ordinary playlist and its previous/next navigation | User-provided project file, registered 2026-10-25; track-specific source pending confirmation |
| `Game Over.mp3` | Repeats only for the terminal bankruptcy and hospital endings; excluded from ordinary work, ordinary settlement, and their previous/next navigation. A pending assault still uses work music until the ending occurs | User-provided project file, registered 2026-10-27; track-specific source and redistribution terms pending confirmation; supplied bytes unchanged |
| `Victory Fanfare - SUCCESS.mp3` | Reserved for future success scenes; deliberately unregistered and never selected for playback | User-provided project file, noted 2026-10-25; track-specific source pending confirmation |
| `Victory Fanfare.mp3` | Byte-identical older alias of the reserved success cue; removed from the ordinary playlist and unregistered | User-provided project file; track-specific source pending confirmation |

Both success filenames contain the same 876,832-byte recording (SHA-1 `f3cbd5155fee3660ddec79cf40e90efdf7666f58`). They are both excluded from registration and ordinary playback so the older alias cannot bypass the reserved-success designation. Both supplied files remain unchanged in the repository.

The original four user-provided files were copied unchanged from `dist/assets/audio/music/` into this source folder on 2026-10-23 so builds retain them. Robert identified that music's generation source as Suno. The game retains its Suno credit. Earlier rescans registered fourteen ordinary tracks. The 2026-10-25 rescan found six additional recordings: four ordinary tracks, the end-of-day recording, and the reserved success cue. The identical older success alias was subsequently removed from ordinary playback, leaving seventeen ordinary tracks. None of their bytes were modified.

Individual generation/source URLs, applicable redistribution terms/license URLs, and any required attribution have not yet been supplied; confirm and record those details before distribution. Identifying the generation platform does not establish a redistribution license.

The manifest, ordinary, end-of-day and game-over playlists, state-based playlist selector and reserved file list live in `src/core/music.ts`. Adding or renaming a file requires updating its classification there and this provenance record. Add any new confirmed required attribution to both dictionaries in `src/i18n.ts`. `tests/music.test.ts` accounts for every folder recording exactly once and keeps the special files out of the ordinary playlist. Always put source recordings here, not in `dist/`, which Vite replaces on every build. Keep original masters outside the deployed assets folder.

Audio starts muted. Click the speaker button to enable it. The previous/next buttons beside it select adjacent tracks within the current context, wrap at either end, and preserve mute. Before the first playback, they select a starting track without downloading audio. All three buttons work with Tab and Enter/Space and have Polish and English labels. The small volume slider remembers its setting independently of mute and supports dragging, arrow keys, and Home/End. Three tiny bars beside the speaker respond during audible playback and stay static with reduced motion. When an unmuted preference is saved, the first click or key press after loading starts the active playlist. The ordinary playlist repeats after seventeen tracks. The speaker toggle does not restart a track. Context changes cancel pending loads so a home or ending recording cannot start after returning to work or restarting. Loading a terminal save selects the game-over context while preserving mute and gesture unlocking. See the [audio notes](../README.md).
