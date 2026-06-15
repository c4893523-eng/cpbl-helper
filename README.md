# 中信兄弟「象一家人」社群 CPBL 觀賽助手

這是一個給中信兄弟社群使用的 CPBL 觀賽資訊頁。主頁整合中職戰績、近期賽程、球場天氣、公開即時影像入口、直播快捷連結、球隊官網與網站流量統計。

目前專案以靜態網站方式運作，主要入口是 `index.html`。畫面使用 React UMD、Babel、Tailwind CDN 與 Font Awesome CDN，不需要建置流程即可部署到 GitHub Pages 或一般靜態主機。

## 主要功能

- 中職例行賽戰績表
- 上週、本週、下週賽程
- 中信兄弟當日賽事高亮
- 球場即時天氣資訊
- 公開即時影像搜尋入口
- CPBL 直播與球隊官網快捷連結
- Google Apps Script 流量統計
- API 失敗時使用 fallback 備援資料

## 專案檔案

正式頁面與服務：

- `index.html`：主要網站入口，也是目前正式版程式核心。
- `google_traffic_counter.js`：Google Apps Script 後端範例，用於流量統計。
- `.github/workflows/auto-update.yml`：GitHub Actions 自動更新 CPBL 資料。
- `scripts/update_data.js`：從 Rebas API 抓取賽程與戰績，產生靜態 JSON 資料。

資料產物：

- `schedule.json`：由 `scripts/update_data.js` 產生的賽程資料。
- `standings.json`：由 `scripts/update_data.js` 產生的戰績資料。

目前工作區若沒有 `schedule.json` 或 `standings.json`，網站仍會使用 `index.html` 內建的 fallback 資料顯示。

實驗與檢查腳本：

- `check_*.ps1`
- `test_*.ps1`
- `fetch_*.ps1`
- `fetch_yahoo.js`
- `check_games.py`
- `test_yahoo.py`

這些檔案多半是開發期間測試 API、CORS、Proxy、Yahoo 或 Rebas 資料來源用。建議暫時保留，之後再視需要整理到 `scripts/dev/` 或 `scripts/archive/`。

## 本機預覽

最簡單方式是直接用瀏覽器開啟 `index.html`。

如果要模擬靜態網站伺服器，也可以在專案根目錄執行：

```powershell
python -m http.server 8000
```

然後開啟：

```text
http://localhost:8000
```

如果本機沒有 `schedule.json` 或 `standings.json`，戰績與賽程會自動使用 fallback 資料。

## 資料更新流程

GitHub Actions 會依照 `.github/workflows/auto-update.yml` 的排程執行：

```powershell
node scripts/update_data.js
```

成功後會產生或更新：

- `schedule.json`
- `standings.json`

接著 GitHub Actions 會把有變更的資料 commit 回 repository。

資料來源：

- 賽程與戰績：野球革命 Rebas API
- 天氣：Open-Meteo API
- 新聞：Yahoo RSS，透過 AllOrigins proxy 嘗試讀取
- 流量統計：Google Apps Script

## 給 Antigravity 的建議

請先不要重寫整個專案。這個版本已經能作為靜態網站運作，第一優先是穩定資料更新與部署流程。

建議下一步：

1. 確認 GitHub Actions 可以成功產生 `schedule.json` 和 `standings.json`。
2. 在首頁顯示資料最後更新時間。
3. 當資料讀取失敗時，在 UI 顯示「目前使用備援資料」。
4. 先整理測試腳本，不要刪除不確定用途的檔案。
5. 等功能穩定後，再考慮改成 Vite + React 專案。

## 未來可升級方向

- 將 `index.html` 拆成 Vite + React 專案。
- 將元件拆到 `components/`。
- 將資料處理拆到 `services/`。
- 將 fallback 資料拆到 `data/`。
- 補上資料更新時間與資料來源狀態。
- 增加「只看中信兄弟」篩選。
- 增加比賽狀態：未開賽、進行中、已結束。
- 改善手機版賽程卡片的密度與可讀性。
