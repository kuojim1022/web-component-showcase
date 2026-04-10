/**
 * 封裝 HTML5 Audio 與 Web Audio API。
 * Web Audio API 主要用於繞過行動裝置的系統音量限制。
 */
export class AudioEngine {
  #audio;
  #audioContext = null;
  #gainNode = null;
  #mediaSource = null;
  #isWebAudioEnabled = false;

  /** @param {HTMLAudioElement} audioElement */
  constructor(audioElement) {
    this.#audio = audioElement;
  }

  /** 取得底層 HTMLAudioElement，供外部掛載事件或讀取屬性。 */
  get element() {
    return this.#audio;
  }

  get isWebAudioEnabled() {
    return this.#isWebAudioEnabled;
  }

  /**
   * 嘗試建立 Web Audio API 路徑。
   * 成功後音量由 GainNode 控制，忽略系統媒體音量。
   * @param {number} initialVolume - 初始化 GainNode 增益值
   * @returns {boolean}
   */
  initWebAudio(initialVolume = 1) {
    if (this.#isWebAudioEnabled) return true;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;
    try {
      this.#audioContext = new AudioContextClass();
      this.#gainNode = this.#audioContext.createGain();
      this.#gainNode.gain.value = initialVolume;
      this.#mediaSource = this.#audioContext.createMediaElementSource(
        this.#audio,
      );
      this.#mediaSource.connect(this.#gainNode);
      this.#gainNode.connect(this.#audioContext.destination);
      this.#isWebAudioEnabled = true;
      return true;
    } catch {
      return false;
    }
  }

  /** 若 AudioContext 因自動播放政策被暫停，嘗試恢復。 */
  async ensureContextResumed() {
    if (this.#audioContext?.state === "suspended") {
      try {
        await this.#audioContext.resume();
      } catch {}
    }
  }

  /**
   * 設定播放音量。
   * 已啟用 Web Audio API 時使用 GainNode；否則直接設定 audio.volume。
   * @param {number} v - 0~1
   */
  setVolume(v) {
    if (this.#isWebAudioEnabled && this.#gainNode) {
      this.#gainNode.gain.value = v;
    } else {
      this.#audio.volume = v;
    }
  }

  /** 恢復 context 後呼叫 audio.play()。 */
  async play() {
    await this.ensureContextResumed();
    return this.#audio.play();
  }

  pause() {
    this.#audio.pause();
  }

  /** @param {number} time - 秒 */
  seek(time) {
    this.#audio.currentTime = time;
  }

  /**
   * 設定音源並重新載入。
   * @param {string} src
   */
  load(src) {
    this.#audio.src = src;
    this.#audio.load();
  }

  /** 停止播放並清除 src，釋放資源。 */
  destroy() {
    this.#audio.pause();
    this.#audio.src = "";
  }
}
