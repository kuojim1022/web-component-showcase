export class DataManager {
  getDataSource({ endpoint = "", dataUrl = "" } = {}) {
    if (endpoint) return { type: "data-endpoint", url: endpoint };
    if (dataUrl) return { type: "data-url", url: dataUrl };

    const globalEndpoint = window.MUSIC_PLAYER_ENDPOINT;
    if (globalEndpoint) return { type: "data-endpoint", url: globalEndpoint };

    const globalDataUrl = window.MUSIC_PLAYER_DATA_URL;
    if (globalDataUrl) return { type: "data-url", url: globalDataUrl };

    return { type: "", url: "" };
  }

  async fetch(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.json();
  }

  extractMusicData(payload, sourceType) {
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
}
