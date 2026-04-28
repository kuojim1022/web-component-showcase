import { setupDrag } from "../utils/drag.js";

// 綁定畫面操作事件到播放控制器方法。
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
  volumeToggleBtn.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      coordinator.toggleMute();
    }
  });

  if (musicListContainer) {
    musicListContainer.onpointerdown = (event) =>
      coordinator.onPlaylistPointerDown(event);
  }

  setupDrag(progressBar, (event) =>
    coordinator.onProgressDrag(event, progressBar),
  );
  setupDrag(volumeProgressBar, (event) =>
    coordinator.onVolumeDrag(event, volumeProgressBar),
  );
}

// 綁定 audio 元素事件到播放控制器方法。
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
