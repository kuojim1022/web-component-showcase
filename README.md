# Web Component 元件展示網站

本專案為 **Web Components** 的展示站：首頁串連各元件示範頁，方便檢視。

## 開發環境

- **Node.js：建議使用 20.x（LTS）**，與 `npx`、Dart Sass 等工具行為一致；若使用較舊版本（例如 Node 12），可能出現 `npx` 參數不相容等問題。
- 若使用 [nvm](https://github.com/nvm-sh/nvm) 或 [nvm-windows](https://github.com/coreybutler/nvm-windows)，可切換至 Node 20 後再執行下方腳本。

---

## 編輯 SCSS 樣式

如需修改樣式，請在編輯 SCSS 檔案前先啟動監聽模式：

**在 Git Bash 或 WSL 終端機中執行：**

```bash
./watch-scss.sh
```

會監聽 `src/scss/` 並即時編譯至 `dist/css/main.css`。編譯後請重整瀏覽器；`Ctrl+C` 可停止監聽。

## 素材與使用聲明

本專案僅作技術展示，素材均採公有領域資源且不具商業用途。

This project is for technical demonstration only; all media assets are sourced from the public domain and are strictly for non-commercial use.

---
