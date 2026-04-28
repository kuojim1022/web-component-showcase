import { Controller } from "./core/index.js";
import { resolveControllerOptions } from "./core/coordinator/options-resolver.js";
import { UIRenderer } from "./ui/renderer.js";
import {
  acquireMobileClass,
  releaseMobileClass,
} from "./utils/device-class-manager.js";
class MusicPlayer extends HTMLElement {
  #controller = null;
  #initialized = false;
  #ownsMobileClass = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    if (this.#initialized) return;
    this.#initialized = true;

    const controllerOptions = resolveControllerOptions(this);

    // 行動裝置偵測
    if (controllerOptions.isMobileDevice) {
      acquireMobileClass();
      this.#ownsMobileClass = true;
    }

    // 掛載 UI
    const uiRenderer = new UIRenderer();
    await uiRenderer.mount(this.shadowRoot, controllerOptions.customIcons);

    // 初始化協調器
    this.#controller = new Controller(uiRenderer, controllerOptions);

    await this.#controller.init();
  }

  disconnectedCallback() {
    this.#controller?.destroy();
    this.#controller = null;
    if (this.#ownsMobileClass) {
      releaseMobileClass();
      this.#ownsMobileClass = false;
    }
    this.#initialized = false;
  }

  setMusicData(data) {
    this.#controller?.setMusicData(data);
  }
}

if (!customElements.get("music-player")) {
  customElements.define("music-player", MusicPlayer);
}
