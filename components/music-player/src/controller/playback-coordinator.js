import { resolveUserDataPath } from "../utils/path-resolver.js";

export class PlaybackCoordinator {
  #playlist;
  #audioEngine;
  #uiRenderer;
  #state;
  #options;

  constructor({ playlist, audioEngine, uiRenderer, state, options }) {
    this.#playlist = playlist;
    this.#audioEngine = audioEngine;
    this.#uiRenderer = uiRenderer;
    this.#state = state;
    this.#options = options;
  }

  setMusicInfo(id) {
    const music = this.#playlist.list.find((m) => String(m.id) === String(id));
    if (!music) return;

    const audio = this.#audioEngine.element;
    if (String(this.#state.currentMusicId) === String(id) && audio.src) return;

    this.#state.isSeeking = false;
    this.#state.currentMusicId = music.id;

    this.#audioEngine.load(resolveUserDataPath(music.src));
    this.#uiRenderer.updateCurrentTrack(music);
    this.#uiRenderer.highlightTrack(String(music.id));
  }

  tryPlayAudio() {
    const audio = this.#audioEngine.element;
    const doPlay = async () => {
      await this.#audioEngine.ensureContextResumed();
      audio
        .play()
        .then(() => {
          this.#state.isPlaying = true;
          this.#state.isLoading = false;
          this.#uiRenderer.updatePlayback(true, false);
        })
        .catch((e) => console.warn("[MusicPlayer] play() error:", e));
    };

    if (audio.readyState >= this.#options.readyStateThreshold) {
      doPlay();
    } else {
      audio.addEventListener("canplay", doPlay, { once: true });
    }
  }

  playMusic(id) {
    const currentId = this.#state.currentMusicId;
    if (currentId && String(currentId) !== String(id)) {
      this.#playlist.addToHistory(currentId);
    }
    this.setMusicInfo(id);
    this.tryPlayAudio();
  }

  unmute(tryPlay) {
    const audio = this.#audioEngine.element;
    audio.muted = false;
    this.#audioEngine.setVolume(this.#state.savedVolume);
    this.#state.currentVolume = this.#state.savedVolume;
    this.#state.isMuted = false;
    this.#uiRenderer.updateMute(false);
    this.#uiRenderer.updateVolume(this.#state.savedVolume);
    sessionStorage.setItem("musicPlayerUnmuted", "true");
    if (tryPlay && !this.#state.isPlaying) this.tryPlayAudio();
  }

  toggleMute() {
    if (this.#state.isMuted) {
      this.unmute(false);
      this.#uiRenderer.hideMutePopup();
    } else {
      this.#state.savedVolume = this.#state.currentVolume;
      this.#audioEngine.element.muted = true;
      this.#state.isMuted = true;
      this.#uiRenderer.updateMute(true);
      this.#uiRenderer.hideMutePopup();
    }
  }

  handleInteractionClick(defaultId) {
    this.#audioEngine.initWebAudio(this.#state.currentVolume);

    const audio = this.#audioEngine.element;
    if (
      String(this.#state.currentMusicId) === String(defaultId) &&
      audio.src
    ) {
      this.tryPlayAudio();
    } else {
      this.playMusic(defaultId);
    }

    if (sessionStorage.getItem("musicPlayerUnmuted") === "true") {
      this.unmute(false);
    }

    this.#uiRenderer.hideInteractionPrompt();

    if (sessionStorage.getItem("musicPlayerUnmuted") !== "true") {
      setTimeout(() => {
        this.#uiRenderer.showMutePopup(
          this.#options.customIcons,
          () => {
            this.unmute(true);
            this.#uiRenderer.hideMutePopup();
          },
          () => this.#uiRenderer.hideMutePopup(),
        );
      }, 500);
    }
  }

  updateProgress = () => {
    const audio = this.#audioEngine?.element;
    if (!audio?.duration || this.#state.progressUpdateRequested) return;
    this.#state.progressUpdateRequested = true;
    requestAnimationFrame(() => {
      this.#uiRenderer.updateProgress(audio.currentTime, audio.duration);
      this.#state.progressUpdateRequested = false;
    });
  };

  async onPlayPauseClick() {
    await this.#audioEngine.ensureContextResumed();
    if (!this.#state.currentMusicId && this.#playlist.list.length > 0) {
      this.playMusic(this.#playlist.getDefault().id);
      return;
    }
    const isActuallyPlaying = !this.#audioEngine.element.paused;
    this.#state.isPlaying = isActuallyPlaying;
    if (isActuallyPlaying) {
      this.#audioEngine.pause();
    } else {
      await this.#audioEngine.play().catch((e) => console.warn(e));
    }
  }

  onPrevClick() {
    const prev = this.#playlist.getPrev(this.#state.currentMusicId);
    if (prev) this.playMusic(prev.id);
  }

  onNextClick() {
    const next = this.#playlist.getNext(
      this.#state.currentMusicId,
      this.#state.isShuffleMode,
    );
    if (next) this.playMusic(next.id);
  }

  onShuffleClick() {
    this.#state.isShuffleMode = !this.#state.isShuffleMode;
    this.#uiRenderer.updateShuffle(this.#state.isShuffleMode);
  }

  onRepeatClick() {
    this.#state.isRepeatMode = !this.#state.isRepeatMode;
    this.#uiRenderer.updateRepeat(this.#state.isRepeatMode);
  }

  onPlaylistPointerDown(e) {
    const item = e.target.closest(".music-item");
    if (!item) return;
    e.stopPropagation();
    this.playMusic(item.getAttribute("data-id"));
  }

  onProgressDrag(e, progressBar) {
    const audio = this.#audioEngine.element;
    if (!audio.duration) return;
    const rect = progressBar.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    this.#state.isSeeking = true;
    this.#audioEngine.seek(p * audio.duration);
    this.updateProgress();
  }

  onVolumeDrag(e, volumeProgressBar) {
    const rect = volumeProgressBar.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    this.#audioEngine.setVolume(p);
    this.#state.currentVolume = p;
    this.#uiRenderer.updateVolume(p);
    if (this.#state.isMuted) {
      this.unmute(false);
      this.#uiRenderer.hideMutePopup();
    }
    this.#state.savedVolume = p;
  }

  onAudioWaiting() {
    if (!this.#state.isSeeking) {
      this.#state.isLoading = true;
      this.#uiRenderer.updatePlayback(this.#state.isPlaying, true);
    }
  }

  onAudioCanPlay() {
    this.#state.isLoading = false;
    this.#uiRenderer.updatePlayback(this.#state.isPlaying, false);
  }

  onAudioPlay() {
    this.#state.isLoading = false;
    this.#state.isPlaying = true;
    this.#uiRenderer.updatePlayback(true, false);
  }

  onAudioPause() {
    this.#state.isPlaying = false;
    this.#uiRenderer.updatePlayback(false, false);
  }

  onAudioEnded() {
    if (this.#state.isRepeatMode) {
      this.#audioEngine.seek(0);
      this.#audioEngine.play().catch((e) => console.warn(e));
    } else {
      const next = this.#playlist.getNext(
        this.#state.currentMusicId,
        this.#state.isShuffleMode,
      );
      if (next) this.playMusic(next.id);
    }
  }
}
