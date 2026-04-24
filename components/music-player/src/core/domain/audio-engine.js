export class AudioEngine {
  #audio;
  #audioContext = null;
  #gainNode = null;
  #mediaSource = null;
  #isWebAudioEnabled = false;

  constructor(audioElement) {
    this.#audio = audioElement;
  }

  get duration() {
    return this.#audio.duration;
  }

  get readyState() {
    return this.#audio.readyState;
  }

  get currentTime() {
    return this.#audio.currentTime;
  }

  get paused() {
    return this.#audio.paused;
  }

  get src() {
    return this.#audio.src;
  }

  get isWebAudioEnabled() {
    return this.#isWebAudioEnabled;
  }

  onceCanPlay(fn) {
    this.#audio.addEventListener("canplay", fn, { once: true });
  }

  bindEvents(handlers) {
    const a = this.#audio;
    a.ontimeupdate = handlers.onTimeUpdate;
    a.onwaiting = handlers.onWaiting;
    a.oncanplay = handlers.onCanPlay;
    a.onplay = a.onplaying = handlers.onPlay;
    a.onpause = handlers.onPause;
    a.onended = handlers.onEnded;
  }

  initAudio({
    preload = "metadata",
    muted = true,
    volume,
    isMobileDevice = false,
  } = {}) {
    this.#audio.preload = preload;
    this.#audio.muted = muted;
    if (!isMobileDevice && volume !== undefined) {
      this.#audio.volume = volume;
    }
  }

  initWebAudio(initialVolume = 1) {
    if (this.#isWebAudioEnabled) return true;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;
    try {
      this.#audioContext = new AudioContextClass();
      this.#gainNode = this.#audioContext.createGain();
      this.#gainNode.gain.value = initialVolume;
      this.#mediaSource = this.#audioContext.createMediaElementSource(this.#audio);
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

  setMuted(val) {
    this.#audio.muted = val;
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
