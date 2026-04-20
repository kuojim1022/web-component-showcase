import { DataManager } from "./data-manager.js";
import { Playlist } from "../playback/playlist.js";
import { AudioEngine } from "../playback/audio-engine.js";
import { resolveUserDataPath } from "../utils/path-resolver.js";
import { PlaybackCoordinator } from "../playback/coordinator.js";
import { bindUIEvents, bindAudioEvents } from "./event-binder.js";
import { OverlayInteractions } from "./overlay-interactions.js";
export class Controller {
  #dataManager = new DataManager();
  #playlist = new Playlist();
  #audioEngine = null;
  #uiRenderer = null;
  #playback = null;
  #overlayInteractions = null;

  #state = {
    currentMusicId: null,
    isPlaying: false,
    isShuffleMode: false,
    isRepeatMode: false,
    isMuted: true,
    savedVolume: 0.7,
    currentVolume: 0.7,
    isLoading: false,
    isSeeking: false,
    progressUpdateRequested: false,
  };

  #options = {
    endpoint: "",
    dataUrl: "",
    defaultVolume: 0.7,
    defaultRepeat: false,
    defaultShuffle: false,
    customIcons: {},
    readyStateThreshold: 3,
    isMobileDevice: false,
  };

  constructor(uiRenderer, options = {}) {
    this.#uiRenderer = uiRenderer;
    this.#options = { ...this.#options, ...options };
    this.#state.currentVolume = this.#state.savedVolume =
      this.#options.defaultVolume;
    this.#state.isRepeatMode = this.#options.defaultRepeat;
    this.#state.isShuffleMode = this.#options.defaultShuffle;
  }

  async init() {
    const source = this.#dataManager.getDataSource({
      endpoint: this.#options.endpoint,
      dataUrl: this.#options.dataUrl,
    });

    if (source.url) {
      try {
        const payload = await this.#dataManager.fetch(source.url);
        const list = this.#dataManager.extractMusicData(payload, source.type);
        if (Array.isArray(list)) {
          this.#playlist.load(
            list.map((m) => ({ ...m, image: resolveUserDataPath(m.image) })),
          );
        } else {
          console.warn("[MusicPlayer] 資料格式不符，預期為音樂陣列。");
        }
      } catch (e) {
        console.error("[MusicPlayer] 載入音樂資料失敗:", e);
      }
    }

    const els = this.#uiRenderer.elements;

    this.#audioEngine = new AudioEngine(els.audio);

    els.audio.preload = "metadata";
    els.audio.muted = true;
    if (!this.#options.isMobileDevice) {
      els.audio.volume = this.#options.defaultVolume;
    }

    this.#uiRenderer.updateRepeat(this.#state.isRepeatMode);
    this.#uiRenderer.updateShuffle(this.#state.isShuffleMode);
    this.#uiRenderer.updateVolume(this.#state.currentVolume);
    this.#uiRenderer.updateMute(this.#state.isMuted);
    this.#uiRenderer.updatePlayback(false, false);

    this.#uiRenderer.renderPlaylist(
      this.#playlist.list,
      this.#options.customIcons,
    );

    this.#overlayInteractions = new OverlayInteractions(
      this.#uiRenderer,
      this.#options.customIcons,
      {
        startPlaybackByDefault: (defaultId) =>
          this.#playback?.startPlaybackByDefault(defaultId),
        restoreUnmutedIfNeeded: () => this.#playback?.restoreUnmutedIfNeeded(),
        unmuteAndTryPlay: () => this.#playback?.unmuteAndTryPlay(),
      },
    );
    await this.#overlayInteractions.init();

    this.#playback = new PlaybackCoordinator({
      playlist: this.#playlist,
      audioEngine: this.#audioEngine,
      uiRenderer: this.#uiRenderer,
      state: this.#state,
      options: this.#options,
      uiInteractions: this.#overlayInteractions,
    });
    bindUIEvents(els, this.#playback);
    bindAudioEvents(els.audio, this.#playback);

    const def = this.#playlist.getDefault();
    if (def) {
      this.#playback.setMusicInfo(def.id);
      this.#overlayInteractions.showInitialInteractionPrompt(def.id);
    }
  }

  destroy() {
    this.#audioEngine?.destroy();
    this.#overlayInteractions?.hideInteractionPrompt();
    this.#overlayInteractions?.hideMutePrompt();
    this.#playback = null;
    this.#overlayInteractions = null;
  }

  setMusicData(rawList) {
    this.#playlist.load(
      rawList.map((m) => ({ ...m, image: resolveUserDataPath(m.image) })),
    );
    this.#uiRenderer.renderPlaylist(
      this.#playlist.list,
      this.#options.customIcons,
    );
    const def = this.#playlist.getDefault();
    if (def) {
      this.#playback?.setMusicInfo(def.id);
      this.#overlayInteractions?.showInitialInteractionPrompt(def.id);
    }
  }
}
