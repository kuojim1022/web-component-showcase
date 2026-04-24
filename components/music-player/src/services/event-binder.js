import { setupDrag } from "../utils/drag.js";

export function bindUIEvents(elements, coordinator) {
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

  playPauseBtn.onclick = () => coordinator.onPlayPauseClick();
  prevBtn.onclick = () => coordinator.onPrevClick();
  nextBtn.onclick = () => coordinator.onNextClick();
  shuffleBtn.onclick = () => coordinator.onShuffleClick();
  repeatBtn.onclick = () => coordinator.onRepeatClick();
  volumeToggleBtn.onclick = () => coordinator.toggleMute();
  volumeToggleBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      coordinator.toggleMute();
    }
  });

  if (musicListContainer) {
    musicListContainer.onpointerdown = (e) =>
      coordinator.onPlaylistPointerDown(e);
  }

  setupDrag(progressBar, (e) => coordinator.onProgressDrag(e, progressBar));
  setupDrag(volumeProgressBar, (e) =>
    coordinator.onVolumeDrag(e, volumeProgressBar),
  );
}

export function bindAudioEvents(engine, coordinator) {
  engine.bindEvents({
    onTimeUpdate: coordinator.updateProgress,
    onWaiting: () => coordinator.onAudioWaiting(),
    onCanPlay: () => coordinator.onAudioCanPlay(),
    onPlay: () => coordinator.onAudioPlay(),
    onPause: () => coordinator.onAudioPause(),
    onEnded: () => coordinator.onAudioEnded(),
  });
}
