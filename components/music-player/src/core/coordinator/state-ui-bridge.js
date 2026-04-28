// 將狀態變更事件訂閱到對應的 UI 更新方法。
export function bindStateToUI(state, uiUpdater) {
  state.on("isPlaying", () =>
    uiUpdater.updatePlayback(state.get("isPlaying"), state.get("isLoading")),
  );
  state.on("isLoading", () =>
    uiUpdater.updatePlayback(state.get("isPlaying"), state.get("isLoading")),
  );
  state.on("isMuted", (v) => uiUpdater.updateMute(v));
  state.on("currentVolume", (v) => uiUpdater.updateVolume(v));
  state.on("isRepeatMode", (v) => uiUpdater.updateRepeat(v));
  state.on("isShuffleMode", (v) => uiUpdater.updateShuffle(v));
  state.on("currentTrack", (music) => uiUpdater.updateCurrentTrack(music));
  state.on("currentMusicId", (id) => uiUpdater.highlightTrack(String(id)));
}

// 依目前狀態立即同步一次初始 UI 畫面。
export function syncInitialStateToUI(state, uiUpdater) {
  uiUpdater.updateRepeat(state.get("isRepeatMode"));
  uiUpdater.updateShuffle(state.get("isShuffleMode"));
  uiUpdater.updateVolume(state.get("currentVolume"));
  uiUpdater.updateMute(state.get("isMuted"));
  uiUpdater.updatePlayback(state.get("isPlaying"), state.get("isLoading"));
}
