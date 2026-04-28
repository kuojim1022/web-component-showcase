# 音樂播放器元件 — 架構說明

---

## 一、目前架構總覽

- `core/`：核心整合與流程協調（含領域層 domain 與協調層 coordinator；處理初始化流程 initialization、狀態同步 state sync、歌單初始化 playlist init）
- `store/`：資料來源與資料格式轉接（data source / data mapping）
- `services/`：把「使用者操作 / 音訊事件」轉交給核心邏輯（user actions / audio events），並管理提示層互動流程（overlay flow）
- `ui/`：視圖模板、樣式、渲染器（view templates / styles / renderer）
- `utils/`：通用工具（utilities）

核心目標是：

- 邏輯與畫面解耦（由狀態 State 驅動畫面 UI）
- 音訊底層封裝（由音訊引擎 AudioEngine 統一對外）
- 模組職責單一（方便維護與替換）

---

## 二、目錄結構（現行）

```text
music-player/
├── src/                               # 組件主程式碼
│   ├── index.js                       # Web Component 入口（解析屬性、啟動 Controller）
│   ├── config.js                      # 預設值與常數
│   ├── assets/images/                 # 內建 icon 資源
│   ├── core/                          # 核心整合層
│   │   ├── index.js                   # 對外 Controller（整合入口）
│   │   ├── coordinator/               # 協調層（組裝流程/接線/同步，不含領域規則）
│   │   │   ├── lifecycle.js           # 建立 overlay/controller 並綁定 UI/Audio 事件
│   │   │   ├── options-resolver.js    # 解析 attributes 並組成 Controller options
│   │   │   ├── state-ui-bridge.js     # state <-> UI 同步綁定
│   │   │   └── playlist-init.js       # 套用歌單並設定預設曲目/提示流程
│   │   └── domain/                    # 播放領域物件
│   │       ├── playback-state.js      # 狀態容器（get/set/on）
│   │       ├── playback-controller.js # 播放流程決策與事件處理
│   │       ├── audio-engine.js        # 音訊引擎封裝（audio/WebAudio）
│   │       └── playlist.js            # 歌單策略（next/prev/shuffle/history）
│   ├── store/                         # 資料來源與轉接
│   │   └── music-repository.js        # 資料來源、fetch、payload 解析與歌單載入
│   ├── services/                      # 服務層（接線與互動）
│   │   ├── event-binder.js            # UI/Audio 事件轉交給 PlaybackController 實例（coordinator）
│   │   └── overlay.js                 # 初次互動與靜音提示流程
│   ├── ui/                            # 呈現層
│   │   ├── renderer.js                # 掛載模板樣式；透過 getter 對外提供 uiUpdater
│   │   ├── ui-updater.js              # 依狀態更新 Shadow DOM（update* / renderPlaylist）
│   │   ├── components/                # 各視圖模板
│   │   │   ├── player-view.js         # 播放器主視圖
│   │   │   ├── list-view.js           # 清單視圖
│   │   │   └── overlay-view.js        # overlay 視圖/樣式注入
│   │   └── styles/                    # 對應視圖樣式
│   │       ├── player-view.css
│   │       ├── list-view.css
│   │       └── overlay-view.css
│   └── utils/                         # 通用工具
│       ├── attribute-parser.js        # 屬性解析（volume / boolean / custom-icons）
│       ├── css-loader.js              # 載入 CSS 文字
│       ├── device-class-manager.js    # 行動裝置判斷與 body class 管理
│       ├── drag.js                    # 拖曳與 pointer 互動
│       ├── format.js                  # 格式化（時間）
│       └── path-resolver.js           # 資源路徑解析
└── documents/                         # 文件
    ├── guide.md                       # 使用者接入指南
    └── details.md                     # 架構設計說明
```

---

## 三、分層職責

`coordinator` = 負責組裝流程、事件接線、狀態到畫面同步，不承載領域規則。

| 層級   | 位置                            | 主要責任                                                                      |
| ------ | ------------------------------- | ----------------------------------------------------------------------------- |
| 邊界層 | `src/index.js`                  | 元件入口（Web Component entry），解析屬性、掛載畫面、建立控制器（Controller） |
| 核心層 | `src/core/`                     | 核心整合流程、領域邏輯（domain）與協調層（coordinator）協作（初始化、同步、歌單套用） |
| 數據層 | `src/store/music-repository.js` | 決定資料來源、抓資料、轉成標準歌單                                            |
| 服務層 | `src/services/`                 | 畫面/音訊事件接線、提示層（overlay）互動流程                                  |
| 呈現層 | `src/ui/`                       | 模板組裝、樣式載入（CSS）、畫面更新（UI update）                              |
| 工具層 | `src/utils/`                    | 屬性解析、裝置 class 管理、路徑、時間格式、拖曳、CSS 載入工具                 |

---

## 四、關鍵檔案對照

