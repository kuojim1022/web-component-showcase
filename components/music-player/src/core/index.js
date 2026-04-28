import { State } from "./domain/playback-state.js";
import { AudioEngine } from "./domain/audio-engine.js";
import { Playlist } from "./domain/playlist.js";
import { CONFIG } from "../config.js";
import {
  loadPlaylistFromRaw,
  loadPlaylistFromSource,
} from "../store/music-repository.js";
import {
  bindStateToUI,
  syncInitialStateToUI,
} from "./coordinator/state-ui-bridge.js";
import { setupPlaybackLifecycle } from "./coordinator/lifecycle.js";
import { applyPlaylistInit } from "./coordinator/playlist-init.js";

// audio.readyState門檻，建議2 or 3
const AUDIO_READY_STATE_THRESHOLD = 3;

// 協調資料載入、狀態建立與播放生命週期的核心入口。
export class Controller {
  #playlist = new Playlist();
  #engine = null;
  #coordinator = null;
  #overlay = null;
  #renderer = null;
  #state = null;

  #options = {
    endpoint: "",
    dataUrl: "",
    defaultVolume: CONFIG.DEFAULT_VOLUME,
    defaultRepeat: CONFIG.DEFAULT_REPEAT,
    defaultShuffle: CONFIG.DEFAULT_SHUFFLE,
    customIcons: {},
    readyStateThreshold: AUDIO_READY_STATE_THRESHOLD,
    isMobileDevice: false,
  };

  constructor(renderer, options = {}) {
    this.#renderer = renderer;
    this.#options = { ...this.#options, ...options };
  }

  async init() {
    const options = this.#options;
    await loadPlaylistFromSource({
      endpoint: options.endpoint,
      dataUrl: options.dataUrl,
      playlist: this.#playlist,
    });

    this.#state = new State({
      currentVolume: options.defaultVolume,
      savedVolume: options.defaultVolume,
      isRepeatMode: options.defaultRepeat,
      isShuffleMode: options.defaultShuffle,
    });

    const elements = this.#renderer.elements;
    this.#engine = new AudioEngine(elements.audio);
    this.#engine.initAudio({
      muted: true,
      volume: options.defaultVolume,
      isMobileDevice: options.isMobileDevice,
    });

    bindStateToUI(this.#state, this.#renderer.uiUpdater);
    syncInitialStateToUI(this.#state, this.#renderer.uiUpdater);

    const { overlay, coordinator } = await setupPlaybackLifecycle({
      playlist: this.#playlist,
      engine: this.#engine,
      state: this.#state,
      renderer: this.#renderer,
      options,
    });
    this.#overlay = overlay;
    this.#coordinator = coordinator;

    applyPlaylistInit({
      playlist: this.#playlist,
      uiUpdater: this.#renderer.uiUpdater,
      customIcons: this.#options.customIcons,
      coordinator: this.#coordinator,
      overlay: this.#overlay,
    });
  }

  destroy() {
    this.#engine?.destroy();
    this.#overlay?.hideInteractionPrompt();
    this.#overlay?.hideMutePrompt();
    this.#coordinator = null;
    this.#overlay = null;
  }

  setMusicData(rawList) {
    loadPlaylistFromRaw(rawList, this.#playlist);
    applyPlaylistInit({
      playlist: this.#playlist,
      uiUpdater: this.#renderer.uiUpdater,
      customIcons: this.#options.customIcons,
      coordinator: this.#coordinator,
      overlay: this.#overlay,
    });
  }
}
