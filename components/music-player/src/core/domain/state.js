import { CONFIG } from "../../config.js";

export class State {
  #data = {
    currentMusicId: null,
    currentTrack: null,
    isPlaying: false,
    isShuffleMode: false,
    isRepeatMode: false,
    isMuted: true,
    savedVolume: CONFIG.DEFAULT_VOLUME,
    currentVolume: CONFIG.DEFAULT_VOLUME,
    isLoading: false,
    isSeeking: false,
    progressUpdateRequested: false,
  };

  #listeners = {};

  constructor(initial = {}) {
    this.#data = { ...this.#data, ...initial };
  }

  get(key) {
    return this.#data[key];
  }

  set(key, value) {
    this.#data[key] = value;
    this.#listeners[key]?.forEach((fn) => fn(value));
  }

  on(key, callback) {
    (this.#listeners[key] ??= []).push(callback);
    return this;
  }
}
