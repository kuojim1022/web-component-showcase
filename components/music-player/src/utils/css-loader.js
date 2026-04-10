/**
 * 透過 fetch 載入單一 CSS 檔案，回傳字串；失敗時回傳空字串。
 * @param {string} url
 * @returns {Promise<string>}
 */
export async function loadCss(url) {
  try {
    const res = await fetch(url);
    return res.ok ? await res.text() : "";
  } catch {
    return "";
  }
}
