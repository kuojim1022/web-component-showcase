# 音樂播放器 Web Component 使用指南

## 📋 目錄

- [概述](#概述)
- [快速開始](#快速開始)
- [HTML 結構](#html-結構)
- [音樂資料格式](#音樂資料格式)
- [自定義圖示](#自定義圖示)
- [完整範例](#完整範例)
- [常見問題](#常見問題)

---

## 📖 概述

音樂播放器 Web Component 是一個可重用的自訂元素，可以在任何專案中使用。它提供了完整的音樂播放功能，包括播放控制、音量控制、播放模式切換等功能。

### 主要特點

- ✅ **封裝性**：使用 Shadow DOM 隔離樣式和 DOM
- ✅ **可重用性**：可在多個頁面或專案中使用
- ✅ **易於整合**：只需引入檔案並設定資料即可使用
- ✅ **自動初始化**：掛載後自動載入資料並建立播放器
- ✅ **行動裝置可用**：支援觸控拖曳與行動端音量調整
- ✅ **完整播放控制**：播放/暫停、上一首/下一首、隨機、單曲循環

---

## 🚀 快速開始

播放器支援兩種資料載入方式：**動態資料**（後端 API）和**靜態資料**（JSON 檔案）。請根據專案需求選擇適合的方式。

### 先做一次：引入組件

```html
<script
  type="module"
  src="/你的專案路徑/components/music-player/src/index.js"
></script>
```

---

### 方式一：動態資料（API Endpoint）

**適用場景**：音樂資料需要從資料庫動態讀取，或使用 PHP/Smarty 等後端模板引擎。

#### 步驟 1：在 HTML 中加入 Web Component

```html
<music-player data-endpoint="/你的路徑/getMusicData"></music-player>
```

#### 步驟 2：準備 API Endpoint（後端）

建立一個 API endpoint 返回 JSON 格式的音樂資料。API 回應格式如下：

```json
{
  "state": true,
  "msg": "OK",
  "data": [
    {
      "id": "music1",
      "src": "/path/to/music1.mp3",
      "title": "歌曲名稱 1",
      "image": "/path/to/cover1.jpg",
      "lengthSeconds": 180,
      "isDefault": true
    }
  ]
}
```

#### 步驟 3：完成

完成！組件會自動透過 `data-endpoint` 指定的 API 載入音樂資料並初始化播放器。

---

### 方式二：靜態資料（JSON 檔案）

**適用場景**：音樂清單固定，不需要動態更新，純前端專案。

#### 步驟 1：在 HTML 中加入 Web Component

```html
<music-player data-url="/你的路徑/data/music-data.json"></music-player>
```

#### 步驟 2：準備音樂資料（JSON 檔案）

建立 `music-data.json` 檔案並放置於你的資料目錄（例如：`/你的路徑/data/music-data.json`）：

```json
[
  {
    "id": "song1",
    "src": "/music/song1.mp3",
    "title": "歌曲名稱 1",
    "image": "/images/cover1.jpg",
    "lengthSeconds": 180,
    "isDefault": true
  }
]
```

#### 步驟 3：完成

設定 `data-url` 後，播放器會在初始化時自動載入 JSON 並顯示音樂清單。

---

**重要提醒**：

- 此組件採 ES Module 版本，請使用 `<script type="module" ...>` 載入 `src/index.js`
- UI 與樣式由組件內部模組自動載入（`ui/renderer.js` + `ui/styles/*.css`）
- 若要客製樣式，請修改 `src/ui/styles/*.css`，並保持 class 名稱與 DOM 結構相容

---

## 🏗️ HTML 結構

### 基本結構

```html
<music-player
  data-endpoint="/api/music/list"
  default-volume="0.4"
  default-repeat="true"
  default-shuffle="false"
  custom-icons='{"icon-play": "custom-play.svg"}'
></music-player>
```

### 屬性說明

常用屬性如下：

- **`data-endpoint`**：API 路徑（回傳 `{state: true, data: [...]}`）
- **`data-url`**：靜態 JSON 路徑（回傳陣列）
- **`default-volume`**：初始音量（0~1，預設 `0.7`）
- **`default-repeat`**：是否預設單曲循環（預設 `false`）
- **`default-shuffle`**：是否預設隨機播放（預設 `false`）
- **`custom-icons`**：自定義圖示（JSON）

---

## 🎵 音樂資料格式

### 資料結構

每個音樂項目是一個物件，包含以下屬性：

| 屬性            | 類型          | 必填 | 說明                                       |
| --------------- | ------------- | ---- | ------------------------------------------ |
| `id`            | string/number | ✅   | 唯一識別碼，用於播放歷史記錄與播放定位     |
| `src`           | string        | ✅   | 音樂檔案路徑（絕對路徑或相對路徑）         |
| `title`         | string        | ✅   | 音樂標題                                   |
| `image`         | string        | ❌   | 封面圖片路徑（可選）                       |
| `lengthSeconds` | number        | ✅   | 音樂時長（秒數），用於顯示音樂清單中的時長 |
| `isDefault`     | boolean       | ❌   | 是否為預設播放（可選，預設為 `false`）     |

### 路徑處理

- **絕對路徑**：以 `/`、`http://`、`https://` 或 `//` 開頭，直接使用
- **相對路徑**：其餘格式，會以目前頁面 URL 作為基準解析

### 範例

以下範例即可涵蓋常見情境（絕對路徑 + 相對路徑）：

```json
[
  {
    "id": "song-absolute",
    "src": "/media/music/song1.mp3",
    "title": "歌曲 A",
    "image": "/images/cover-a.jpg",
    "lengthSeconds": 240,
    "isDefault": true
  },
  {
    "id": "song-relative",
    "src": "audio/song2.mp3",
    "title": "歌曲 B",
    "lengthSeconds": 180
  }
]
```

- `src` / `image` 以 `/` 開頭：使用網站根目錄絕對路徑
- `src` / `image` 不以 `/` 開頭：使用目前頁面相對路徑

---

## 🎨 自定義圖示

播放器支援透過 `custom-icons` 屬性自定義圖示。

常用 key：`icon-play`、`icon-pause`、`icon-prev`、`icon-next`、`icon-music`、`icon-volume`、`icon-volume-mute`。

範例：

```html
<music-player custom-icons='{"icon-play": "custom-play.svg"}'></music-player>
```

路徑規則：

- 只給檔名（如 `custom-play.svg`）會使用組件內建圖示目錄
- 給完整路徑（如 `"/images/custom.svg"`、`"https://..."`）會直接使用

> 目前版本僅支援透過 `custom-icons` 屬性設定圖示，未提供 `setCustomIcons()` API。

---

## ❓ 常見問題

### Q1：播放器沒有顯示？

**A**：請確認：

1. 已正確引入 `src/index.js`（`<script type="module" ...>`）
2. HTML 中有 `<music-player>` 元素
3. 瀏覽器支援 Web Components（現代瀏覽器都支援）

---

### Q2：音樂清單沒有載入？

**A**：請確認：

1. 如果使用 `data-endpoint`，確認 API endpoint 網址正確且可正常存取
2. 如果使用 `data-url`，確認 JSON 路徑可直接開啟且回傳陣列資料
3. API 回應格式正確（需包含 `state: true` 和 `data` 陣列）
4. JSON 資料格式正確（包含必填欄位：`id`, `src`, `title`）
5. 音樂資料陣列不為空
6. 檢查瀏覽器控制台是否有錯誤訊息

---

### Q3：音樂無法播放？

**A**：請確認：

1. 音樂檔案路徑正確
2. 音樂檔案格式支援（MP3、WAV、OGG 等）
3. 瀏覽器支援該音訊格式
4. 伺服器允許跨域存取（如果音樂檔案在不同網域）

---

### Q4：行動裝置無法調整音量？

**A**：播放器已統一使用 Web Audio API 控制音量，所有裝置（包括行動裝置）都可以使用音量進度條調整音量。如果無法調整，請確認：

1. 瀏覽器支援 Web Audio API
2. 已進行用戶互動（點擊過頁面）
3. 檢查瀏覽器控制台是否有錯誤訊息

---

### Q5：如何自訂樣式？

**A**：播放器樣式已拆分於 `src/ui/styles/`（`player-view.css`、`list-view.css`、`overlay-view.css`），可直接調整。

**重要提醒**：

- 可以修改 CSS 樣式（顏色、大小、間距等）
- **請勿修改 `className`**，這些 class 名稱用於 JavaScript 功能綁定，修改後會導致功能異常
- 如需調整樣式，請編輯 `src/ui/styles/*.css`

---
