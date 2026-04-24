import { getIconUrl } from "../utils/path-resolver.js";
import { formatTime } from "../utils/format.js";
import { renderList } from "./components/list-view.js";

export class ViewBinding {
  #getElements;
  #getShadowRoot;
  #getCustomIcons;

  constructor({ getElements, getShadowRoot, getCustomIcons }) {
    this.#getElements = getElements;
    this.#getShadowRoot = getShadowRoot;
    this.#getCustomIcons = getCustomIcons;
  }

  updatePlayback(isPlaying, isLoading) {
    const elements = this.#getElements();
    const btn = elements?.playPauseBtn;
    const icon = btn?.querySelector("img");
    if (!icon) return;
    btn.classList.toggle("loading", isLoading);
    icon.src = getIconUrl(
      isPlaying ? "icon-pause.svg" : "icon-play.svg",
      this.#getCustomIcons(),
    );
  }

  updateMute(isMuted) {
    const icon = this.#getElements()?.volumeIcon;
    if (icon) {
      icon.src = getIconUrl(
        isMuted ? "icon-volume-mute.svg" : "icon-volume.svg",
        this.#getCustomIcons(),
      );
    }
  }

  updateVolume(v) {
    const fill = this.#getElements()?.volumeProgressFill;
    if (fill) fill.style.width = `${v * 100}%`;
  }

  updateProgress(currentTime, duration) {
    const { progressFill, currentTimeDisplay, totalTimeDisplay } =
      this.#getElements() ?? {};
    if (progressFill)
      progressFill.style.width = `${(currentTime / duration) * 100}%`;
    if (currentTimeDisplay)
      currentTimeDisplay.textContent = formatTime(currentTime);
    if (totalTimeDisplay) totalTimeDisplay.textContent = formatTime(duration);
  }

  updateCurrentTrack(music) {
    const { currentSongTitle, currentSongCover, currentSongDefaultCover } =
      this.#getElements() ?? {};
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
    this.#getElements()?.repeatBtn?.classList.toggle("active", isActive);
  }

  updateShuffle(isActive) {
    this.#getElements()?.shuffleBtn?.classList.toggle("active", isActive);
  }

  renderPlaylist(musicList, customIcons = {}) {
    renderList(this.#getElements()?.musicListContainer, musicList, customIcons);
  }

  highlightTrack(id) {
    const root = this.#getShadowRoot();
    if (!root) return;
    root.querySelectorAll(".music-item").forEach((item) => {
      item.classList.toggle(
        "playing",
        String(item.getAttribute("data-id")) === String(id),
      );
    });
  }
}