| 檔案                                     | 說明                                                                                                                                                           |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/index.js`                           | 定義 `<music-player>`；呼叫 `options-resolver` 取得設定、掛載 UI、啟動 `Controller.init()`                                                                    |
| `src/core/index.js`                      | 核心整合入口：組裝 domain 物件，串接 `music-repository` / `state-ui-bridge` / `lifecycle` / `playlist-init`                                                    |
| `src/core/coordinator/options-resolver.js` | 讀取 `data-*` / `default-*` / `custom-icons`，解析後組成 Controller options                                                                                  |
| `src/core/domain/playback-state.js`      | 輕量狀態容器（`get/set/on`），是畫面同步的單一事實來源                                                                                                         |
| `src/core/domain/playback-controller.js` | 播放流程核心：播放/暫停、上一首/下一首、拖曳進度、拖曳音量、repeat/shuffle、audio 事件處理                                                                     |
| `src/core/domain/audio-engine.js`        | 音訊控制中介層：統一封裝 `play/pause/seek/volume/muted/load`、管理 Web Audio 初始化與恢復，並集中綁定 audio 事件；讓其他模組不用直接碰 `HTMLAudioElement` 細節 |
| `src/core/domain/playlist.js`            | 歌單策略：default/next/prev/shuffle/history，並保存 `sessionStorage` 歷史                                                                                      |
| `src/core/coordinator/lifecycle.js`      | 建立提示層服務（OverlayService）與播放控制器（PlaybackController），並完成畫面/音訊事件綁定                                                                    |
| `src/core/coordinator/state-ui-bridge.js` | 建立狀態（state）到畫面更新器（UIUpdater）的訂閱關係，並完成初始畫面同步                                                                                     |
| `src/store/music-repository.js`          | 資料來源判斷、fetch、payload 解析、資源路徑映射與歌單載入                                                                                                      |
| `src/core/coordinator/playlist-init.js`  | 套用歌單至畫面（UI）並設定預設曲目與初次互動提示                                                                                                               |
| `src/ui/ui-updater.js`                   | 依狀態更新 Shadow 內 DOM（`update*`、`renderPlaylist`、`highlightTrack`）                                                                                      |
| `src/services/event-binder.js`           | 把畫面點擊/拖曳與音訊事件，轉給協調流程（coordinator）                                                                                                         |
| `src/services/overlay.js`                | 初次互動提示與靜音提示（overlay）的生命週期與按鈕行為                                                                                                          |
| `src/ui/renderer.js`                     | 渲染器（renderer）：掛載模板與樣式，建立畫面更新器（UIUpdater）並對外提供更新入口                                                                              |
| `src/utils/attribute-parser.js`          | 提供屬性解析工具：音量、布林、自訂圖示 JSON                                                                                                                    |
| `src/utils/device-class-manager.js`      | 管理行動裝置判斷與 `document.body.mobile-device` class 的增減                                                                                                  |

---

## 五、初始化流程

### 5.1 整體順序

```ext
  --> 1.讀屬性與圖示
  --> 2. 掛上 Shadow 畫面（Shadow DOM）與樣式（CSS）
  --> 3. 載入遠端歌單並寫入播放清單（Playlist）
  --> 4. 建立播放狀態（State）與音訊引擎（AudioEngine）
  --> 5. 訂閱狀態，更新畫面
  --> 6. 建立播放控制、提示層、綁定按鈕/音訊
  --> 7. 套用清單、預設曲、顯示首次點擊提示
```

### 5.2 參與者與呼叫方向（精簡序圖）

**說明：** `state-ui-bridge` 的「訂閱」在圖上簡寫成一步；實作上是 `State` 的 `on` 掛在 `UIUpdater` 的 `update*`。

```ext
(1) 頁面上的 music-player --> 入口（src/index.js）：元件連上頁面生命週期
(2) 入口 --> 設定解析（core/coordinator/options-resolver.js）：解析屬性、預設值、圖示
(3) 入口 --> 掛載畫面（ui/renderer.js）：掛載模板、樣式、畫面更新器
(4) 入口 --> 核心（core/index.js）：執行初始化
(5) 核心 --> 取資料（store/music-repository.js）：依 endpoint/dataUrl 取 JSON，寫入播放清單
(6) 核心 --> 核心：建立狀態與音訊引擎
(7) 核心 --> 狀態橋（core/coordinator/state-ui-bridge.js）：訂閱狀態（state）並觸發畫面更新（UIUpdater）
(8) 核心 --> 生命週期（core/coordinator/lifecycle.js）：建立提示層（overlay）、播放控制（PlaybackController）、綁事件
(9) 核心 --> 歌單啟用（core/coordinator/playlist-init.js）：重繪清單、預設曲、出現互動提示
```

解讀重點（初始化）：

1. `src/index.js` 是元件入口，透過 `src/core/coordinator/options-resolver.js` 解析 `data-endpoint` / `data-url` / `default-*` / `custom-icons`。
2. `ui/renderer.js` 先把畫面（Shadow DOM + 樣式 CSS）掛起來，確保後續狀態（state）可以立即反映在畫面（UI）上。
3. `core/index.js`（`Controller`）會透過 `store/music-repository.js` 載入歌單，再建立 `core/domain/playback-state.js` / `core/domain/audio-engine.js`。
4. `core/coordinator/state-ui-bridge.js` 會建立狀態（state）到畫面更新（UI update）的訂閱，所以後續只要 `state.set(...)`，畫面就會自動更新。
5. 初始化後段由 `core/coordinator/lifecycle.js` 建立 `core/domain/playback-controller.js` 與 `services/overlay.js`，再由 `core/coordinator/playlist-init.js` 設定預設曲目與顯示初始互動提示。

---

## 六、執行時事件流

### 1) 使用者操作流程

- 按鈕/拖曳 → 事件只負責轉發 → 播放邏輯改「狀態」→ 狀態一變，畫面跟著變。

```text
使用者在播放器操作（點擊按鈕、拖曳控制條）
  --> 事件轉接器（event-binder）只接收與轉送事件
  --> 播放控制器（playback-controller）判斷要執行的播放行為
  --> 播放狀態（playback-state）寫入最新狀態值
  --> 狀態橋接器（state-ui-bridge）收到狀態變更通知
  --> 畫面更新器（ui-updater）更新圖示、進度條、按鈕狀態
