// 將秒數格式化為 mm:ss 字串。
export function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// 正規化路徑中的重複斜線。
export function normalizePath(path) {
  return path ? path.replace(/\/+/g, "/") : "";
}
