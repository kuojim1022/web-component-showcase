import { DataAdapter } from "../store/data-adapter.js";
import { resolveUserDataPath } from "../utils/path-resolver.js";

function mapMusicAssets(list) {
  return list.map((m) => ({ ...m, image: resolveUserDataPath(m.image) }));
}

export async function loadPlaylistFromSource({ endpoint, dataUrl, playlist }) {
  const adapter = new DataAdapter();
  const source = adapter.getDataSource({ endpoint, dataUrl });
  if (!source.url) return;

  try {
    const payload = await adapter.fetch(source.url);
    const list = adapter.extractMusicData(payload, source.type);
    if (!Array.isArray(list)) {
      console.warn("[MusicPlayer] 資料格式不符，預期為音樂陣列。");
      return;
    }
    playlist.load(mapMusicAssets(list));
  } catch (e) {
    console.error("[MusicPlayer] 載入音樂資料失敗:", e);
  }
}

export function loadPlaylistFromRaw(rawList, playlist) {
  playlist.load(mapMusicAssets(rawList));
}
