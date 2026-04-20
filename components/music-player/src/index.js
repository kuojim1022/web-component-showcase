import { CONFIG } from "./config.js";
import { Controller } from "./controller/index.js";
import { UIRenderer } from "./ui/index.js";

const isMobileDevice = () => CONFIG.MOBILE_REGEX.test(navigator.userAgent);
let mobileClassOwnerCount = 0;
class MusicPlayer extends HTMLElement {
  #controller = null;
  #initialized = false;
  #ownsMobileClass = false;

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
    const parseBooleanAttribute = (v, d) => {
      if (!v) return d;
      return ["true", "1", "yes", "on"].includes(String(v).toLowerCase());
    };

    const defaultVolume = parseVolume(getAttr("default-volume"));
    const defaultRepeat = parseBooleanAttribute(
      getAttr("default-repeat"),
      CONFIG.DEFAULT_REPEAT,
    );
    const defaultShuffle = parseBooleanAttribute(
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
    if (isMobileDevice()) {
      mobileClassOwnerCount += 1;
      this.#ownsMobileClass = true;
      document.body.classList.add("mobile-device");
    }

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
    if (this.#ownsMobileClass) {
      mobileClassOwnerCount = Math.max(0, mobileClassOwnerCount - 1);
      this.#ownsMobileClass = false;
      if (mobileClassOwnerCount === 0) {
        document.body.classList.remove("mobile-device");
      }
    }
    this.#initialized = false;
  }

  setMusicData(data) {
    this.#controller?.setMusicData(data);
  }
}

if (!customElements.get("music-player")) {
  customElements.define("music-player", MusicPlayer);
}
