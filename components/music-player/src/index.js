import { CONFIG } from "./config.js";
import { Controller } from "./controller/index.js";
import { UIRenderer } from "./ui/index.js";

const isMobileDevice = () => CONFIG.MOBILE_REGEX.test(navigator.userAgent);

/**
 * <music-player> Web Component（ES Module 版本）
 *
 * 支援屬性：
 *   data-endpoint    後端 API URL（優先於 data-url）
 *   data-url         靜態 JSON 檔案 URL
 *   default-volume   預設音量，0~1，預設 0.7
 *   default-repeat   預設單曲循環，"true"/"false"，預設 false
 *   default-shuffle  預設隨機播放，"true"/"false"，預設 false
 *   custom-icons     自訂圖示 JSON 字串，例如 '{"icon-play":"url"}'
 *
 * 公開 API：
 *   setMusicData(array)  — 以程式動態替換清單
 */
class MusicPlayer extends HTMLElement {
  #controller = null;
  #initialized = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    if (this.#initialized) return;
    this.#initialized = true;

    const getAttr = (name) => this.getAttribute(name);

    // ── 解析屬性 ──────────────────────────────────────────
    const parseVolume = (v) => {
      const p = parseFloat(v);
      return isNaN(p) ? CONFIG.DEFAULT_VOLUME : Math.max(0, Math.min(1, p));
    };
    const parseBool = (v, d) => {
      if (!v) return d;
      return ["true", "1", "yes", "on"].includes(String(v).toLowerCase());
    };

    const defaultVolume = parseVolume(getAttr("default-volume"));
    const defaultRepeat = parseBool(
      getAttr("default-repeat"),
      CONFIG.DEFAULT_REPEAT,
    );
    const defaultShuffle = parseBool(
      getAttr("default-shuffle"),
      CONFIG.DEFAULT_SHUFFLE,
    );

    let customIcons = {};
    const customIconsAttr = getAttr("custom-icons");
    if (customIconsAttr) {
      try {
        customIcons = JSON.parse(customIconsAttr);
      } catch (e) {
        console.warn("[MusicPlayer] custom-icons 解析失敗:", e);
      }
    }

    // ── 資料來源 ──────────────────────────────────────────
    const endpoint =
      getAttr("data-endpoint") || window.MUSIC_PLAYER_ENDPOINT || "";
    const dataUrl = !endpoint
      ? getAttr("data-url") || window.MUSIC_PLAYER_DATA_URL || ""
      : "";

    // ── 行動裝置偵測 ──────────────────────────────────────
    if (isMobileDevice()) document.body.classList.add("mobile-device");

    // ── 掛載 UI ──────────────────────────────────────────
    const uiRenderer = new UIRenderer();
    await uiRenderer.mount(this.shadowRoot, customIcons);

    // ── 初始化協調器 ──────────────────────────────────────
    this.#controller = new Controller(uiRenderer, {
      endpoint,
      dataUrl,
      defaultVolume,
      defaultRepeat,
      defaultShuffle,
      customIcons,
      readyStateThreshold: CONFIG.AUDIO_READY_STATE,
      isMobileDevice: isMobileDevice(),
    });

    await this.#controller.init();
  }

  disconnectedCallback() {
    this.#controller?.destroy();
    this.#controller = null;
    this.#initialized = false;
  }

  /**
   * 以程式替換音樂清單（不重新 mount UI）。
   * @param {Array} data
   */
  setMusicData(data) {
    this.#controller?.setMusicData(data);
  }
}

if (!customElements.get("music-player")) {
  customElements.define("music-player", MusicPlayer);
}
