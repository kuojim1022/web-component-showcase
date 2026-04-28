import {
  buildPlayerTemplate,
  initPlayerElements,
  loadPlayerStyles,
} from "./components/player-view.js";
import {
  buildListTemplate,
  initListElements,
  loadListStyles,
} from "./components/list-view.js";
import { UIUpdater } from "./ui-updater.js";
import { loadCss } from "../utils/css-loader.js";

const LAYOUT_CSS_URL = new URL("./styles/layout.css", import.meta.url).href;

// 負責掛載播放器模板與樣式，並建立 UIUpdater。
export class UIRenderer {
  #elements = null;
  #shadowRoot = null;
  #customIcons = {};
  #uiUpdater = null;

  get elements() {
    return this.#elements;
  }

  async mount(shadowRoot, customIcons = {}) {
    this.#shadowRoot = shadowRoot;
    this.#customIcons = customIcons;

    const [layoutCss, playerCss, listCss] = await Promise.all([
      loadCss(LAYOUT_CSS_URL),
      loadPlayerStyles(),
      loadListStyles(),
    ]);
    const css = `${layoutCss}\n${playerCss}\n${listCss}`;

    const playerHtml = buildPlayerTemplate(customIcons);
    const listHtml = buildListTemplate(customIcons);
    const html = `
      <div class="music-container">
        ${playerHtml}
        ${listHtml}
      </div>
    `;
    shadowRoot.innerHTML = `<style>${css}</style>${html}`;

    this.#elements = {
      ...initPlayerElements(shadowRoot),
      ...initListElements(shadowRoot),
    };

    this.#uiUpdater = new UIUpdater({
      getElements: () => this.#elements,
      getShadowRoot: () => this.#shadowRoot,
      getCustomIcons: () => this.#customIcons,
    });
  }

  get uiUpdater() {
    return this.#uiUpdater;
  }
}
