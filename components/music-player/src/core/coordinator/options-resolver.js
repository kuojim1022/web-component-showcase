import { CONFIG } from "../../config.js";
import {
  parseBooleanAttribute,
  parseCustomIconsAttribute,
  parseVolumeAttribute,
} from "../../utils/attribute-parser.js";
import { isMobileDevice } from "../../utils/device-class-manager.js";

// 解析元件 attributes，組成 Controller 初始化所需 options。
export function resolveControllerOptions(element) {
  const getAttr = (name) => element.getAttribute(name);

  const endpoint = getAttr("data-endpoint") || "";
  const dataUrl = !endpoint ? getAttr("data-url") || "" : "";

  return {
    endpoint,
    dataUrl,
    defaultVolume: parseVolumeAttribute(
      getAttr("default-volume"),
      CONFIG.DEFAULT_VOLUME,
    ),
    defaultRepeat: parseBooleanAttribute(
      getAttr("default-repeat"),
      CONFIG.DEFAULT_REPEAT,
    ),
    defaultShuffle: parseBooleanAttribute(
      getAttr("default-shuffle"),
      CONFIG.DEFAULT_SHUFFLE,
    ),
    customIcons: parseCustomIconsAttribute(getAttr("custom-icons")),
    isMobileDevice: isMobileDevice(),
  };
}
