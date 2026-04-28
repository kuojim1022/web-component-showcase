import { getIconUrl } from "../../utils/path-resolver.js";
import { loadCss } from "../../utils/css-loader.js";

const PLAYER_CSS_URL = new URL("../styles/player-view.css", import.meta.url)
  .href;

// 載入播放器主視圖所需 CSS。
export function loadPlayerStyles() {
  return loadCss(PLAYER_CSS_URL);
}

// 產生播放器主視圖 HTML 模板。
export function buildPlayerTemplate(customIcons = {}) {
  const icon = (name) => getIconUrl(name, customIcons);

  return `
    <div class="music-player-container">
      <audio id="background-audio" preload="metadata"></audio>

      <div class="player-controls">
        <div class="player-info">
          <div class="player-cover">
            <img id="current-song-cover" src="" alt="當前播放音樂封面">
            <div class="default-cover" id="current-song-default-cover">
              <img src="${icon("icon-music.svg")}" alt="音樂圖示" class="icon-music">
            </div>
          </div>
          <h4 id="current-song-title">請選擇音樂</h4>
        </div>

        <div class="progress-container">
          <span id="current-time">00:00</span>
          <div class="progress-bar">
            <div class="progress-fill" id="progress-fill"></div>
          </div>
          <span id="total-time">00:00</span>
        </div>

        <div class="control-buttons">
          <button id="repeat-btn" class="control-btn" title="單曲循環">
            <img src="${icon("icon-repeat.svg")}" alt="單曲循環" class="control-icon">
          </button>
          <button id="prev-btn" class="control-btn" title="上一首">
            <img src="${icon("icon-prev.svg")}" alt="上一首" class="control-icon">
          </button>
          <button id="play-pause-btn" class="control-btn play-btn" title="播放">
            <img src="${icon("icon-play.svg")}" alt="播放" class="control-icon" id="play-pause-icon">
          </button>
          <button id="next-btn" class="control-btn" title="下一首">
            <img src="${icon("icon-next.svg")}" alt="下一首" class="control-icon">
          </button>
          <button id="shuffle-btn" class="control-btn" title="隨機播放">
            <img src="${icon("icon-shuffle.svg")}" alt="隨機播放" class="control-icon">
          </button>
        </div>

        <div class="volume-control">
          <div class="volume-icon-btn" id="volume-toggle-btn" role="button" tabindex="0" title="切換靜音">
            <img src="${icon("icon-volume.svg")}" alt="音量" class="volume-icon" id="volume-icon">
          </div>
          <div class="volume-progress-container">
            <div class="volume-progress-bar" id="volume-progress-bar">
              <div class="volume-progress-fill" id="volume-progress-fill"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 從 shadowRoot 快取播放器常用 DOM 參考。
export function initPlayerElements(shadowRoot) {
  const get = (id) => shadowRoot.getElementById(id);
  return {
    audio: get("background-audio"),
    playPauseBtn: get("play-pause-btn"),
    prevBtn: get("prev-btn"),
    nextBtn: get("next-btn"),
    shuffleBtn: get("shuffle-btn"),
    repeatBtn: get("repeat-btn"),
    volumeProgressBar: get("volume-progress-bar"),
    volumeProgressFill: get("volume-progress-fill"),
    volumeToggleBtn: get("volume-toggle-btn"),
    volumeIcon: get("volume-icon"),
    progressFill: get("progress-fill"),
    currentTimeDisplay: get("current-time"),
    totalTimeDisplay: get("total-time"),
    currentSongTitle: get("current-song-title"),
    currentSongCover: get("current-song-cover"),
    currentSongDefaultCover: get("current-song-default-cover"),
    progressBar: shadowRoot.querySelector(".progress-bar"),
  };
}
