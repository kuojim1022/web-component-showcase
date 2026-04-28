// 靜態資源根路徑（去除尾端斜線）。
export const ASSET_BASE = new URL("../assets", import.meta.url).href.replace(
  /\/$/,
  "",
);

// 解析圖示路徑，優先使用 custom-icons 覆蓋值。
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

// 解析使用者資料路徑，支援絕對與相對路徑。
export function resolveUserDataPath(path) {
  if (!path) return path;
  if (/^(?:\/|https?:\/\/|\/\/)/.test(path)) return path;
  return new URL(path, window.location.href).pathname;
}
