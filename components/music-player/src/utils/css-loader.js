// 讀取 CSS 檔內容字串，失敗時回傳空字串。
export async function loadCss(url) {
  try {
    const res = await fetch(url);
    return res.ok ? await res.text() : "";
  } catch {
    return "";
  }
}
