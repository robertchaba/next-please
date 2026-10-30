#!/usr/bin/env python3
"""Apply or verify soundtrack tags without re-encoding audio. Requires mutagen==1.47.0."""

import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import tempfile

from mutagen.id3 import APIC, TALB, TCON, TDRC, TIT2, TPE1, TPE2, TPOS, TRCK, WOAR
from mutagen.mp3 import MP3

ROOT = Path(__file__).resolve().parents[1]
MUSIC = ROOT / "public/assets/audio/music"


def audio_hash(path):
    audio = MP3(path)
    data = path.read_bytes()[audio.tags.size if audio.tags else 0:]
    if data[-128:-125] == b"TAG":
        data = data[:-128]
    return hashlib.sha256(data).hexdigest()


def text_tags(album, track):
    return {
        "TIT2": (TIT2, track["title"]),
        "TPE1": (TPE1, album["artist"]),
        "TPE2": (TPE2, album["album_artist"]),
        "TALB": (TALB, album["album"]),
        "TRCK": (TRCK, f'{track["number"]}/{len(album["tracks"])}'),
        "TPOS": (TPOS, album["disc"]),
        "TDRC": (TDRC, album["recording_year"]),
        "TCON": (TCON, album["genre"]),
    }


def verify(path, album, track, cover):
    tags = MP3(path).tags
    if audio_hash(path) != track["audio_sha256"]:
        raise ValueError(f"Audio differs from the original: {path.name}")
    for key, (_, value) in text_tags(album, track).items():
        if str(tags.get(key)) != value:
            raise ValueError(f"Incorrect {key} in {path.name}")
    pictures = tags.getall("APIC")
    if len(pictures) != 1 or pictures[0].type != 3 or pictures[0].mime != "image/png" or pictures[0].data != cover:
        raise ValueError(f"Incorrect front cover in {path.name}")
    if str(tags.get("WOAS")) != track["source_url"]:
        raise ValueError(f"Source URL changed in {path.name}")
    if [str(frame) for frame in tags.getall("WOAR")] != [album["artist_url"]]:
        raise ValueError(f"Incorrect artist URL in {path.name}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Verify without writing files")
    args = parser.parse_args()
    album = json.loads((ROOT / "docs/soundtrack-metadata.json").read_text())
    cover = (ROOT / album["cover"]).read_bytes()
    if hashlib.sha256(cover).hexdigest() != album["cover_sha256"]:
        raise ValueError("Cover differs from the supplied PNG")
    tracks = album["tracks"]
    if [track["number"] for track in tracks] != list(range(1, len(tracks) + 1)):
        raise ValueError("Track numbers must be consecutive")
    if len({track["file"] for track in tracks}) != len(tracks):
        raise ValueError("Duplicate filename in soundtrack manifest")
    titles = [track["title"].strip().casefold() for track in tracks]
    if not all(titles) or len(set(titles)) != len(tracks):
        raise ValueError("Soundtrack titles must be nonempty and distinct")
    if {path.name for path in MUSIC.glob("*.mp3")} != {track["file"] for track in tracks}:
        raise ValueError("MP3 files differ from the soundtrack manifest")

    # Check every source before making any changes.
    for track in tracks:
        if audio_hash(MUSIC / track["file"]) != track["audio_sha256"]:
            raise ValueError(f'Audio differs from the original: {track["file"]}')

    for track in tracks:
        path = MUSIC / track["file"]
        if not args.check:
            original = MP3(path).tags
            with tempfile.TemporaryDirectory(prefix=".soundtrack-", dir=MUSIC) as temp:
                staged = Path(temp) / path.name
                shutil.copy2(path, staged)
                tags = MP3(staged).tags
                for key, (frame_type, value) in text_tags(album, track).items():
                    tags.delall(key)
                    tags.add(frame_type(encoding=3, text=[value]))
                tags.delall("WOAR")
                tags.add(WOAR(url=album["artist_url"]))
                tags.delall("APIC")
                tags.add(APIC(encoding=3, mime="image/png", type=3, desc="Front cover", data=cover))
                tags.save(staged, v2_version=4, v1=0, padding=lambda _: 1024)
                verify(staged, album, track, cover)
                retained = MP3(staged).tags
                changed = {*text_tags(album, track), "WOAR", "APIC"}
                for key, value in original.items():
                    if key.split(":", 1)[0] not in changed and retained.get(key) != value:
                        raise ValueError(f"Source metadata changed: {path.name}, {key}")
                os.replace(staged, path)
        verify(path, album, track, cover)
        print(f'{track["number"]:02d}/{len(tracks)} {track["title"]}: verified')


if __name__ == "__main__":
    main()
