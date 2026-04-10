import { DataLoader } from "./data-loader.js";
import { Playlist } from "./playlist.js";
import { AudioEngine } from "./audio-engine.js";
import { resolveUserDataPath } from "../utils/path-resolver.js";
import { PlaybackCoordinator } from "./playback-coordinator.js";
import { bindUIEvents, bindAudioEvents } from "./event-binder.js";

/**
 * 協調器：連接 DataLoader / Playlist / AudioEngine 與 UIRenderer。
 * 負責所有播放邏輯、事件綁定，並透過 UIRenderer 介面通知 UI 更新。
 */
export class Controller {
  #dataLoader = new DataLoader();
  #playlist = new Playlist();
  #audioEngine = null;
  #uiRenderer = null;
  #playback = null;

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

  /**
   * @param {import('../ui/index.js').UIRenderer} uiRenderer
   * @param {Partial<typeof this.#options>} options
   */
  constructor(uiRenderer, options = {}) {
    this.#uiRenderer = uiRenderer;
    this.#options = { ...this.#options, ...options };
    this.#state.currentVolume = this.#state.savedVolume =
      this.#options.defaultVolume;
    this.#state.isRepeatMode = this.#options.defaultRepeat;
    this.#state.isShuffleMode = this.#options.defaultShuffle;
  }

  /**
   * 載入資料、初始化 AudioEngine、綁定事件，並顯示互動提示。
   * 應在 UIRenderer.mount() 完成後呼叫。
   */
  async init() {
    // 1. 載入音樂資料
    const source = this.#dataLoader.getDataSource({
      endpoint: this.#options.endpoint,
      dataUrl: this.#options.dataUrl,
    });

    if (source.url) {
      try {
        const payload = await this.#dataLoader.fetch(source.url);
        const list = this.#dataLoader.extractMusicData(payload, source.type);
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

    // 2. 取得 DOM 元素（UIRenderer 已 mount）
    const els = this.#uiRenderer.elements;

    // 3. 初始化 AudioEngine
    this.#audioEngine = new AudioEngine(els.audio);

    // 4. 設定音訊預設值
    els.audio.preload = "metadata";
    els.audio.muted = true;
    if (!this.#options.isMobileDevice) {
      els.audio.volume = this.#options.defaultVolume;
    }

    // 5. 通知 UI 初始狀態
    this.#uiRenderer.updateRepeat(this.#state.isRepeatMode);
    this.#uiRenderer.updateShuffle(this.#state.isShuffleMode);
    this.#uiRenderer.updateVolume(this.#state.currentVolume);
    this.#uiRenderer.updateMute(this.#state.isMuted);
    this.#uiRenderer.updatePlayback(false, false);

    // 6. 渲染清單
    this.#uiRenderer.renderPlaylist(
      this.#playlist.list,
      this.#options.customIcons,
    );

    // 7. 建立播放協調器 + 綁定事件
    this.#playback = new PlaybackCoordinator({
      playlist: this.#playlist,
      audioEngine: this.#audioEngine,
      uiRenderer: this.#uiRenderer,
      state: this.#state,
      options: this.#options,
    });
    bindUIEvents(els, this.#playback);
    bindAudioEvents(els.audio, this.#playback);

    // 8. 預載預設曲目，顯示互動提示
    const def = this.#playlist.getDefault();
    if (def) {
      this.#playback.setMusicInfo(def.id);
      this.#uiRenderer.showInteractionPrompt(() =>
        this.#playback.handleInteractionClick(def.id),
      );
    }
  }

  /** 停止播放並清除 portal 元素。 */
  destroy() {
    this.#audioEngine?.destroy();
    this.#uiRenderer.hideInteractionPrompt();
    this.#uiRenderer.hideMutePopup();
    this.#playback = null;
  }

  /**
   * 外部呼叫：以新資料替換清單（不重新 mount UI）。
   * @param {Array} rawList
   */
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
      this.#uiRenderer.showInteractionPrompt(() =>
        this.#playback?.handleInteractionClick(def.id),
      );
    }
  }
}
