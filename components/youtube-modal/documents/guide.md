# YouTube Modal Web Component 使用手冊

## 目錄

- [基本用法](#基本用法)
- [API Endpoint 設定](#api-endpoint-設定)
- [靜態資料引用方式](#靜態資料引用方式)
- [功能開關設定](#功能開關設定)
- [播放器類型比較與選擇建議](#播放器類型比較與選擇建議)

---

## 基本用法

### 1. 在 HTML 中放入元件

```html
<youtube-modal endpoint="/path/to/getVideoDetail"></youtube-modal>
```

### 2. 載入元件腳本

```html
<script type="module" src="/path/to/youtube-modal/src/index.js"></script>
```

**注意**：請將 `/path/to/youtube-modal` 替換為實際的元件安裝路徑。

---

## API Endpoint 設定

元件需要透過 endpoint 取得影片詳細資料。設定方式有兩種：

### 方式 1：HTML 屬性（推薦）

直接在元件標籤中設定：

```html
<youtube-modal endpoint="/path/to/getVideoDetail"></youtube-modal>
```

### 方式 2：全域變數（跨頁共用）

多頁共用同一個 endpoint 時，可在頁面先設定全域變數，元件初始化時會讀取它；標籤上就不必再寫 `endpoint`。

```html
<script>
  window.YOUTUBE_MODAL_ENDPOINT = "/path/to/getVideoDetail";
</script>
<youtube-modal></youtube-modal>
```

**為什麼不用寫在標籤裡？** 元件內部會依序檢查：先看是否有 HTML 屬性 `endpoint`，沒有時再讀 `window.YOUTUBE_MODAL_ENDPOINT`，因此只要在全域設定好即可。

### 優先順序

1. HTML 屬性 `endpoint`（最高優先）
2. 全域變數 `window.YOUTUBE_MODAL_ENDPOINT`

**重要**：若兩者都未設定，元件無法以 API 模式載入影片資料。

---

## 靜態資料引用方式

用自己的 JSON 當詳情來源時，照下面做即可。

**1. JSON 長這樣**（陣列，每筆一則影片詳情，格式同 [API 回應格式](#api-回應格式)）：

```json
[
  { "status": true, "video": { "id": "1", "title": "標題", "description": "描述", "youtubeId": "xxx" }, "related": [...] },
  { "status": true, "video": { "id": "2", ... }, "related": [...] }
]
```

**2. 在 HTML 設定元件為靜態來源**：**必須**設定 `data-url` 指定 JSON 網址（元件無預設路徑，未設定會報錯）。

```html
<youtube-modal data-url="/path/to/getVideoDetail.json"></youtube-modal>
```

---

## 功能開關設定

### 在設定檔中設定

編輯 `youtube-modal/src/config.js`，以下區塊皆可用行內註解調整：

**CONFIG**

```javascript
export const CONFIG = {
  SHOW_TITLE: true, // 是否顯示影片標題
  SHOW_DESCRIPTION: true, // 是否顯示影片描述（空描述會自動隱藏）
  SHOW_RELATED_DEFAULT: true, // 是否預設顯示相關影片（可被 HTML 屬性 show-related 覆蓋）
  PLAYER_TYPE: "iframe", // 播放器類型：'lite-youtube' | 'iframe' | 'youtube-iframe-api'
};
```

### 在 HTML 標籤中設定

```html
<!-- 例：關閉相關影片 -->
<youtube-modal
  endpoint="/path/to/getVideoDetail"
  show-related="false"
></youtube-modal>
```

**PLAYER_VARS**

```javascript
export const PLAYER_VARS = {
  autoplay: 1, // 自動播放：建議開啟
  controls: 1, // 顯示播放器控制列（播放／暫停、音量、全螢幕等）
  rel: 0, // 相關影片：0＝只顯示同頻道，1＝可顯示其他頻道
  playsinline: 1, // iOS 內嵌播放（不強制全螢幕）
  modestbranding: 0, // 0＝顯示 YouTube logo，1＝精簡品牌
  iv_load_policy: 3, // 影片註解：1＝顯示，3＝不顯示
};
```

修改後重新載入頁面即可生效。

---

## 播放器類型比較與選擇建議

目前支援三種 `PLAYER_TYPE`：`lite-youtube`、`iframe`、`youtube-iframe-api`。

### 差異與優勢

- `lite-youtube`：最輕量、首屏負擔最低；適合重視載入速度與大量卡片列表。取捨是依賴外部套件資產（CDN 腳本與樣式）。
- `iframe`：原生、實作與除錯最直覺，相容性高；適合一般需求快速上線。取捨是互動控制能力較 API 版本少。
- `youtube-iframe-api`：可程式化控制最完整（如更進階事件與播放器操作）；適合需要深度客製互動。取捨是整合複雜度與維護成本較高。

### 如何選

1. 以效能優先、內容列表多：選 `lite-youtube`
2. 需求單純、要穩定快速落地：選 `iframe`
3. 需要進階控制與事件整合：選 `youtube-iframe-api`
