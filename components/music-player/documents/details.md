# Music Player Web Component — 架構說明（`details.md`）

本文說明 **ES Module 重構後** 的 `music-player` 目錄結構：總攬、分層大綱、各檔職責，以及資料與事件如何串接。  
使用方式與 API 細節仍以 [`guide.md`](./guide.md) 為主；本檔聚焦 **程式架構**。

---

## 一、總攬

`components/music-player/` 是一套可搬移的 **自訂元素（Custom Element）** `<music-player>`，以 **Shadow DOM** 封裝畫面與樣式，以 **ES Modules** 拆分模組。

- **對外入口**：頁面以 `<script type="module" src=".../src/index.js">` 載入後，會 `customElements.define("music-player", ...)`。
- **行為核心**：`src/controller/` 負責資料載入、播放清單、音訊引擎、播放流程協調與事件綁定。
- **畫面核心**：`src/ui/` 負責模板、清單渲染、Portal（互動提示／靜音彈窗）與對應 CSS。
- **靜態資源**：`src/assets/images/` 存放元件內建圖示；路徑由 `import.meta.url` 推算，不依賴硬編碼站台路徑。
- **設定**：`src/config.js` 集中預設常數；HTML 屬性可在執行期覆寫部分行為。
- **文件**：`documents/`（本檔與 `guide.md`）不參與執行。

**與舊版的關係**：若仍存在 `css/music-player.css` 或舊的 `js/` 檔案，多為歷史遺留；**現行建議以 `src/` 樹狀結構為唯一真相來源（source of truth）**。

---

## 二、大綱：分層與各檔主要功能

由下而上可理解為四層：

| 層級 | 資料夾／位置 | 角色（一句話） |
|------|----------------|----------------|
| L0 邊界 | `src/index.js` | 自訂元素生命週期：讀屬性 → 掛 UI → 啟動 Controller |
| L1 編排 | `src/controller/index.js` | 啟動流程：`DataLoader` → `Playlist` → `AudioEngine` → `PlaybackCoordinator` + 事件 |
| L2 領域 | `src/controller/*.js`（除 index） | 資料、清單、音訊、播放語意、純綁線 |
| L3 呈現 | `src/ui/` | Shadow 模板、樣式載入、清單 DOM、Portal |

### 2.1 檔案對照表（依路徑）

| 路徑 | 主要處理功能 |
|------|----------------|
| `src/index.js` | `<music-player>`：`connectedCallback` / `disconnectedCallback`；解析屬性；建立 `UIRenderer` 與 `Controller`；公開 `setMusicData` |
| `src/config.js` | `CONFIG`：`DEFAULT_VOLUME`、`DEFAULT_REPEAT`、`DEFAULT_SHUFFLE`、`AUDIO_READY_STATE`、`MOBILE_REGEX`、`DEFAULT_ICONS` |
| `src/utils/format.js` | `formatTime`、`normalizePath` |
| `src/utils/drag.js` | `setupDrag`：Pointer Events 拖曳（進度／音量條） |
| `src/utils/css-loader.js` | `loadCss`：`fetch` 讀取 CSS 字串 |
| `src/utils/path-resolver.js` | `ASSET_BASE`、`getIconUrl`（內建圖示）、`resolveUserDataPath`（JSON 內音檔／封面路徑） |
| `src/controller/index.js` | `Controller`：`init` / `destroy` / `setMusicData`；組裝子模組與初始 UI |
| `src/controller/data-loader.js` | `DataLoader`：`getDataSource`、`fetch`、`extractMusicData` |
| `src/controller/playlist.js` | `Playlist`：清單、上一首歷史、`getDefault` / `getNext` / `getPrev` |
| `src/controller/audio-engine.js` | `AudioEngine`：`HTMLAudioElement` + 可選 Web Audio（`GainNode`） |
| `src/controller/playback-coordinator.js` | `PlaybackCoordinator`：切歌、`tryPlayAudio`、靜音／互動流程、進度與 `audio` 事件回應邏輯 |
| `src/controller/event-binder.js` | `bindUIEvents`、`bindAudioEvents`：把 DOM／`audio` 事件接到 `PlaybackCoordinator` |
| `src/ui/index.js` | `UIRenderer`：`mount`、合併載入 CSS、委派 Portal；各種 `update*` / `renderPlaylist` |
| `src/ui/player-shell.js` | `buildTemplate`、`initElements`：播放器主殼 HTML 與元素查詢 |
| `src/ui/playlist-view.js` | 清單 HTML 生成、`highlightItem` |
| `src/ui/portal-manager.js` | `PortalManager`：body 上的互動遮罩與靜音彈窗；注入 `portal-manager.css` |
| `src/ui/styles/player-shell.css` | 外層容器、控制列、進度／音量、按鈕等樣式 |
| `src/ui/styles/playlist-view.css` | 清單區、`.music-item`、空狀態等樣式 |
| `src/ui/styles/portal-manager.css` | Portal DOM 專用樣式與動畫 |
| `src/assets/images/*.svg` | 內建示資源（對應 `getIconUrl`） |
| `documents/guide.md` | 使用者／開發者指南（API、屬性、資料格式） |
| `documents/details.md` | 本架構說明 |

