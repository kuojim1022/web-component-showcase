# Music Player Web Component — 架構說明（`details.md`）

本文對應目前最新的 `src/` 重構版本，重點說明資料夾分工、檔案職責，以及資料和播放事件如何串接。  
使用方式、屬性與資料格式請以 [`guide.md`](./guide.md) 為主。

---

## 一、總攬

`components/music-player/` 是一個可搬移的 `<music-player>` Web Component，使用：

- **Custom Element + Shadow DOM**：封裝播放 UI 與樣式。
- **ES Modules**：將責任拆成 `controller / playback / ui / utils`。
- **可替換資料來源**：支援 `data-endpoint` 與 `data-url`。
- **可替換圖示**：支援 `custom-icons` 覆寫內建 icon。

### 目前架構重點

- `src/index.js`：元件生命週期邊界（讀屬性、掛 UI、啟動 Controller）。
- `src/controller/`：流程協調與互動接線（非播放演算法本體）。
- `src/playback/`：播放領域邏輯（playlist、audio engine、coordinator）。
- `src/ui/`：模板、樣式、畫面更新。
- `src/utils/`：與領域無關的通用工具。；

---

## 二、目錄結構（最新）

```text
music-player/
├── src/
│   ├── index.js
│   ├── config.js
│   ├── assets/images/
│   ├── controller/
│   │   ├── index.js
│   │   ├── data-manager.js
│   │   ├── event-binder.js
│   │   └── overlay-interactions.js
│   ├── playback/
│   │   ├── coordinator.js
│   │   ├── audio-engine.js
│   │   └── playlist.js
│   ├── ui/
│   │   ├── index.js
│   │   ├── now-playing-view.js
│   │   ├── playlist-view.js
│   │   ├── overlay-view.js
│   │   └── styles/
│   │       ├── now-playing-view.css
│   │       ├── playlist-view.css
│   │       └── overlay-view.css
│   └── utils/
│       ├── css-loader.js
│       ├── drag.js
│       ├── format.js
│       └── path-resolver.js
└── documents/
    ├── guide.md
    └── details.md
```

---

## 三、分層職責

| 層級       | 位置              | 責任                                                             |
| ---------- | ----------------- | ---------------------------------------------------------------- |
| 邊界層     | `src/index.js`    | 解析 HTML 屬性、建立 `UIRenderer` / `Controller`、管理掛載與卸載 |
| 協調層     | `src/controller/` | 組裝資料與播放模組、綁定事件、管理 overlay 互動流程              |
| 播放領域層 | `src/playback/`   | 播放規則、清單策略、音訊引擎封裝                                 |
| 呈現層     | `src/ui/`         | HTML 模板、CSS 載入、UI 更新方法                                 |
| 工具層     | `src/utils/`      | 路徑、拖曳、時間格式、CSS 載入等通用能力                         |

---

## 四、主要檔案對照表

| 路徑                                     | 功能摘要                                                                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `src/index.js`                           | 定義 `<music-player>`；解析 `default-*`、`data-*`、`custom-icons`；呼叫 `controller.init()`；提供 `setMusicData()`     |
| `src/config.js`                          | 預設常數（音量、重複、隨機、readyState、行動裝置 regex、預設 icon）                                                    |
| `src/controller/index.js`                | 協調器入口：`DataManager -> Playlist -> AudioEngine -> PlaybackCoordinator`，並接線 `bindUIEvents` / `bindAudioEvents` |
| `src/controller/data-manager.js`         | `getDataSource`、`fetch`、`extractMusicData`（支援 `data/list/items`）                                                 |
| `src/controller/event-binder.js`         | 把 UI 操作與 audio 事件綁到 `PlaybackCoordinator`                                                                      |
| `src/controller/overlay-interactions.js` | 控制「點擊任意處」與「是否開啟聲音」彈窗流程，並與播放動作互通                                                         |
| `src/playback/coordinator.js`            | 播放流程核心：切歌、播放/暫停、seek、音量、repeat/shuffle、audio 事件狀態同步                                          |
| `src/playback/audio-engine.js`           | 封裝 `HTMLAudioElement` 與可選 Web Audio（`AudioContext + GainNode`）                                                  |
| `src/playback/playlist.js`               | 管理曲目清單、上一首歷史、next/prev/shuffle/default                                                                    |
| `src/ui/index.js`                        | `UIRenderer`：掛載模板與 CSS、統一提供 `update*` / `renderPlaylist` / `highlightTrack`                                 |
| `src/ui/now-playing-view.js`             | 當前播放區模板與元素收集（audio、控制列、進度條、音量條）                                                              |
| `src/ui/playlist-view.js`                | 清單區模板與列表渲染                                                                                                   |
| `src/ui/overlay-view.js`                 | overlay 的模板與樣式注入函式（`injectOverlayStyles`）                                                                  |
| `src/utils/path-resolver.js`             | `getIconUrl`（內建 icon 路徑）與 `resolveUserDataPath`（使用者資料路徑）                                               |

---

## 五、核心流程（初始化）

```text
<music-player> connected
  -> src/index.js 解析屬性
  -> UIRenderer.mount() 建立 Shadow UI
  -> Controller.init()
       -> DataManager 載入/解析資料
       -> Playlist.load()
       -> 建立 AudioEngine
       -> 初始化 UI 狀態
       -> 建立 OverlayInteractions
       -> 建立 PlaybackCoordinator
       -> bindUIEvents / bindAudioEvents
       -> 設定預設曲目 + 顯示初始互動提示
```

---

## 六、播放與互動流程

### 6.1 UI 事件線路

- 使用者點擊播放、上一首、下一首、隨機、循環、靜音。
- `event-binder.js` 將事件導向 `PlaybackCoordinator` 對應方法。
- `PlaybackCoordinator` 更新狀態後，呼叫 `UIRenderer.update*` 回寫畫面。

### 6.2 Audio 事件線路

- `audio.ontimeupdate / onwaiting / oncanplay / onplay / onpause / onended`
- 全部經由 `bindAudioEvents` 導向 `PlaybackCoordinator`。
- `PlaybackCoordinator` 統一處理 loading/playing/ended 行為，避免狀態散落。

### 6.3 Overlay 與自動播放政策

- 首次進入先顯示互動提示，等待使用者手勢。
- 點擊後先啟動播放，再依 session 狀態決定是否顯示「是否開啟聲音」提示。
- Overlay UI 結構在 `ui/overlay-view.js`，互動流程在 `controller/overlay-interactions.js`。

---

## 七、路徑策略

目前有兩種不同資源路徑策略，避免混淆：

1. **元件內建 icon**：`getIconUrl()`
   - 來源是 `src/assets/images/`
   - 由 `import.meta.url` 推導，與部署子路徑相容

2. **資料檔中的 `src` / `image`**：`resolveUserDataPath()`
   - 用於 JSON 曲目資料
   - 保留絕對路徑與完整 URL；相對路徑會轉成以頁面為基準的可用路徑

---

## 八、目前命名規則（重構後）

- `controller/`：流程協調、事件接線、互動橋接（不是播放規則本體）
- `playback/`：所有播放領域邏輯
- `ui/`：只負責視圖模板與畫面更新
- `utils/`：與領域無關的純工具

這個分法可對齊你參考的 `youtube-modal` 思路，並保留 music-player 本身更複雜的播放需求。

---

## 九、延伸閱讀

- 屬性、資料格式、整合方式：[`guide.md`](./guide.md)

---

_文件版本：對應目前 `src/controller + src/playback` 架構。後續若再調整命名或移動檔案，請同步更新本檔。_
