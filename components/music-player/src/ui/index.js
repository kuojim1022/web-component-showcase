import { buildTemplate, initElements } from "./player-shell.js";
import { render as renderPlaylist, highlightItem } from "./playlist-view.js";
import { PortalManager } from "./portal-manager.js";
import { loadCss } from "../utils/css-loader.js";
import { getIconUrl } from "../utils/path-resolver.js";
import { formatTime } from "../utils/format.js";

/**
 * 負責 Shadow DOM 的掛載與所有 UI 狀態更新。
 * Controller 透過本類別的公開方法驅動畫面，不直接操作 DOM。
 */
export class UIRenderer {
  #elements = null;
  #shadowRoot = null;
  #portalManager = new PortalManager();
  #customIcons = {};

  /** 取得 DOM 元素參考（由 Controller 掛載事件用）。 */
  get elements() {
    return this.#elements;
  }

  /**
   * 將 CSS + HTML 注入 shadowRoot，並初始化元素參考與 portal 樣式。
   * @param {ShadowRoot} shadowRoot
   * @param {Object} customIcons
   */
  async mount(shadowRoot, customIcons = {}) {
    this.#shadowRoot = shadowRoot;
    this.#customIcons = customIcons;

    const shellCssUrl = new URL("./styles/player-shell.css", import.meta.url)
      .href;
    const playlistCssUrl = new URL("./styles/playlist-view.css", import.meta.url)
      .href;
    const [shellCss, playlistCss] = await Promise.all([
      loadCss(shellCssUrl),
      loadCss(playlistCssUrl),
    ]);
    const css = `${shellCss}\n${playlistCss}`;

    const html = buildTemplate(customIcons);
    shadowRoot.innerHTML = `<style>${css}</style>${html}`;

    this.#elements = initElements(shadowRoot);
    await this.#portalManager.injectStyles();
  }

  // ─── UI 更新方法 ─────────────────────────────────────────

  /**
   * @param {boolean} isPlaying
   * @param {boolean} isLoading
   */
  updatePlayback(isPlaying, isLoading) {
    const btn = this.#elements?.playPauseBtn;
    const icon = btn?.querySelector("img");
    if (!icon) return;
    btn.classList.toggle("loading", isLoading);
    icon.src = getIconUrl(
      isPlaying ? "icon-pause.svg" : "icon-play.svg",
      this.#customIcons,
    );
  }

  /** @param {boolean} isMuted */
  updateMute(isMuted) {
    const icon = this.#elements?.volumeIcon;
    if (icon) {
      icon.src = getIconUrl(
        isMuted ? "icon-volume-mute.svg" : "icon-volume.svg",
        this.#customIcons,
      );
    }
  }

  /** @param {number} v - 0~1 */
  updateVolume(v) {
    const fill = this.#elements?.volumeProgressFill;
    if (fill) fill.style.width = `${v * 100}%`;
  }

  /**
   * @param {number} currentTime
   * @param {number} duration
   */
  updateProgress(currentTime, duration) {
    const { progressFill, currentTimeDisplay, totalTimeDisplay } =
      this.#elements ?? {};
    if (progressFill)
      progressFill.style.width = `${(currentTime / duration) * 100}%`;
    if (currentTimeDisplay)
      currentTimeDisplay.textContent = formatTime(currentTime);
    if (totalTimeDisplay) totalTimeDisplay.textContent = formatTime(duration);
  }

  /** @param {{ title: string, image: string }} music */
  updateCurrentTrack(music) {
    const { currentSongTitle, currentSongCover, currentSongDefaultCover } =
      this.#elements ?? {};
    if (currentSongTitle) currentSongTitle.textContent = music.title;
    const hasImg = !!music.image;
    if (currentSongCover) {
      currentSongCover.src = music.image || "";
      currentSongCover.style.display = hasImg ? "block" : "none";
    }
    if (currentSongDefaultCover) {
      currentSongDefaultCover.style.display = hasImg ? "none" : "flex";
    }
  }

  /** @param {boolean} isActive */
  updateRepeat(isActive) {
    this.#elements?.repeatBtn?.classList.toggle("active", isActive);
  }

  /** @param {boolean} isActive */
  updateShuffle(isActive) {
    this.#elements?.shuffleBtn?.classList.toggle("active", isActive);
  }

  /**
   * @param {Array} musicList
   * @param {Object} customIcons
   */
  renderPlaylist(musicList, customIcons = {}) {
    renderPlaylist(this.#elements?.musicListContainer, musicList, customIcons);
  }

  /** @param {string} id */
  highlightTrack(id) {
    highlightItem(this.#shadowRoot, id);
  }

  // ─── Portal 委派 ─────────────────────────────────────────

  /** @param {() => void} onConfirm */
  showInteractionPrompt(onConfirm) {
    this.#portalManager.showInteractionPrompt(onConfirm);
  }

  hideInteractionPrompt() {
    this.#portalManager.hideInteractionPrompt();
  }

  /**
   * @param {Object} customIcons
   * @param {() => void} onConfirm
   * @param {() => void} onCancel
   */
  showMutePopup(customIcons, onConfirm, onCancel) {
    this.#portalManager.showMutePopup(customIcons, onConfirm, onCancel);
  }

  hideMutePopup() {
    this.#portalManager.hideMutePopup();
  }
}
