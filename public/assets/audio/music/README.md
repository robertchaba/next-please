# Music

The application repeats these tracks in order on the title screen and all panels. Playback continues through the introduction and cabinet; no scene-specific restart is needed.

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
| `Victory Fanfare.mp3` | User-provided project file | Track-specific source pending confirmation |
| `Bureaucratic Efficiency.mp3` | Pre-existing user workspace file | Track-specific source pending confirmation |
| `Bureaucratic Loop.mp3` | Pre-existing user workspace file | Track-specific source pending confirmation |
| `Bureaucratic Pulse.mp3` | Pre-existing user workspace file | Track-specific source pending confirmation |
| `Untitled.mp3` | Pre-existing user workspace file | Track-specific source pending confirmation |

The original four user-provided files were copied unchanged from `dist/assets/audio/music/` into this source folder on 2026-10-23 so builds retain them. Robert identified that music's generation source as Suno. The game retains the credit “Generated with Suno” / “Wygenerowana z pomocą Suno.” A rescan on the same date found the numbered Bureaucratic March filenames and six additional recordings listed above; all ten are now registered. No audio files were modified by the rescan. Version 0.2 also registers the four additional existing workspace recordings listed above, without changing their bytes; the playlist and both credit lists now contain fourteen tracks.

Individual generation/source URLs, applicable redistribution terms/license URLs, and any required attribution have not yet been supplied; confirm and record those details before distribution. Identifying the generation platform does not establish a redistribution license.

The manifest and playlist order live in `src/core/music.ts`. Adding or renaming a file also requires updating that manifest and the credit lists in both dictionaries in `src/i18n.ts`. `tests/music.test.ts` checks those against the folder contents. Always put source recordings here, not in `dist/`, which Vite replaces on every build. Keep original masters outside the deployed assets folder.

Audio starts muted. Click the speaker button to enable it. The previous/next buttons beside it select adjacent tracks, wrap at either end, and preserve mute. Before the first playback, they select a starting track without downloading audio. All three buttons work with Tab and Enter/Space and have Polish and English labels. The small volume slider remembers its setting independently of mute and supports dragging, arrow keys, and Home/End. Three tiny bars beside the speaker respond during audible playback and stay static with reduced motion. When an unmuted preference is saved, the first click or key press after loading starts the playlist. It continues across screens, repeats after the fourteenth track, and respects the speaker toggle without restarting the track. See the [audio notes](../README.md).
