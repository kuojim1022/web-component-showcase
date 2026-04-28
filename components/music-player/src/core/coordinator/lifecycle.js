import { OverlayService } from "../../services/overlay.js";
import { bindAudioEvents, bindUIEvents } from "../../services/event-binder.js";
import { PlaybackController } from "../domain/playback-controller.js";

// 建立 overlay 與控制器，並完成 UI/Audio 事件接線。
export async function setupPlaybackLifecycle({
  playlist,
  engine,
  state,
  renderer,
  options,
}) {
  let coordinator = null;
  const overlay = new OverlayService(options.customIcons, {
    startPlaybackByDefault: (defaultId) =>
      coordinator?.startPlaybackByDefault(defaultId),
    restoreUnmutedIfNeeded: () => coordinator?.restoreUnmutedIfNeeded(),
    unmuteAndTryPlay: () => coordinator?.unmuteAndTryPlay(),
  });
  await overlay.init();

  coordinator = new PlaybackController({
    playlist,
    engine,
    state,
    overlay,
    options,
    onProgress: (currentTime, duration) =>
      renderer.uiUpdater.updateProgress(currentTime, duration),
  });

  bindUIEvents(renderer.elements, coordinator);
  bindAudioEvents(engine, coordinator);

  return { overlay, coordinator };
}
