import { resolveUserDataPath } from "../utils/path-resolver.js";

// 單一處理來源優先序：屬性傳入 → window.MUSIC_PLAYER_ENDPOINT → window.MUSIC_PLAYER_DATA_URL
function getDataSource({ endpoint = "", dataUrl = "" } = {}) {
  if (endpoint) return { type: "data-endpoint", url: endpoint };
  if (dataUrl) return { type: "data-url", url: dataUrl };

  const globalEndpoint = window.MUSIC_PLAYER_ENDPOINT;
  if (globalEndpoint) return { type: "data-endpoint", url: globalEndpoint };

  const globalDataUrl = window.MUSIC_PLAYER_DATA_URL;
  if (globalDataUrl) return { type: "data-url", url: globalDataUrl };

  return { type: "", url: "" };
}

async function fetchPayload(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

function extractMusicData(payload, sourceType) {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload;

  if (
    typeof payload === "object" &&
    "state" in payload &&
    payload.state === false
  ) {
    return null;
  }

  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.list)) return payload.list;
  if (sourceType === "data-url" && Array.isArray(payload.items))
    return payload.items;

  return null;
}

function mapMusicAssets(list) {
  return list.map((musicItem) => ({
    ...musicItem,
    image: resolveUserDataPath(musicItem.image),
  }));
}

// 依設定來源抓取遠端資料並載入播放清單。
export async function loadPlaylistFromSource({ endpoint, dataUrl, playlist }) {
  const source = getDataSource({ endpoint, dataUrl });
  if (!source.url) return;

  try {
    const payload = await fetchPayload(source.url);
    const list = extractMusicData(payload, source.type);
    if (!Array.isArray(list)) {
      console.warn("[MusicPlayer] 資料格式不符，預期為音樂陣列。");
      return;
    }
    playlist.load(mapMusicAssets(list));
  } catch (error) {
    console.error("[MusicPlayer] 載入音樂資料失敗:", error);
  }
}

// 直接使用傳入資料載入播放清單（不經過 fetch）。
export function loadPlaylistFromRaw(rawList, playlist) {
  playlist.load(mapMusicAssets(rawList));
}
