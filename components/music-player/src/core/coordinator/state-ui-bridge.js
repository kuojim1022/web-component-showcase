// 將狀態變更事件訂閱到對應的 UI 更新方法。
export function bindStateToUI(state, uiUpdater) {
  state.on("isPlaying", () =>
    uiUpdater.updatePlayback(state.get("isPlaying"), state.get("isLoading")),
  );
  state.on("isLoading", () =>
    uiUpdater.updatePlayback(state.get("isPlaying"), state.get("isLoading")),
  );
  state.on("isMuted", (value) => uiUpdater.updateMute(value));
  state.on("currentVolume", (value) => uiUpdater.updateVolume(value));
  state.on("isRepeatMode", (value) => uiUpdater.updateRepeat(value));
  state.on("isShuffleMode", (value) => uiUpdater.updateShuffle(value));
  state.on("currentTrack", (music) => uiUpdater.updateCurrentTrack(music));
  state.on("currentMusicId", (musicId) =>
    uiUpdater.highlightTrack(String(musicId)),
  );
}

// 依目前狀態立即同步一次初始 UI 畫面。
export function syncInitialStateToUI(state, uiUpdater) {
  uiUpdater.updateRepeat(state.get("isRepeatMode"));
  uiUpdater.updateShuffle(state.get("isShuffleMode"));
  uiUpdater.updateVolume(state.get("currentVolume"));
  uiUpdater.updateMute(state.get("isMuted"));
  uiUpdater.updatePlayback(state.get("isPlaying"), state.get("isLoading"));
}
