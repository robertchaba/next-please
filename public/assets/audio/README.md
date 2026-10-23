# Music and sound effects

Ten supplied MP3s are bundled in [music/](music/README.md) and registered in `src/core/music.ts`. Four original effects are registered in `src/core/effects.ts`. The Howler manager in `src/core/audio.ts` provides lazy loading, separate music/effect volumes, mute, playlists, previous/next controls, and user-gesture unlocking.

## Original effects

| ID / file | Use | Duration |
| --- | --- | --- |
| `typewriter` / `typewriter.wav` | Mechanical key strike and release during text reveal | 85 ms |
| `carriage` / `carriage.wav` | Short carriage slide and stop between introduction cards | 360 ms |
| `stamp` / `stamp.wav` | Rubber stamp hitting a document | 160 ms |
| `paper` / `paper.wav` | Handling a document or manual | 250 ms |

Created specifically for Next, Please! on 2026-10-23 with the original deterministic synthesis code in [`scripts/generate-effects.mjs`](../../../scripts/generate-effects.mjs). No samples, external recordings, downloaded assets, voices, or third-party material are used. The sounds combine seeded filtered noise with damped mechanical resonances; each is mono 44.1 kHz, 16-bit PCM WAV with quiet peaks, clean endpoints and no added silence. Reproduce the committed files with `node scripts/generate-effects.mjs`; no dependencies or network access are needed.

Provenance: project-original computer-synthesized audio, prepared with Codex for Robert Chaba. Source: the linked repository script. Redistribution terms: the same terms as this project's original source and assets; no separate third-party license, license URL, or attribution requirement applies. The repository does not currently declare an open-source license; these notes do not grant a separate public license.

Register `effectsManifest` once with `audio.register(effectsManifest)`, then call `audio.playSound('typewriter')` (or another ID) after a user gesture has unlocked audio. For frequent text reveals, skip whitespace and limit keys to around one every 60 ms; finishing or skipping a card should not queue a burst of all remaining keys. Check `audio.isMuted()` before requesting an effect to avoid loading inaudible effects. No drawing function should request playback.

## Playback

Registration does not fetch or play audio. The application starts muted unless a saved preference says otherwise. Enabling sound starts the playlist in that gesture; a saved unmuted preference starts it on the first click or key press. Track changes repeat the playlist, and moving between the title screen and panels does not restart it. The application owns playback so future gameplay can use the same music continuously. Muting an active playlist silences it without resetting its position.

`playPlaylist(ids, onError)` prepares a registered sequence without loading audio, and starts the selected track only after unlock while unmuted. Repeating that call preserves playback, even during loading. `previousTrack()` and `nextTrack()` wrap the sequence and skip known failed tracks. During playback they stop the old track and play the selected one with the current mute setting; before playback they only change the selection. Track selection is not persisted. Missing or undecodable tracks are skipped; failure of all tracks reports an error instead of retrying indefinitely. A playback rejection stops that request and reports an error; a later gesture can retry. `stopMusic()` cancels playlist playback and resets selection. `playMusic(id)` can play a standalone track, looping by default. Sound effects use `playSound(id)` and do not loop by default. Playback methods return whether a request was accepted, not whether decoding has completed; navigation methods also return true for a selection made before playback.

Put music MP3 files in `music/` and sound effects in this folder. Register local URLs resolved with `import.meta.env.BASE_URL`; do not hotlink audio. Keep original masters outside deployed assets and use compact game versions with consistent volume. Provide codec alternatives when needed.

The title screen's volume slider controls music from 0–100% and saves the value separately from mute (default 40%). `getMusicVolume()` reads that setting. `isMusicAudible()` excludes pending loads, muted/zero-volume music, and suspended Web Audio playback. `getMusicLevels()` lazily observes Howler's master mix and returns three integer bar heights for the speaker's tiny meter. The UI samples outside rendering at 10 Hz while visible, skips analysis for reduced motion, and renders a static indicator when Web Audio analysis is unavailable. The meter never starts playback or creates a second output path.

For every recording, document its title, creator, source URL, license identifier/version and URL, required attribution, and modifications before distribution. The supplied music is credited as AI-generated with Suno, as identified by Robert. Individual source URLs and redistribution terms remain pending in the music notes. Add any further confirmed required attribution to the game's credits.
