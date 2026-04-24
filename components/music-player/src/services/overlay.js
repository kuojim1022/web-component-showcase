import {
  buildInteractionPromptTemplate,
  buildMutePopupTemplate,
  INTERACTION_OVERLAY_ID,
  MUTE_POPUP_ID,
  injectOverlayStyles,
} from "../ui/components/overlay-view.js";
import { getIconUrl } from "../utils/path-resolver.js";

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
    const el = document.createElement("div");
    el.id = INTERACTION_OVERLAY_ID;
    el.innerHTML = buildInteractionPromptTemplate();
    document.body.appendChild(el);
    this.#interactionOverlay = el;
    setTimeout(() => (el.style.opacity = "1"), 10);

    el.onclick = () => {
      this.#actions.startPlaybackByDefault(defaultId);
      this.#actions.restoreUnmutedIfNeeded();
      this.hideInteractionPrompt();
      this.#showMutePromptIfNeeded();
    };
  }

  hideInteractionPrompt() {
    if (!this.#interactionOverlay) return;
    const el = this.#interactionOverlay;
    el.style.opacity = "0";
    this.#interactionOverlay = null;
    setTimeout(() => el.remove(), 300);
  }

  showMutePrompt() {
    if (this.#mutePopup) return;
    const iconUrl = getIconUrl("icon-volume-mute.svg", this.#customIcons);
    const el = document.createElement("div");
    el.id = MUTE_POPUP_ID;
    el.innerHTML = buildMutePopupTemplate(iconUrl);
    document.body.appendChild(el);
    this.#mutePopup = el;
    setTimeout(() => (el.style.opacity = "1"), 10);

    const confirmBtn = el.querySelector(".volume-mute-popup-confirm");
    const cancelBtn = el.querySelector(".volume-mute-popup-cancel");
    if (!confirmBtn || !cancelBtn) return;

    confirmBtn.onclick = () => {
      this.#actions.unmuteAndTryPlay();
      this.hideMutePrompt();
    };
    cancelBtn.onclick = () => this.hideMutePrompt();

    const addKeyHandler = (btn, fn) => {
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          fn();
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
    const el = this.#mutePopup;
    el.style.opacity = "0";
    this.#mutePopup = null;
    setTimeout(() => el.remove(), 300);
  }

  #showMutePromptIfNeeded() {
    if (sessionStorage.getItem("musicPlayerUnmuted") !== "true") {
      setTimeout(() => this.showMutePrompt(), 500);
    }
  }
}
