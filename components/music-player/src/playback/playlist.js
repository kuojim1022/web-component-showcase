const HISTORY_MAX = 50;
const HISTORY_KEY = "musicPlayHistory";

export class Playlist {
  #list = [];
  #history = [];

  load(musicArray) {
    this.#list = musicArray;
    try {
      const saved = sessionStorage.getItem(HISTORY_KEY);
      this.#history = saved ? JSON.parse(saved) : [];
    } catch {
      this.#history = [];
    }
  }

  get list() {
    return this.#list;
  }

  getDefault() {
    return this.#list.find((m) => m.isDefault) || this.#list[0] || null;
  }

  getNext(currentId, isShuffleMode) {
    const list = this.#list;
    if (list.length === 0) return null;

    if (isShuffleMode) {
      const other = list.filter((m) => String(m.id) !== String(currentId));
      if (other.length === 0) return list[0];
      return other[Math.floor(Math.random() * other.length)];
    }

    const idx = list.findIndex((m) => String(m.id) === String(currentId));
    return list[(idx + 1) % list.length];
  }

  getPrev(currentId) {
    const list = this.#list;
    if (list.length === 0) return null;

    if (this.#history.length > 0) {
      const prevId = this.#history.pop();
      this.#saveHistory();
      return list.find((m) => String(m.id) === String(prevId)) || null;
    }

    const idx = list.findIndex((m) => String(m.id) === String(currentId));
    return list[(idx - 1 + list.length) % list.length];
  }

  addToHistory(id) {
    this.#history.push(id);
    if (this.#history.length > HISTORY_MAX) this.#history.shift();
    this.#saveHistory();
  }

  #saveHistory() {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(this.#history));
  }
}
