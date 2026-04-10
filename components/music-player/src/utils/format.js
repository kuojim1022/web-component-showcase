export function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function normalizePath(path) {
  return path ? path.replace(/\/+/g, "/") : "";
}
