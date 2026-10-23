import { Howl, Howler } from 'howler';

export interface AudioAsset {
  /** Local URLs, in codec preference order. Resolve with import.meta.env.BASE_URL. */
  src: string[];
  kind: 'music' | 'sfx';
  loop?: boolean;
}

export type AudioManifest = Record<string, AudioAsset>;

export class AudioManager {
  private readonly assets = new Map<string, AudioAsset>();
  private readonly sounds = new Map<string, Howl>();
  private unlocked = false;
  private muted = false;
  private musicVolume = 0.4;
  private soundVolume = 0.7;
  private currentMusic: string | null = null;
  private playlist: string[] = [];
  private playlistIndex = 0;
  private readonly failedMusic = new Set<string>();
  private onMusicError: () => void = () => {};
  private analyser: AnalyserNode | undefined;
  private readonly spectrum = new Uint8Array(128);

  /** Registration alone does not download or play any audio. */
  register(manifest: AudioManifest): void {
    for (const [id, asset] of Object.entries(manifest)) {
      this.sounds.get(id)?.unload();
      this.sounds.delete(id);
      if (this.currentMusic === id) this.currentMusic = null;
      this.assets.set(id, { ...asset, src: [...asset.src] });
    }
  }

  /** Call from a click, keydown, or pointer handler before asking to play audio. */
  unlock(): void {
    this.unlocked = true;
    // Instantiate registered Howls inside the gesture, with preloading disabled.
    // This lets Howler initialize/unlock its AudioContext without autoplay.
    for (const id of this.assets.keys()) this.getSound(id);
    if (Howler.ctx?.state === 'suspended') void Howler.ctx.resume().catch(() => {});
  }

  isMuted(): boolean { return this.muted; }

  getMusicVolume(): number { return this.musicVolume; }

  /** A queued load/play request is not yet audible playback. */
  isMusicAudible(): boolean {
    const sound = this.currentMusic ? this.sounds.get(this.currentMusic) : undefined;
    return !this.muted && this.musicVolume > 0 && sound?.state() === 'loaded'
      && sound.playing() && (!Howler.usingWebAudio || Howler.ctx?.state === 'running');
  }

  /** Three quiet, integer-height bands for the pixel meter. Call during updates. */
  getMusicLevels(): readonly number[] {
    if (!this.isMusicAudible()) return [0, 0, 0];
    if (!Howler.usingWebAudio) return [2, 5, 3];
    const context = Howler.ctx;
    if (!this.analyser || this.analyser.context !== context) {
      this.analyser?.disconnect();
      this.analyser = context.createAnalyser();
      this.analyser.fftSize = this.spectrum.length * 2;
      this.analyser.minDecibels = -70;
      this.analyser.maxDecibels = -10;
      this.analyser.smoothingTimeConstant = 0.7;
      // Observe the existing mix on a side branch; do not add an output path.
      Howler.masterGain.connect(this.analyser);
    }
    this.analyser.getByteFrequencyData(this.spectrum);
    const binWidth = context.sampleRate / this.analyser.fftSize;
    return [[100, 500], [500, 2000], [2000, 6000]].map(([low, high]) => {
      const start = Math.max(1, Math.floor(low / binWidth));
      const end = Math.min(this.spectrum.length, Math.ceil(high / binWidth));
      let sum = 0;
      for (let bin = start; bin < end; bin++) sum += this.spectrum[bin];
      return Math.max(1, Math.round(sum / ((end - start) * 255) * 7));
    });
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    for (const sound of this.sounds.values()) sound.mute(muted);
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = this.clampVolume(volume);
    this.updateVolumes('music', this.musicVolume);
  }

  setSoundVolume(volume: number): void {
    this.soundVolume = this.clampVolume(volume);
    this.updateVolumes('sfx', this.soundVolume);
  }

  /** False means no matching asset, no user gesture yet, or audio unavailable. */
  playSound(id: string): boolean {
    if (!this.unlocked || this.assets.get(id)?.kind !== 'sfx') return false;
    const sound = this.getSound(id);
    if (!sound) return false;
    if (sound.state() === 'unloaded') sound.load();
    sound.play();
    return true;
  }