---

## 三、細節講解

### 3.1 目錄樹（概念）

```
music-player/
├── src/                          # 現行 ESM 實作（建議唯一入口）
│   ├── index.js                  # Custom Element
│   ├── config.js                 # CONFIG
│   ├── assets/images/            # 內建 SVG
│   ├── utils/                    # 無狀態工具
│   ├── controller/               # 資料與播放編排
│   └── ui/                       # Shadow 與 Portal 呈現
├── documents/
│   ├── guide.md
│   └── details.md                # 本檔
└── css/music-player.css          # 舊版整包 CSS（可視為遺留）
```

### 3.2 `src/index.js`（邊界層）

職責單純化為「**把 HTML 世界與內部模組接起來**」：

1. 讀取 `data-endpoint`、`data-url`、`default-*`、`custom-icons` 等屬性（與選用的 `window.MUSIC_PLAYER_*`）。
2. 行動裝置時可對 `document.body` 加 class（與 `CONFIG.MOBILE_REGEX` 一致）。
3. `new UIRenderer()` → `await mount(shadowRoot, customIcons)`。
4. `new Controller(uiRenderer, options)` → `await init()`。
5. 卸載時 `destroy()`，避免音訊與 Portal 殘留。

**公開方法**：`setMusicData(array)` 將新清單交給 Controller，**不重建**整棵 Shadow 內容（只更新清單與後續流程）。

### 3.3 `src/config.js`（設定層）

放「預設值與少變動常數」，避免散落在各檔 magic number。  
實際執行策略（例如音量上下限）仍可由 `index.js` 解析屬性後覆寫傳入 `Controller` 的 `options`。

### 3.4 `src/utils/`（工具層）

- **`path-resolver.js`** 是資源路徑的關鍵分線：
  - **內建圖示**：`ASSET_BASE` + `getIconUrl`，依 **模組 URL** 定位，部署到不同子路徑仍可運作。
  - **使用者資料**（JSON 的 `src`、`image`）：`resolveUserDataPath` — 絕對路徑（`/`、`http`）保留；相對路徑則相對於**目前頁面**補成 pathname。

- **`css-loader.js`**：Shadow 與 Portal 的樣式皆以「字串注入」方式載入，不依賴建置工具打包 CSS。

- **`drag.js`**：與播放邏輯無耦合，只負責 pointer 拖曳行為。

### 3.5 `src/controller/`（行為層）

#### `index.js`（Controller）

`init()` 的順序反映依賴關係：

