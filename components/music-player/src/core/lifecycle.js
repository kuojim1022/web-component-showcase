import { OverlayService } from "../services/overlay.js";
import { bindAudioEvents, bindUIEvents } from "../services/event-binder.js";
import { PlaybackCoordinator } from "./domain/playback-controller.js";

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

  coordinator = new PlaybackCoordinator({
    playlist,
    engine,
    state,
    overlay,
    options,
    onProgress: (currentTime, duration) =>
      renderer.binding.updateProgress(currentTime, duration),
  });

  bindUIEvents(renderer.elements, coordinator);
  bindAudioEvents(engine, coordinator);

  return { overlay, coordinator };
}
