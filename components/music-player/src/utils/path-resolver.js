export const ASSET_BASE = new URL("../assets", import.meta.url).href.replace(
  /\/$/,
  "",
);

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

export function resolveUserDataPath(path) {
  if (!path) return path;
  if (/^(?:\/|https?:\/\/|\/\/)/.test(path)) return path;
  return new URL(path, window.location.href).pathname;
}
