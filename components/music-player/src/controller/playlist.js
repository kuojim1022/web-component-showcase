const HISTORY_MAX = 50;
const HISTORY_KEY = "musicPlayHistory";

/**
 * 管理音樂播放清單與播放歷史。
 * 歷史紀錄透過 sessionStorage 在頁面重整間保留。
 */
export class Playlist {
  #list = [];
  #history = [];

  /**
   * 載入新的音樂陣列，同時從 sessionStorage 還原歷史。
   * @param {Array} musicArray
   */
  load(musicArray) {
    this.#list = musicArray;
    try {
      const saved = sessionStorage.getItem(HISTORY_KEY);
      this.#history = saved ? JSON.parse(saved) : [];
    } catch {
      this.#history = [];
    }
  }

  /** 取得目前清單（唯讀）。 */
  get list() {
    return this.#list;
  }

  /** 回傳 isDefault === true 的第一首，否則取清單第一首；清單為空時回傳 null。 */
  getDefault() {
    return this.#list.find((m) => m.isDefault) || this.#list[0] || null;
  }

  /**
   * 取得下一首。
   * @param {string|number} currentId
   * @param {boolean} isShuffleMode
   * @returns {Object|null}
   */
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

  /**
   * 取得上一首。
   * 若歷史紀錄不為空，彈出最後一筆；否則以循環方式往前一首。
   * @param {string|number} currentId
   * @returns {Object|null}
   */
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

  /**
   * 將當前曲目 id 加入歷史（切換下一首時呼叫）。
   * @param {string|number} id
   */
  addToHistory(id) {
    this.#history.push(id);
    if (this.#history.length > HISTORY_MAX) this.#history.shift();
    this.#saveHistory();
  }

  #saveHistory() {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(this.#history));
  }
}