```

**對應檔名：** `event-binder.js` → `playback-controller.js` → `playback-state.js`；從 `state` 到畫面中間的「橋」是初始化時在 `state-ui-bridge.js` 掛好的；真正改 DOM 的是 `ui-updater.js`。

解讀重點（使用者操作）：

1. 使用者在畫面（UI）上的點擊或拖曳，先由 `services/event-binder.js` 接住。
2. `event-binder.js` 不做商業邏輯，只負責把事件轉交給 `core/domain/playback-controller.js`（例如 `onPlayPauseClick`、`onVolumeDrag`）。
3. `playback-controller.js` 處理播放決策後，只更新 `core/domain/playback-state.js`（`set(...)`），不直接改整體畫面。
4. 初始化時已透過 `state-ui-bridge.js` 把 `state` 的變化接到 `ui/ui-updater.js`；之後 `state` 一變就會觸發對應的 `update*`。

**一句話記：** 邏輯只寫入 `State`，**畫面只跟著 State 走。**

### 2) 音訊事件流程

- 和「按鈕操作」一樣：**媒體元素 → 轉到播放邏輯 → 只改狀態 → 再透過同樣的訂閱改畫面**；差別只是事件來自 `<audio>` 而不是按鈕。

```text
音訊元素 <audio> 觸發事件（timeupdate / waiting / canplay / ended）
  --> 音訊引擎（audio-engine）接收事件並轉成內部回呼
  --> 播放控制器音訊處理（playback-controller onAudio*）判斷事件含義
  --> 播放狀態（playback-state）更新播放與載入狀態
  --> 狀態橋接器（state-ui-bridge）接收狀態變更
  --> 畫面更新器（ui-updater）更新進度條與播放圖示
```

**細節（依時間）：**

1. 原生 `HTMLAudioElement` 觸發事件；`audio-engine.js` 在初始化時幫你把它**綁到**幾個固定名稱的處理函式（handler）。
2. 這些處理函式實際呼叫 `playback-controller.js` 的 `onAudioWaiting`、`onAudioPlay` 等音訊事件處理方法（onAudio\*）。
3. 控制器依事件**只更新** `playback-state`（例如 `isPlaying`、`isLoading`），**不**在這裡寫 `element.style`。
4. 與「使用者操作」相同：`state` 一變 → 經啟動時掛好的 `state-ui-bridge` → `ui-updater` 更新畫面。

解讀重點（audio 事件）與上節補充：

1. 原生 `HTMLAudioElement` 的事件先被 `core/domain/audio-engine.js` 接起來、再**轉交**到 `core/domain/playback-controller.js`。
2. 控制器內的 `onAudio*` 只負責**依事件內容改狀態**；畫面仍由 **狀態訂閱 → 畫面更新器** 這條路徑更新。

### 3) 上一首歷史回溯（現行行為）

- `playlist.getPrev()` 會回傳 `{ music, fromHistory }`
- 若 `fromHistory = true`，`playback-controller` 只切歌播放，不再把目前曲目回填到歷史
- 可避免常見的 `A -> B -> A` 來回跳動問題

---

## 七、路徑策略

### 圖示路徑（內建或自定義）

- 由 `getIconUrl()` 處理
- 內建圖示位於 `src/assets/images/`
- `custom-icons` 可覆蓋；給完整路徑就直接使用

### 歌曲資料路徑（`src` / `image`）

- 由 `resolveUserDataPath()` 處理
- 絕對路徑與 URL 保持不變
- 相對路徑會以目前頁面 URL 解析

---
