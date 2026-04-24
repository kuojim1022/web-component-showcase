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
import { ViewBinding } from "./binding.js";
import { loadCss } from "../utils/css-loader.js";

const LAYOUT_CSS_URL = new URL("./styles/layout.css", import.meta.url).href;

export class UIRenderer {
  #elements = null;
  #shadowRoot = null;
  #customIcons = {};
  #binding = null;

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

    this.#binding = new ViewBinding({
      getElements: () => this.#elements,
      getShadowRoot: () => this.#shadowRoot,
      getCustomIcons: () => this.#customIcons,
    });
  }

  get binding() {
    return this.#binding;
  }
}
