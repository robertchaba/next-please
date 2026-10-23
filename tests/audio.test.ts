import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Howl, type HowlOptions } from 'howler';
import { AudioManager } from '../src/core/audio';

vi.mock('howler', () => ({
  Howler: { noAudio: false, usingWebAudio: true, ctx: { state: 'running' } },
  Howl: vi.fn(class {
    constructor(readonly options: HowlOptions) {}
    state = vi.fn(() => 'unloaded');
    load = vi.fn();
    play = vi.fn();
    playing = vi.fn(() => false);
    stop = vi.fn();
    unload = vi.fn();
    loop = vi.fn();
    mute = vi.fn();
    volume = vi.fn();
  }),
}));

const playlist = ['first', 'second'];
const sounds = () => vi.mocked(Howl).mock.results.map(result => result.value as Howl & { options: HowlOptions });
let audio: AudioManager;

beforeEach(() => {
  vi.clearAllMocks();
  audio = new AudioManager();
  audio.register({ first: { kind: 'music', src: ['/first.mp3'] }, second: { kind: 'music', src: ['/second.mp3'] } });
});

describe('music playback', () => {
  it('reports audible playback only after loading, with nonzero volume and mute off', () => {
    expect(audio.isMusicAudible()).toBe(false);
    expect(audio.getMusicLevels()).toEqual([0, 0, 0]);
    expect(Howl).not.toHaveBeenCalled();
    audio.unlock();
    audio.playPlaylist(playlist);
    const [first] = sounds();
    vi.mocked(first.playing).mockReturnValue(true);
    expect(audio.isMusicAudible()).toBe(false);
    vi.mocked(first.state).mockReturnValue('loaded');
    expect(audio.isMusicAudible()).toBe(true);
    audio.setMuted(true);
    expect(audio.isMusicAudible()).toBe(false);
    expect(audio.getMusicLevels()).toEqual([0, 0, 0]);
    audio.setMuted(false);
    audio.setMusicVolume(0);
    expect(audio.isMusicAudible()).toBe(false);
    audio.setMusicVolume(0.65);
    expect(audio.getMusicVolume()).toBe(0.65);
    expect(first.volume).toHaveBeenLastCalledWith(0.65);
    expect(audio.isMusicAudible()).toBe(true);
    audio.stopMusic();
    expect(audio.isMusicAudible()).toBe(false);
  });

  it('does not load on registration or before an unmuted user gesture', () => {
    expect(Howl).not.toHaveBeenCalled();
    expect(audio.playPlaylist(playlist)).toBe(false);
    audio.setMuted(true);
    audio.unlock();
    expect(audio.playPlaylist(playlist)).toBe(false);
    for (const sound of sounds()) {
      expect(sound.options.preload).toBe(false);
      expect(sound.load).not.toHaveBeenCalled();
      expect(sound.play).not.toHaveBeenCalled();
    }
    audio.setMuted(false);
    expect(audio.playPlaylist(playlist)).toBe(true);
    expect(sounds()[0].play).toHaveBeenCalledOnce();
  });

  it('keeps one pending playback request across repeated gestures and mute toggles', () => {
    audio.unlock();
    audio.playPlaylist(playlist);
    audio.playPlaylist(playlist);
    audio.setMuted(true);
    audio.setMuted(false);
    audio.playPlaylist(playlist);
    const [first, second] = sounds();
    expect(first.load).toHaveBeenCalledOnce();
    expect(first.play).toHaveBeenCalledOnce();
    expect(first.stop).not.toHaveBeenCalled();
    expect(first.mute).toHaveBeenLastCalledWith(false);
    expect(second.play).not.toHaveBeenCalled();
  });

  it('advances and wraps the playlist, and stops advancing after an explicit stop', () => {
    audio.unlock();
    audio.playPlaylist(playlist);
    const [first, second] = sounds();
    first.options.onend!(1);
    expect(second.play).toHaveBeenCalledOnce();
    expect(second.loop).toHaveBeenCalledWith(false);
    second.options.onend!(2);
    expect(first.play).toHaveBeenCalledTimes(2);
    audio.stopMusic();
    first.options.onend!(1);
    expect(second.play).toHaveBeenCalledOnce();
    expect(first.stop).toHaveBeenCalled();
  });

  it('skips failed tracks and reports failure once when none remain', () => {
    const onError = vi.fn();
    audio.unlock();
    audio.playPlaylist(playlist, onError);
    const [first, second] = sounds();
    first.options.onloaderror!(1, 'missing');
    expect(second.play).toHaveBeenCalledOnce();
    expect(onError).not.toHaveBeenCalled();
    second.options.onloaderror!(2, 'invalid');
    expect(onError).toHaveBeenCalledOnce();
    expect(Howl).toHaveBeenCalledTimes(2);
    // A later gesture can retry rather than leaving a permanent failed state.
    audio.playPlaylist(playlist, onError);
    expect(sounds()[2].play).toHaveBeenCalledOnce();
  });

  it('retries playback rejection only after another gesture', () => {
    const onError = vi.fn();
    audio.unlock();
    audio.playPlaylist(playlist, onError);
    sounds()[0].options.onplayerror!(1, 'blocked');
    expect(onError).toHaveBeenCalledOnce();
    expect(Howl).toHaveBeenCalledTimes(2);
    audio.playPlaylist(playlist, onError);
    expect(sounds()[2].play).toHaveBeenCalledOnce();
  });

  it('selects tracks in either direction before playback without loading or unmuting', () => {
    audio.setMuted(true);
    audio.playPlaylist(playlist);
    expect(audio.previousTrack()).toBe(true);
    expect(Howl).not.toHaveBeenCalled();
    audio.unlock();
    audio.nextTrack();
    audio.nextTrack();
    expect(audio.isMuted()).toBe(true);
    for (const sound of sounds()) {
      expect(sound.load).not.toHaveBeenCalled();
      expect(sound.play).not.toHaveBeenCalled();
    }
    audio.setMuted(false);
    audio.playPlaylist(playlist);
    expect(sounds()[0].play).not.toHaveBeenCalled();
    expect(sounds()[1].play).toHaveBeenCalledOnce();
  });

  it('stops pending playback, wraps both ways, and ignores events from skipped tracks', () => {
    audio.register({ third: { kind: 'music', src: ['/third.mp3'] } });
    audio.unlock();
    audio.playPlaylist([...playlist, 'third']);
    const [first, second, third] = sounds();
    audio.previousTrack();
    expect(first.stop).toHaveBeenCalledOnce();
    expect(third.play).toHaveBeenCalledOnce();
    first.options.onend!(1);
    expect(second.play).not.toHaveBeenCalled();
    audio.nextTrack();
    expect(third.stop).toHaveBeenCalledOnce();
    expect(first.play).toHaveBeenCalledTimes(2);
    audio.nextTrack();
    expect(second.play).toHaveBeenCalledOnce();
    audio.previousTrack();
    expect(second.stop).toHaveBeenCalledOnce();
    expect(first.play).toHaveBeenCalledTimes(3);
    audio.playPlaylist([...playlist, 'third']);
    expect(first.play).toHaveBeenCalledTimes(3);
    audio.stopMusic();
    expect(audio.nextTrack()).toBe(false);
    expect(audio.previousTrack()).toBe(false);
  });

  it('keeps active music muted across manual track changes and automatic advances', () => {
    audio.unlock();
    audio.playPlaylist(playlist);
    audio.setMuted(true);
    audio.nextTrack();
    const [first, second] = sounds();
    expect(first.stop).toHaveBeenCalledOnce();
    expect(second.play).toHaveBeenCalledOnce();
    expect(second.mute).toHaveBeenLastCalledWith(true);
    second.options.onend!(2);
    expect(first.play).toHaveBeenCalledTimes(2);
    expect(audio.isMuted()).toBe(true);
    audio.setMuted(false);
    audio.playPlaylist(playlist);
    expect(first.play).toHaveBeenCalledTimes(2);
  });

  it('skips known failed tracks when navigating backwards', () => {
    audio.register({ third: { kind: 'music', src: ['/third.mp3'] } });
    audio.unlock();
    audio.playPlaylist([...playlist, 'third']);
    const [first, second, third] = sounds();
    audio.nextTrack();
    second.options.onloaderror!(2, 'missing');
    expect(third.play).toHaveBeenCalledOnce();
    audio.previousTrack();
    expect(first.play).toHaveBeenCalledTimes(2);
    expect(second.play).toHaveBeenCalledOnce();
    expect(Howl).toHaveBeenCalledTimes(3);
  });

  it('restarts the only track when navigating a single-track playlist', () => {
    audio.unlock();
    audio.playPlaylist(['first']);
    audio.nextTrack();
    audio.previousTrack();
    expect(sounds()[0].stop).toHaveBeenCalledTimes(2);
    expect(sounds()[0].play).toHaveBeenCalledTimes(3);
    expect(sounds()[1].play).not.toHaveBeenCalled();
  });
});