1. 有資料 URL 時：`DataLoader` 取回 payload → `extractMusicData` → `Playlist.load`（並對 `image` 做 `resolveUserDataPath`）。
2. 從 `UIRenderer.elements` 取得 `<audio>`，建立 `AudioEngine`。
3. 設定 `audio` 初始屬性（`preload`、`muted`、非行動裝置時 `volume`）。
4. 推播初始 UI（repeat / shuffle / volume / mute / playback）。
5. `renderPlaylist`。
6. 建立 `PlaybackCoordinator`，再 `bindUIEvents` + `bindAudioEvents`。
7. 預設曲目 `setMusicInfo` + `showInteractionPrompt`（符合自動播放政策的使用者手勢流程）。

`setMusicData`：重新載入清單、重畫清單、重設預設曲目與互動提示；**前提**是 `PlaybackCoordinator` 已在 `init` 建立（以 `?.` 防呆）。

#### `data-loader.js`（DataLoader）

- **`getDataSource`**：`data-endpoint` 優先於 `data-url`，其次為全域變數。
- **`extractMusicData`**：支援裸陣列、`data` / `list`、以及 `data-url` 下的 `items`；`state === false` 視為失敗。

#### `playlist.js`（Playlist）

管理「現在有哪些歌」與「上一首／隨機／循環」所需的索引與歷史；**不**直接操作 DOM。

#### `audio-engine.js`（AudioEngine）

封裝 `HTMLAudioElement` 與 Web Audio 連線；Controller／Coordinator 透過它呼叫 `play` / `pause` / `seek` / `load`，避免各處直接碰 raw audio DOM。

#### `playback-coordinator.js`（PlaybackCoordinator）

集中「播放語意」：換曲、`tryPlayAudio`、靜音切換、互動遮罩後的播放與延遲靜音彈窗、進度更新、以及對 `waiting` / `canplay` / `play` / `pause` / `ended` 的 UI 狀態同步。  
**設計目的**：讓 `Controller` 保留「啟動步驟」，細節不放同一個超大類別。

#### `event-binder.js`

僅負責 `onclick`、`addEventListener`、`setupDrag` 的**接線**，方便閱讀與單元測試時替換。

### 3.6 `src/ui/`（呈現層）

#### `UIRenderer`（`ui/index.js`）

- `mount`：平行 `fetch` 兩份 Shadow 用 CSS（`player-shell.css`、`playlist-view.css`），與 `player-shell` 的 HTML 合併進 `shadowRoot`。
- 呼叫 `PortalManager.injectStyles()` 載入 `portal-manager.css` 到 `document.head`（Portal 在 Shadow 外）。
- 其餘方法皆為 **「由 Controller / Coordinator 驅動的 view 更新」**，避免在 controller 內直接拼字串或 querySelector 散落各處。

#### `player-shell.js` / `playlist-view.js`

- **Shell**：整體版型與控制列 DOM 結構。
- **Playlist view**：清單列渲染與播放中高亮。

#### `portal-manager.js`

互動遮罩與靜音確認框掛在 **`document.body`**，樣式獨立於 Shadow，故需單獨一份 CSS 與一次性注入。

### 3.7 資料與路徑整合流程（端到端）

```text
頁面屬性 / window 全域
        ↓
  src/index.js（解析 → options）
        ↓
  Controller.init
        ↓
  DataLoader：URL → JSON → 陣列
        ↓
  Playlist.load（每筆 image：resolveUserDataPath）
        ↓
  UIRenderer.renderPlaylist
        ↓
  使用者選曲或預設曲 setMusicInfo（src：resolveUserDataPath）
        ↓
  AudioEngine：load / play / pause …
        ↓
  UIRenderer：updateProgress、updatePlayback、…
```

**圖示**與 **音檔／封面** 兩條線互不混用：前者走 `getIconUrl` + `ASSET_BASE`，後者走 JSON 欄位 + `resolveUserDataPath`。

---

## 四、延伸閱讀

- 屬性、JSON 範例、後端 `endpoint` 回傳格式：請見 [`guide.md`](./guide.md)。

---

*文件版本：對應 `src/` ESM 架構；若目錄有增刪，請同步更新本檔「二、大綱」表格。*
