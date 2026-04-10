/**
 * 元件預設配置。
 * 開發者可在 HTML 屬性層覆寫這些值：
 *   default-volume, default-repeat, default-shuffle, custom-icons（JSON 字串）
 */
export const CONFIG = {
  DEFAULT_VOLUME: 0.7,
  DEFAULT_REPEAT: false,
  DEFAULT_SHUFFLE: false,

  /** audio.readyState 門檻，達到後才嘗試 play() */
  AUDIO_READY_STATE: 3,

  /** 行動裝置判斷正則 */
  MOBILE_REGEX:
    /iPhone|iPad|iPod|Android|Mobile|BlackBerry|IEMobile|Opera Mini/i,

  /**
   * 元件內建圖示檔名對應表（相對於 src/assets/images/）。
   * 可透過 custom-icons 屬性覆寫部分或全部圖示。
   */
  DEFAULT_ICONS: {
    "icon-music": "icon-music.svg",
    "icon-repeat": "icon-repeat.svg",
    "icon-prev": "icon-prev.svg",
    "icon-play": "icon-play.svg",
    "icon-pause": "icon-pause.svg",
    "icon-next": "icon-next.svg",
    "icon-shuffle": "icon-shuffle.svg",
    "icon-volume": "icon-volume.svg",
    "icon-volume-mute": "icon-volume-mute.svg",
  },
};
