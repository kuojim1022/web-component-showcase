export const CONFIG = {
  DEFAULT_VOLUME: 0.7, // 預設音量
  DEFAULT_REPEAT: false, // 預設重複模式
  DEFAULT_SHUFFLE: false, // 預設隨機模式
  AUDIO_READY_STATE: 3, // audio.readyState門檻，達到後才嘗試play()
  MOBILE_REGEX:
    /iPhone|iPad|iPod|Android|Mobile|BlackBerry|IEMobile|Opera Mini/i,

  DEFAULT_ICONS: {
    "icon-music": "icon-music.svg", // 音樂圖示
    "icon-repeat": "icon-repeat.svg", // 單曲循環圖示
    "icon-prev": "icon-prev.svg", // 上一首圖示
    "icon-play": "icon-play.svg", // 播放圖示
    "icon-pause": "icon-pause.svg", // 暫停圖示
    "icon-next": "icon-next.svg", // 下一首圖示
    "icon-shuffle": "icon-shuffle.svg", // 隨機播放圖示
    "icon-volume": "icon-volume.svg", // 音量圖示
    "icon-volume-mute": "icon-volume-mute.svg", // 靜音圖示
  },
};
