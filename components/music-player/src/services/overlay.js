import {
  buildInteractionPromptTemplate,
  buildMutePopupTemplate,
  INTERACTION_OVERLAY_ID,
  MUTE_POPUP_ID,
  injectOverlayStyles,
} from "../ui/components/overlay-view.js";
import { getIconUrl } from "../utils/path-resolver.js";

// 控制首次互動與靜音提示的顯示、隱藏與按鈕行為。
export class OverlayService {
  #customIcons;
  #actions;
  #interactionOverlay = null;
  #mutePopup = null;

  constructor(customIcons, actions) {
    this.#customIcons = customIcons;
    this.#actions = actions;
  }

  async init() {
    await injectOverlayStyles();
  }

  showInitialInteractionPrompt(defaultId) {
    if (this.#interactionOverlay) return;
    const element = document.createElement("div");
    element.id = INTERACTION_OVERLAY_ID;
    element.innerHTML = buildInteractionPromptTemplate();
    document.body.appendChild(element);
    this.#interactionOverlay = element;
    setTimeout(() => element.classList.add("is-overlay-visible"), 10);

    element.onclick = () => {
      this.#actions.startPlaybackByDefault(defaultId);
      this.#actions.restoreUnmutedIfNeeded();
      this.hideInteractionPrompt();
      this.#showMutePromptIfNeeded();
    };
  }

  hideInteractionPrompt() {
    if (!this.#interactionOverlay) return;
    const element = this.#interactionOverlay;
    element.classList.remove("is-overlay-visible");
    this.#interactionOverlay = null;
    setTimeout(() => element.remove(), 300);
  }

  showMutePrompt() {
    if (this.#mutePopup) return;
    const iconUrl = getIconUrl("icon-volume-mute.svg", this.#customIcons);
    const element = document.createElement("div");
    element.id = MUTE_POPUP_ID;
    element.innerHTML = buildMutePopupTemplate(iconUrl);
    document.body.appendChild(element);
    this.#mutePopup = element;
    setTimeout(() => element.classList.add("is-overlay-visible"), 10);

    const confirmBtn = element.querySelector(".volume-mute-popup-confirm");
    const cancelBtn = element.querySelector(".volume-mute-popup-cancel");
    if (!confirmBtn || !cancelBtn) return;

    confirmBtn.onclick = () => {
      this.#actions.unmuteAndTryPlay();
      this.hideMutePrompt();
    };
    cancelBtn.onclick = () => this.hideMutePrompt();

    const addKeyHandler = (buttonElement, handler) => {
      buttonElement.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handler();
        }
      });
    };
    addKeyHandler(confirmBtn, () => {
      this.#actions.unmuteAndTryPlay();
      this.hideMutePrompt();
    });
    addKeyHandler(cancelBtn, () => this.hideMutePrompt());

    setTimeout(() => confirmBtn.focus(), 100);
  }

  hideMutePrompt() {
    if (!this.#mutePopup) return;
    const element = this.#mutePopup;
    element.classList.remove("is-overlay-visible");
    this.#mutePopup = null;
    setTimeout(() => element.remove(), 300);
  }

  #showMutePromptIfNeeded() {
    if (sessionStorage.getItem("musicPlayerUnmuted") !== "true") {
      setTimeout(() => this.showMutePrompt(), 500);
    }
  }
}
