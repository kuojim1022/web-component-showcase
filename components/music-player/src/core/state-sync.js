export function bindStateToUI(state, binding) {
  state.on("isPlaying", () =>
    binding.updatePlayback(state.get("isPlaying"), state.get("isLoading")),
  );
  state.on("isLoading", () =>
    binding.updatePlayback(state.get("isPlaying"), state.get("isLoading")),
  );
  state.on("isMuted", (v) => binding.updateMute(v));
  state.on("currentVolume", (v) => binding.updateVolume(v));
  state.on("isRepeatMode", (v) => binding.updateRepeat(v));
  state.on("isShuffleMode", (v) => binding.updateShuffle(v));
  state.on("currentTrack", (music) => binding.updateCurrentTrack(music));
  state.on("currentMusicId", (id) => binding.highlightTrack(String(id)));
}

export function syncInitialStateToUI(state, binding) {
  binding.updateRepeat(state.get("isRepeatMode"));
  binding.updateShuffle(state.get("isShuffleMode"));
  binding.updateVolume(state.get("currentVolume"));
  binding.updateMute(state.get("isMuted"));
  binding.updatePlayback(state.get("isPlaying"), state.get("isLoading"));
}
