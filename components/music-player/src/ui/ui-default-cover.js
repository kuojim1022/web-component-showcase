import { getIconUrl } from "../utils/path-resolver.js";

// 無封面或載入失敗時，音樂清單區塊的預設圖標 HTML。
export function buildDefaultCoverHTML(iconUrl) {
  return `<div class="default-cover"><img src="${iconUrl}" alt="" class="icon-music"></div>`;
}

function handleCoverError(event, container) {
  const target = event.target;
  if (!(target instanceof HTMLImageElement)) return;
  if (!container.contains(target)) return;
  if (target.closest(".play-overlay")) return;
  if (target.closest(".default-cover")) return;

  const musicCover = target.closest(".music-cover");
  if (!musicCover) return;

  const directCoverImg = musicCover.querySelector(":scope > img");
  if (directCoverImg !== target) return;

  const iconUrl = getIconUrl(
    "icon-music.svg",
    container._musicListCustomIcons ?? {},
  );
  const wrapper = document.createElement("div");
  wrapper.innerHTML = buildDefaultCoverHTML(iconUrl);
  const defaultBlock = wrapper.firstElementChild;
  if (defaultBlock) target.replaceWith(defaultBlock);
}

// 在 #music-list 上綁封面載入錯誤委派（一支 listener，供整份清單共用）。
export function setupCoverDelegation(container, customIcons = {}) {
  if (!container) return;

  container._musicListCustomIcons = customIcons;
  if (!container.__musicListCoverErrorBound) {
    container.__musicListCoverErrorBound = true;
    container.addEventListener(
      "error",
      (event) => handleCoverError(event, container),
      true,
    );
  }
}
