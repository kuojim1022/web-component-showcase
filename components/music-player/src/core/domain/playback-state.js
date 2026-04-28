import { CONFIG } from "../../config.js";

// 儲存播放器狀態，並提供簡單的訂閱通知機制。
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
    this.#listeners[key]?.forEach((listener) => listener(value));
  }

  on(key, callback) {
    (this.#listeners[key] ??= []).push(callback);
    return this;
  }
}
