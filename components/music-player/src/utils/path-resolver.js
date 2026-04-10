/**
 * 以此模組（src/utils/path-resolver.js）的位置為基準，
 * 往上一層得到 src/ 目錄的 URL，再進入 assets/。
 * 結果為絕對 URL，可在任何部署環境正確解析，不依賴 document.currentScript。
 *
 * src/utils/ → src/ → src/assets
 */
export const ASSET_BASE = new URL("../assets", import.meta.url).href.replace(
  /\/$/,
  "",
);

/**
 * 取得元件內建圖示的絕對 URL。
 * @param {string} iconFileName  - 例如 "icon-play.svg"
 * @param {Object} [customIcons] - 自訂圖示對應表 { 'icon-play': '/custom/play.svg' }
 * @returns {string}
 */
export function getIconUrl(iconFileName, customIcons = {}) {
  const key = iconFileName.replace(/\.svg$/, "");
  const custom = customIcons[key];

  if (custom) {
    if (/^(?:\/|https?:\/\/|\/\/)/.test(custom)) return custom;
    const filename = /\.(svg|png|jpg|jpeg|gif|webp)$/i.test(custom)
      ? custom
      : `${custom}.svg`;
    return `${ASSET_BASE}/images/${filename}`;
  }

  return `${ASSET_BASE}/images/${iconFileName}`;
}

/**
 * 解析使用者資料（音樂 src / 封面 image）中的路徑。
 * 絕對路徑直接回傳；相對路徑以頁面根目錄為基準補全。
 * @param {string} path
 * @returns {string}
 */
export function resolveUserDataPath(path) {
  if (!path) return path;
  if (/^(?:\/|https?:\/\/|\/\/)/.test(path)) return path;
  return new URL(path, window.location.href).pathname;
}
