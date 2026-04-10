import { getIconUrl } from "../utils/path-resolver.js";
import { formatTime } from "../utils/format.js";

/**
 * 產生單筆音樂清單項目 HTML。
 */
function buildMusicItemHTML(music, iconUrl, playIconUrl) {
  const hasImg = !!music.image;
  const coverHTML = hasImg
    ? `<img src="${music.image}" alt="${music.title}" loading="lazy">`
    : `<div class="default-cover"><img src="${iconUrl}" alt="音樂圖示" class="icon-music"></div>`;
  const defaultBadge = music.isDefault
    ? '<span class="default-badge">預設播放</span>'
    : "";

  return `
    <div class="music-item" data-id="${music.id}">
      <div class="music-cover">
        ${coverHTML}
        <div class="play-overlay">
          <img src="${playIconUrl}" alt="播放" class="play-icon">
        </div>
      </div>
      <div class="music-info">
        <h4 class="music-title">${music.title}</h4>
        <div class="music-meta">${defaultBadge}</div>
      </div>
      <div class="music-actions">
        <span class="music-duration">${formatTime(music.lengthSeconds)}</span>
        <button class="action-btn play-music-btn" title="播放此音樂">
          <img src="${playIconUrl}" alt="播放" class="play-icon">
        </button>
      </div>
    </div>
  `;
}

/**
 * 將音樂清單渲染到容器中。
 * @param {HTMLElement|null} container
 * @param {Array} musicList
 * @param {Object} customIcons
 */
export function render(container, musicList, customIcons = {}) {
  if (!container) return;

  const iconUrl = getIconUrl("icon-music.svg", customIcons);
  const playIconUrl = getIconUrl("icon-play.svg", customIcons);

  if (musicList.length === 0) {
    container.innerHTML = `
      <div class="no-music">
        <p>目前沒有音樂</p>
        <p>請提供音樂資料來源</p>
      </div>
    `;
    return;
  }

  container.innerHTML = musicList
    .map((m) => buildMusicItemHTML(m, iconUrl, playIconUrl))
    .join("");
}

/**
 * 更新清單中播放中項目的 playing class。
 * @param {ShadowRoot} shadowRoot
 * @param {string} currentId
 */
export function highlightItem(shadowRoot, currentId) {
  if (!shadowRoot) return;
  shadowRoot.querySelectorAll(".music-item").forEach((item) => {
    item.classList.toggle(
      "playing",
      String(item.getAttribute("data-id")) === String(currentId),
    );
  });
}
