export class AudioEngine {
  #audio;
  #audioContext = null;
  #gainNode = null;
  #mediaSource = null;
  #isWebAudioEnabled = false;

  constructor(audioElement) {
    this.#audio = audioElement;
  }

  get element() {
    return this.#audio;
  }

  get isWebAudioEnabled() {
    return this.#isWebAudioEnabled;
  }

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

  async ensureContextResumed() {
    if (this.#audioContext?.state === "suspended") {
      try {
        await this.#audioContext.resume();
      } catch {}
    }
  }

  setVolume(v) {
    if (this.#isWebAudioEnabled && this.#gainNode) {
      this.#gainNode.gain.value = v;
    } else {
      this.#audio.volume = v;
    }
  }

  async play() {
    await this.ensureContextResumed();
    return this.#audio.play();
  }

  pause() {
    this.#audio.pause();
  }

  seek(time) {
    this.#audio.currentTime = time;
  }

  load(src) {
    this.#audio.src = src;
    this.#audio.load();
  }

  destroy() {
    this.#audio.pause();
    this.#audio.src = "";
  }
}