  playMusic(id: string): boolean {
    if (!this.unlocked || this.assets.get(id)?.kind !== 'music') return false;
    const sound = this.getSound(id);
    if (!sound) return false;
    // A pending load/play request also counts: repeated gestures must not queue
    // additional instances or restart the current track.
    if (this.currentMusic === id) return true;
    if (this.currentMusic) this.sounds.get(this.currentMusic)?.stop();
    this.currentMusic = id;
    const index = this.playlist.indexOf(id);
    if (index >= 0) this.playlistIndex = index;
    sound.loop(index >= 0 ? false : this.assets.get(id)!.loop ?? true);
    if (sound.state() === 'unloaded') sound.load();
    sound.play();
    return true;
  }

  /** Prepares the sequence without loading; starts only after an unmuted gesture. */
  playPlaylist(ids: readonly string[], onError: () => void = () => {}): boolean {
    if (!ids.length || ids.some(id => this.assets.get(id)?.kind !== 'music')) return false;
    this.onMusicError = onError;
    const unchanged = ids.length === this.playlist.length && ids.every((id, index) => id === this.playlist[index]);
    if (!unchanged) {
      this.stopMusic();
      this.playlist = [...ids];
    }
    if (!this.unlocked || this.muted) return false;
    if (this.currentMusic) return true;
    this.failedMusic.clear();
    return this.playMusic(this.playlist[this.playlistIndex]);
  }

  /** Wraps in either direction. Before playback, changes selection without loading. */
  nextTrack(): boolean { return this.movePlaylist(1); }
  previousTrack(): boolean { return this.movePlaylist(-1); }

  stopMusic(): void {
    if (this.currentMusic) this.sounds.get(this.currentMusic)?.stop();
    this.currentMusic = null;
    this.playlist = [];
    this.playlistIndex = 0;
    this.failedMusic.clear();
  }

  private advancePlaylist(id: string): void {
    if (this.currentMusic !== id || !this.playlist.includes(id)) return;
    this.movePlaylist(1);
  }

  private movePlaylist(direction: -1 | 1): boolean {
    if (!this.playlist.length) return false;
    const wasPlaying = this.currentMusic !== null;
    if (this.currentMusic) this.sounds.get(this.currentMusic)?.stop();
    this.currentMusic = null;
    for (let offset = 1; offset <= this.playlist.length; offset++) {
      const index = (this.playlistIndex + direction * offset + this.playlist.length) % this.playlist.length;
      const next = this.playlist[index];
      if (this.failedMusic.has(next)) continue;
      this.playlistIndex = index;
      if (!this.unlocked || (this.muted && !wasPlaying)) return true;
      return this.playMusic(next);
    }
    this.onMusicError();
    return false;
  }

  private getSound(id: string): Howl | undefined {
    const existing = this.sounds.get(id);
    if (existing) return existing;
    const asset = this.assets.get(id);
    if (!asset?.src.length || Howler.noAudio) return undefined;
    const sound = new Howl({
      src: asset.src,
      preload: false,
      autoplay: false,
      loop: asset.loop ?? asset.kind === 'music',
      volume: asset.kind === 'music' ? this.musicVolume : this.soundVolume,
      mute: this.muted,
      onend: () => this.advancePlaylist(id),
      onloaderror: () => {
        if (this.sounds.get(id) !== sound) return;
        sound.unload();
        this.sounds.delete(id);
        this.failedMusic.add(id);
        this.advancePlaylist(id);
      },
      onplayerror: () => {
        if (this.sounds.get(id) !== sound) return;
        sound.unload();
        this.sounds.delete(id);
        if (this.currentMusic === id) {
          this.currentMusic = null;
          this.onMusicError();
        }
      },
    });
    this.sounds.set(id, sound);
    return sound;
  }

  private updateVolumes(kind: AudioAsset['kind'], volume: number): void {
    for (const [id, sound] of this.sounds) {
      if (this.assets.get(id)?.kind === kind) sound.volume(volume);
    }
  }

  private clampVolume(volume: number): number {
    return Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 0;
  }
}

export const audio = new AudioManager();
