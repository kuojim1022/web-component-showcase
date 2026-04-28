import { loadCss } from "../../utils/css-loader.js";

const OVERLAY_STYLE_ID = "music-player-overlay-style";
const OVERLAY_CSS_URL = new URL("../styles/overlay-view.css", import.meta.url).href;

// 首次互動提示層的 DOM id。
export const INTERACTION_OVERLAY_ID = "interaction-overlay";
// 靜音提醒彈窗的 DOM id。
export const MUTE_POPUP_ID = "volume-mute-portal";

// 將 overlay 樣式注入到 document head（僅一次）。
export async function injectOverlayStyles() {
  if (document.getElementById(OVERLAY_STYLE_ID)) return;
  const css = await loadCss(OVERLAY_CSS_URL);
  const style = document.createElement("style");
  style.id = OVERLAY_STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}

// 建立首次互動提示的 HTML 模板。
export function buildInteractionPromptTemplate() {
  return `
    <div class="interaction-prompt">
      <p>請點擊任意處</p>
      <span>音樂將以靜音模式開始播放，<br>您可隨時調整音量</span>
    </div>
  `;
}

// 建立靜音提醒彈窗的 HTML 模板。
export function buildMutePopupTemplate(iconUrl) {
  return `
    <div class="volume-mute-popup-content">
      <img src="${iconUrl}" alt="靜音" class="volume-mute-popup-icon">
      <div class="volume-mute-popup-text">音樂已靜音，是否開啟聲音?</div>
    </div>
    <div class="volume-mute-popup-buttons">
      <div class="volume-mute-popup-confirm" role="button" tabindex="0">是</div>
      <div class="volume-mute-popup-cancel" role="button" tabindex="0">否</div>
    </div>
  `;
}
