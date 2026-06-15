# PROJECT NOTES

這份文件是給你、Codex、Antigravity 之後接手時快速理解專案用的工作筆記。它不取代 `README.md`，比較像是交接清單。

## 目前狀態

專案目前是單頁靜態網站，主要程式集中在 `index.html`。React、Tailwind、Babel 與 Font Awesome 都從 CDN 載入，因此不需要 `npm install` 或 build step。

這個做法的優點是部署簡單、上手快。缺點是當功能繼續增加時，`index.html` 會越來越大，元件、資料處理與樣式會比較難維護。

## 正式執行路徑

正式網站主要依賴：

- `index.html`
- `schedule.json`
- `standings.json`
- `google_traffic_counter.js` 對應部署後的 Google Apps Script URL

`schedule.json` 和 `standings.json` 是資料產物，不是手寫主程式。它們應該由 `scripts/update_data.js` 產生。

## 自動更新

`.github/workflows/auto-update.yml` 會定時執行 `scripts/update_data.js`。

目前 workflow 做的事：

- checkout repository
- setup Node.js 20
- run `node scripts/update_data.js`
- 如果 `schedule.json` 或 `standings.json` 有變更，就 commit 並 push

需要確認的事：

- repository 是否有開啟 GitHub Actions 寫入權限
- Rebas API 是否允許 GitHub Actions runner 存取
- `schedule.json` 和 `standings.json` 是否成功被 commit 回 repository

## 已知風險

### 1. CDN 與瀏覽器端 Babel

目前 `index.html` 使用：

- Tailwind CDN
- React UMD CDN
- ReactDOM UMD CDN
- Babel standalone
- Font Awesome CDN

這讓靜態部署很方便，但正式產品長期來看會有載入速度、快取與 CDN 依賴問題。第二階段可以考慮改成 Vite + React。

### 2. 第三方資料來源可能變動

專案依賴 Rebas、Yahoo RSS、AllOrigins、Open-Meteo 與 Google Apps Script。任何一方改規則或限制流量，都可能造成部分功能失效。

目前 `index.html` 已經有 fallback 機制，這是好設計。下一步建議把 fallback 狀態顯示在 UI 上，避免使用者誤以為資料一定是即時的。

### 3. Google Apps Script URL 直接寫在前端

目前 `GAS_TRAFFIC_URL` 寫在 `index.html`。如果這個 URL 是公開部署的 Apps Script，任何人都可以呼叫。建議至少加入 Apps Script 端的簡單防濫用策略，例如每日上限、來源檢查或簡單 token。

### 4. 根目錄實驗檔偏多

根目錄有多個測試與檢查腳本，代表開發過程中做了很多 API 驗證。建議暫時不要刪除，等確認用途後再整理。

## 建議的第一階段收尾

這一階段不改主功能，只做穩定化：

- 保留 `index.html` 現有架構。
- 保留所有測試腳本。
- 確認 `scripts/update_data.js` 可以產出 JSON。
- 補上資料更新狀態或最後更新時間。
- 補 `.gitignore`，避免未來提交暫存檔。
- 等資料更新流程穩了，再做前端工程化。

## 給 Antigravity 的交接指令

可以把下面這段直接交給 Antigravity：

```text
請先不要重寫整個專案。這是 CPBL 靜態觀賽助手，主入口是 index.html，資料更新由 scripts/update_data.js 和 GitHub Actions 負責。

請優先確認：
1. GitHub Actions 是否能成功產生 schedule.json 和 standings.json。
2. index.html 是否能正確讀取這兩個 JSON。
3. 如果讀不到資料，UI 是否能清楚顯示目前使用 fallback 備援資料。
4. 不要刪除 test_*.ps1、check_*.ps1、fetch_*.ps1 等實驗檔，除非已確認用途。

短期目標是穩定，不是重構。等資料更新和部署穩定後，再評估是否改成 Vite + React。
```

## 第二階段重構建議

如果要工程化，建議順序如下：

1. 建立 Vite + React 專案。
2. 先完整移植現有 UI，不加新功能。
3. 拆出 `components/NewsCarousel.jsx`、`components/Standings.jsx`、`components/Schedule.jsx`、`components/Weather.jsx`。
4. 拆出 `services/rebas.js`、`services/weather.js`、`services/traffic.js`。
5. 拆出 `data/fallbackStandings.js` 和 `data/fallbackSchedule.js`。
6. 確認 GitHub Pages 或靜態部署路徑不受影響。
7. 再加入新功能。
