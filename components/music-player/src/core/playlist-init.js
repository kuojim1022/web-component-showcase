export function applyPlaylistInit({
  playlist,
  binding,
  customIcons,
  coordinator,
  overlay,
}) {
  binding.renderPlaylist(playlist.list, customIcons);
  const defaultTrack = playlist.getDefault();
  if (!defaultTrack) return;

  coordinator?.setMusicInfo(defaultTrack.id);
  overlay?.showInitialInteractionPrompt(defaultTrack.id);
}
