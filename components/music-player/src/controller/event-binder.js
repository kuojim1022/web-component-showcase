import { setupDrag } from "../utils/drag.js";

export function bindUIEvents(elements, playback) {
  const {
    playPauseBtn,
    prevBtn,
    nextBtn,
    shuffleBtn,
    repeatBtn,
    volumeToggleBtn,
    volumeProgressBar,
    progressBar,
    musicListContainer,
  } = elements;

  playPauseBtn.onclick = () => playback.onPlayPauseClick();
  prevBtn.onclick = () => playback.onPrevClick();
  nextBtn.onclick = () => playback.onNextClick();
  shuffleBtn.onclick = () => playback.onShuffleClick();
  repeatBtn.onclick = () => playback.onRepeatClick();
  volumeToggleBtn.onclick = () => playback.toggleMute();
  volumeToggleBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      playback.toggleMute();
    }
  });

  if (musicListContainer) {
    musicListContainer.onpointerdown = (e) => playback.onPlaylistPointerDown(e);
  }

  setupDrag(progressBar, (e) => playback.onProgressDrag(e, progressBar));
  setupDrag(volumeProgressBar, (e) =>
    playback.onVolumeDrag(e, volumeProgressBar),
  );
}

export function bindAudioEvents(audio, playback) {
  audio.ontimeupdate = playback.updateProgress;
  audio.onwaiting = () => playback.onAudioWaiting();
  audio.oncanplay = () => playback.onAudioCanPlay();
  audio.onplay = audio.onplaying = () => playback.onAudioPlay();
  audio.onpause = () => playback.onAudioPause();
  audio.onended = () => playback.onAudioEnded();
}
