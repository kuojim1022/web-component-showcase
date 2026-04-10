import { getIconUrl } from "../utils/path-resolver.js";
import { loadCss } from "../utils/css-loader.js";

const PORTAL_STYLE_ID = "music-player-portal-style";

/**
 * 管理掛在 document.body 下的 portal 元素（靜音彈窗、互動提示）。
 * 樣式透過 injectStyles() 注入一次即可（有 id 防重複）。
 */
export class PortalManager {
  #mutePopup = null;
  #interactionOverlay = null;

  /** 將 portal 所需 CSS 注入 document.head（若已存在則略過）。 */
  async injectStyles() {
    if (document.getElementById(PORTAL_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = PORTAL_STYLE_ID;
    const cssUrl = new URL("./styles/portal-manager.css", import.meta.url).href;
    style.textContent = await loadCss(cssUrl);
    document.head.appendChild(style);
  }

  /**
   * 顯示「請點擊任意處」互動提示遮罩。
   * @param {() => void} onConfirm - 使用者點擊後的 callback
   */
  showInteractionPrompt(onConfirm) {
    if (this.#interactionOverlay) return;
    const el = document.createElement("div");
    el.id = "interaction-overlay";
    el.innerHTML = `
      <div class="interaction-prompt">
        <p>請點擊任意處</p>
        <span>音樂將以靜音模式開始播放，<br>您可隨時調整音量</span>
      </div>
    `;
    document.body.appendChild(el);
    this.#interactionOverlay = el;
    setTimeout(() => (el.style.opacity = "1"), 10);
    el.onclick = () => onConfirm?.();
  }

  hideInteractionPrompt() {
    if (!this.#interactionOverlay) return;
    const el = this.#interactionOverlay;
    el.style.opacity = "0";
    this.#interactionOverlay = null;
    setTimeout(() => el.remove(), 300);
  }

  /**
   * 顯示靜音確認彈窗。
   * @param {Object} customIcons
   * @param {() => void} onConfirm
   * @param {() => void} onCancel
   */
  showMutePopup(customIcons, onConfirm, onCancel) {
    if (this.#mutePopup) return;
    const iconUrl = getIconUrl("icon-volume-mute.svg", customIcons);
    const el = document.createElement("div");
    el.id = "volume-mute-portal";
    el.innerHTML = `
      <div class="volume-mute-popup-content">
        <img src="${iconUrl}" alt="靜音" class="volume-mute-popup-icon">
        <div class="volume-mute-popup-text">音樂已靜音，是否開啟聲音?</div>
      </div>
      <div class="volume-mute-popup-buttons">
        <div class="volume-mute-popup-confirm" role="button" tabindex="0">是</div>
        <div class="volume-mute-popup-cancel"  role="button" tabindex="0">否</div>
      </div>
    `;
    document.body.appendChild(el);
    this.#mutePopup = el;
    setTimeout(() => (el.style.opacity = "1"), 10);

    const confirmBtn = el.querySelector(".volume-mute-popup-confirm");
    const cancelBtn = el.querySelector(".volume-mute-popup-cancel");

    confirmBtn.onclick = () => onConfirm?.();
    cancelBtn.onclick = () => onCancel?.();

    const addKeyHandler = (btn, fn) => {
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          fn();
        }
      });
    };
    addKeyHandler(confirmBtn, () => onConfirm?.());
    addKeyHandler(cancelBtn, () => onCancel?.());

    setTimeout(() => confirmBtn.focus(), 100);
  }

  hideMutePopup() {
    if (!this.#mutePopup) return;
    const el = this.#mutePopup;
    el.style.opacity = "0";
    this.#mutePopup = null;
    setTimeout(() => el.remove(), 300);
  }
}
