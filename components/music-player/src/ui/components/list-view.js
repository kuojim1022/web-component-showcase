import { getIconUrl } from "../../utils/path-resolver.js";
import { formatTime } from "../../utils/format.js";
import { loadCss } from "../../utils/css-loader.js";

const LIST_CSS_URL = new URL("../styles/list-view.css", import.meta.url).href;

// 載入清單視圖所需 CSS。
export function loadListStyles() {
  return loadCss(LIST_CSS_URL);
}

// 產生音樂清單區塊的 HTML 模板。
export function buildListTemplate(customIcons = {}) {
  const iconUrl = getIconUrl("icon-music.svg", customIcons);
  return `
    <div class="music-list-container">
      <div class="list-title-container">
        <img src="${iconUrl}" alt="音樂" class="list-title-icon">
        <h3 class="list-title">音樂清單</h3>
      </div>
      <div class="music-list" id="music-list"></div>
    </div>
  `;
}

// 從 shadowRoot 取得清單視圖的 DOM 參考。
export function initListElements(shadowRoot) {
  return {
    musicListContainer: shadowRoot.getElementById("music-list"),
  };
}

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

// 將音樂資料渲染成清單項目。
export function renderList(container, musicList, customIcons = {}) {
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
