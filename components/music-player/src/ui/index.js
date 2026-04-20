import {
  buildNowPlayingTemplate,
  initNowPlayingElements,
} from "./now-playing-view.js";
import {
  buildPlaylistTemplate,
  initPlaylistElements,
  render as renderPlaylist,
} from "./playlist-view.js";
import { loadCss } from "../utils/css-loader.js";
import { getIconUrl } from "../utils/path-resolver.js";
import { formatTime } from "../utils/format.js";

export class UIRenderer {
  #elements = null;
  #shadowRoot = null;
  #customIcons = {};

  get elements() {
    return this.#elements;
  }

  async mount(shadowRoot, customIcons = {}) {
    this.#shadowRoot = shadowRoot;
    this.#customIcons = customIcons;

    const nowPlayingCssUrl = new URL(
      "./styles/now-playing-view.css",
      import.meta.url,
    ).href;
    const playlistCssUrl = new URL(
      "./styles/playlist-view.css",
      import.meta.url,
    ).href;
    const [nowPlayingCss, playlistCss] = await Promise.all([
      loadCss(nowPlayingCssUrl),
      loadCss(playlistCssUrl),
    ]);
    const css = `${nowPlayingCss}\n${playlistCss}`;

    const nowPlayingHtml = buildNowPlayingTemplate(customIcons);
    const playlistHtml = buildPlaylistTemplate(customIcons);
    const html = `
      <div class="music-container">
        ${nowPlayingHtml}
        ${playlistHtml}
      </div>
    `;
    shadowRoot.innerHTML = `<style>${css}</style>${html}`;

    this.#elements = {
      ...initNowPlayingElements(shadowRoot),
      ...initPlaylistElements(shadowRoot),
    };
  }

  // ─── UI 更新方法 ─────────────────────────────────────────
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

  updateMute(isMuted) {
    const icon = this.#elements?.volumeIcon;
    if (icon) {
      icon.src = getIconUrl(
        isMuted ? "icon-volume-mute.svg" : "icon-volume.svg",
        this.#customIcons,
      );
    }
  }

  updateVolume(v) {
    const fill = this.#elements?.volumeProgressFill;
    if (fill) fill.style.width = `${v * 100}%`;
  }

  updateProgress(currentTime, duration) {
    const { progressFill, currentTimeDisplay, totalTimeDisplay } =
      this.#elements ?? {};
    if (progressFill)
      progressFill.style.width = `${(currentTime / duration) * 100}%`;
    if (currentTimeDisplay)
      currentTimeDisplay.textContent = formatTime(currentTime);
    if (totalTimeDisplay) totalTimeDisplay.textContent = formatTime(duration);
  }

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

  updateRepeat(isActive) {
    this.#elements?.repeatBtn?.classList.toggle("active", isActive);
  }

  updateShuffle(isActive) {
    this.#elements?.shuffleBtn?.classList.toggle("active", isActive);
  }

  renderPlaylist(musicList, customIcons = {}) {
    renderPlaylist(this.#elements?.musicListContainer, musicList, customIcons);
  }

  highlightTrack(id) {
    if (!this.#shadowRoot) return;
    this.#shadowRoot.querySelectorAll(".music-item").forEach((item) => {
      item.classList.toggle(
        "playing",
        String(item.getAttribute("data-id")) === String(id),
      );
    });
  }
}
