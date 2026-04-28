import { CONFIG } from "../config.js";

// 解析音量屬性，並限制在 0~1 之間。
export function parseVolumeAttribute(rawValue, defaultValue = CONFIG.DEFAULT_VOLUME) {
  const parsedValue = parseFloat(rawValue);
  if (Number.isNaN(parsedValue)) return defaultValue;
  return Math.max(0, Math.min(1, parsedValue));
}

// 解析布林屬性，支援常見真值字串。
export function parseBooleanAttribute(rawValue, defaultValue) {
  if (!rawValue) return defaultValue;
  return ["true", "1", "yes", "on"].includes(String(rawValue).toLowerCase());
}

// 解析 custom-icons JSON 屬性，失敗時回傳空物件。
export function parseCustomIconsAttribute(rawValue) {
  if (!rawValue) return {};
  try {
    return JSON.parse(rawValue);
  } catch (error) {
    console.warn("[MusicPlayer] custom-icons 解析失敗:", error);
    return {};
  }
}
