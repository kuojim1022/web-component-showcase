import { resolveUserDataPath } from "../../utils/path-resolver.js";

// 集中處理播放互動、音訊事件與狀態寫入的核心控制器。
export class PlaybackController {
  #playlist;
  #engine;
  #state;
  #overlay;
  #options;
  #onProgress;

  constructor({ playlist, engine, state, overlay, options, onProgress }) {
    this.#playlist = playlist;
    this.#engine = engine;
    this.#state = state;
    this.#overlay = overlay;
    this.#options = options;
    this.#onProgress = onProgress;
  }

  setMusicInfo(id) {
    const musicItem = this.#playlist.list.find(
      (music) => String(music.id) === String(id),
    );
    if (!musicItem) return;

    if (
      String(this.#state.get("currentMusicId")) === String(id) &&
      this.#engine.src
    )
      return;

    this.#state.set("isSeeking", false);
    this.#state.set("currentMusicId", musicItem.id);
    this.#state.set("currentTrack", musicItem);

    this.#engine.load(resolveUserDataPath(musicItem.src));
  }

  tryPlayAudio() {
    const doPlay = async () => {
      await this.#engine.ensureContextResumed();
      this.#engine
        .play()
        .then(() => {
          this.#state.set("isPlaying", true);
          this.#state.set("isLoading", false);
        })
        .catch((error) => console.warn("[MusicPlayer] play() error:", error));
    };

    // readyState 僅有 0~4 整數狀態，threshold 應維持相同語意的整數值。
    if (this.#engine.readyState >= this.#options.readyStateThreshold) {
      doPlay();
    } else {
      this.#engine.onceCanPlay(doPlay);
    }
  }

  playMusic(id) {
    const currentId = this.#state.get("currentMusicId");
    if (currentId && String(currentId) !== String(id)) {
      this.#playlist.addToHistory(currentId);
    }
    this.setMusicInfo(id);
    this.tryPlayAudio();
  }

  unmute(tryPlay) {
    const savedVolume = this.#state.get("savedVolume");
    this.#engine.setMuted(false);
    this.#engine.setVolume(savedVolume);
    this.#state.set("currentVolume", savedVolume);
    this.#state.set("isMuted", false);
    sessionStorage.setItem("musicPlayerUnmuted", "true");
    if (tryPlay && !this.#state.get("isPlaying")) this.tryPlayAudio();
  }

  toggleMute() {
    if (this.#state.get("isMuted")) {
      this.unmute(false);
      this.#overlay?.hideMutePrompt();
    } else {
      this.#state.set("savedVolume", this.#state.get("currentVolume"));
      this.#engine.setMuted(true);
      this.#state.set("isMuted", true);
      this.#overlay?.hideMutePrompt();
    }
  }

  startPlaybackByDefault(defaultId) {
    this.#engine.initWebAudio(this.#state.get("currentVolume"));

    if (
      String(this.#state.get("currentMusicId")) === String(defaultId) &&
      this.#engine.src
    ) {
      this.tryPlayAudio();
    } else {
      this.playMusic(defaultId);
    }
  }

  restoreUnmutedIfNeeded() {
    if (sessionStorage.getItem("musicPlayerUnmuted") === "true") {
      this.unmute(false);
    }
  }

  unmuteAndTryPlay() {
    this.unmute(true);
  }

  updateProgress = () => {
    if (!this.#engine.duration || this.#state.get("progressUpdateRequested"))
      return;
    this.#state.set("progressUpdateRequested", true);
    requestAnimationFrame(() => {
      this.#onProgress(this.#engine.currentTime, this.#engine.duration);
      this.#state.set("progressUpdateRequested", false);
    });
  };

  async onPlayPauseClick() {
    await this.#engine.ensureContextResumed();
    if (!this.#state.get("currentMusicId") && this.#playlist.list.length > 0) {
      this.playMusic(this.#playlist.getDefault().id);
      return;
    }
    const isActuallyPlaying = !this.#engine.paused;
    this.#state.set("isPlaying", isActuallyPlaying);
    if (isActuallyPlaying) {
      this.#engine.pause();
    } else {
      await this.#engine.play().catch((error) => console.warn(error));
    }
  }

  onPrevClick() {
    const prev = this.#playlist.getPrev(this.#state.get("currentMusicId"));
    if (!prev) return;
    if (prev.fromHistory) {
      this.setMusicInfo(prev.music.id);
      this.tryPlayAudio();
      return;
    }
    this.playMusic(prev.music.id);
  }

  onNextClick() {
    const next = this.#playlist.getNext(
      this.#state.get("currentMusicId"),
      this.#state.get("isShuffleMode"),
    );
    if (next) this.playMusic(next.id);
  }

  onShuffleClick() {
    const next = !this.#state.get("isShuffleMode");
    this.#state.set("isShuffleMode", next);
  }

  onRepeatClick() {
    const next = !this.#state.get("isRepeatMode");
    this.#state.set("isRepeatMode", next);
  }

  onPlaylistPointerDown(event) {
    const item = event.target.closest(".music-item");
    if (!item) return;
    event.stopPropagation();
    this.playMusic(item.getAttribute("data-id"));
  }

  onProgressDrag(event, progressBar) {
    if (!this.#engine.duration) return;
    const rect = progressBar.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (event.clientX - rect.left) / rect.width),
    );
    this.#state.set("isSeeking", true);
    this.#engine.seek(ratio * this.#engine.duration);
    this.updateProgress();
  }

  onVolumeDrag(event, volumeProgressBar) {
    const rect = volumeProgressBar.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (event.clientX - rect.left) / rect.width),
    );
    this.#engine.setVolume(ratio);
    this.#state.set("currentVolume", ratio);
    if (this.#state.get("isMuted")) {
      this.unmute(false);
      this.#overlay?.hideMutePrompt();
    }
    this.#state.set("savedVolume", ratio);
  }

  onAudioWaiting() {
    if (!this.#state.get("isSeeking")) {
      this.#state.set("isLoading", true);
    }
  }

  onAudioCanPlay() {
    this.#state.set("isLoading", false);
  }

  onAudioPlay() {
    this.#state.set("isLoading", false);
    this.#state.set("isPlaying", true);
  }

  onAudioPause() {
    this.#state.set("isPlaying", false);
  }

  onAudioEnded() {
    if (this.#state.get("isRepeatMode")) {
      this.#engine.seek(0);
      this.#engine.play().catch((error) => console.warn(error));
    } else {
      const next = this.#playlist.getNext(
        this.#state.get("currentMusicId"),
        this.#state.get("isShuffleMode"),
      );
      if (next) this.playMusic(next.id);
    }
  }
}
