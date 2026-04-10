/**
 * 負責取得與解析音樂資料。
 * 優先順序：HTML 屬性（data-endpoint > data-url）> 全域變數（endpoint > data-url）
 */
export class DataLoader {
  /**
   * 根據傳入選項決定資料來源。
   * @param {{ endpoint?: string, dataUrl?: string }} opts
   * @returns {{ type: string, url: string }}
   */
  getDataSource({ endpoint = "", dataUrl = "" } = {}) {
    if (endpoint) return { type: "data-endpoint", url: endpoint };
    if (dataUrl) return { type: "data-url", url: dataUrl };

    const globalEndpoint = window.MUSIC_PLAYER_ENDPOINT;
    if (globalEndpoint) return { type: "data-endpoint", url: globalEndpoint };

    const globalDataUrl = window.MUSIC_PLAYER_DATA_URL;
    if (globalDataUrl) return { type: "data-url", url: globalDataUrl };

    return { type: "", url: "" };
  }

  /**
   * 從 URL 取回 JSON，失敗時拋出例外。
   * @param {string} url
   * @returns {Promise<unknown>}
   */
  async fetch(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.json();
  }

  /**
   * 將後端回應或靜態 JSON 正規化成音樂陣列。
   * 支援格式：
   *   - 直接陣列 `[...]`
   *   - `{ state: true, data: [...] }`
   *   - `{ list: [...] }`
   *   - data-url 場景額外支援 `{ items: [...] }`
   *
   * @param {unknown} payload
   * @param {string} sourceType - "data-endpoint" | "data-url"
   * @returns {Array|null}
   */
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
