// 套用清單初始畫面，並決定預設曲目的提示流程。
export function applyPlaylistInit({
  playlist,
  uiUpdater,
  customIcons,
  coordinator,
  overlay,
}) {
  uiUpdater.renderPlaylist(playlist.list, customIcons);
  const defaultTrack = playlist.getDefault();
  if (!defaultTrack) return;

  coordinator?.setMusicInfo(defaultTrack.id);
  overlay?.showInitialInteractionPrompt(defaultTrack.id);
}
