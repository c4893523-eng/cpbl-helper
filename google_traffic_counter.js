/**
 * 流量計後端 API (Google Apps Script)
 * 功用：統計每日、每週、每月、總造訪次數
 * 
 * 使用方式：
 * 1. 前往 https://script.google.com/ 建立新專案
 * 2. 貼入此代碼並儲存
 * 3. 部署為「網頁應用程式」，且「誰可以存取」選擇「所有人 (Anyone)」
 * 4. 將取得的 exec 網址填入 index.html 的 GAS_TRAFFIC_URL 變數中
 */
function doGet(e) {
  var action = e.parameter.action; // 'hit', 'get', 或 'standings'
  
  // ==========================================
  // 1. 中職戰績抓取代理 (CORS Proxy)
  // ==========================================
  if (action === 'standings') {
    try {
      // 改為抓取野球革命 (Rebas) 的公開 API (JSON 格式)
      var url = "https://www.rebas.tw/api/seasons/CPBL-2026-oB/leaders?type=team&section=standard&pa=undefined";
      var response = UrlFetchApp.fetch(url, { 
        muteHttpExceptions: true,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "application/json"
        }
      });
      var jsonText = response.getContentText();
      return ContentService.createTextOutput(JSON.stringify({ success: true, contents: jsonText }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // ==========================================
  // 1.5 中職賽程/比分抓取代理 (CORS Proxy)
  // ==========================================
  if (action === 'schedule') {
    try {
      var url = "https://www.rebas.tw/api/seasons/CPBL-2026-oB/games";
      var response = UrlFetchApp.fetch(url, { 
        muteHttpExceptions: true,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "application/json"
        }
      });
      var jsonText = response.getContentText();
      return ContentService.createTextOutput(jsonText)
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // ==========================================
  // 2. 流量計後端邏輯
  // ==========================================
  var props = PropertiesService.getScriptProperties();
  var now = new Date();
  
  // 設定時區為台北 (GMT+8)
  var todayStr = Utilities.formatDate(now, "GMT+8", "yyyy-MM-dd");
  var monthStr = Utilities.formatDate(now, "GMT+8", "yyyy-MM");
  
  // 計算本週第一天 (週日) 的日期字串
  var sun = new Date(now);
  sun.setDate(now.getDate() - now.getDay());
  var weekStr = Utilities.formatDate(sun, "GMT+8", "yyyy-MM-dd");

  // 讀取目前的統計資料 (若無則初始化)
  var stats = JSON.parse(props.getProperty("traffic_stats") || '{"total":0, "monthly":0, "weekly":0, "daily":0, "lastDate":"", "lastWeek":"", "lastMonth":""}');

  // 檢查是否跨日、跨週、跨月，若跨過則重設計數
  if (stats.lastDate !== todayStr) { stats.daily = 0; stats.lastDate = todayStr; }
  if (stats.lastWeek !== weekStr) { stats.weekly = 0; stats.lastWeek = weekStr; }
  if (stats.lastMonth !== monthStr) { stats.monthly = 0; stats.lastMonth = monthStr; }

  // 如果 action 是 hit，則增加所有計數
  if (action === 'hit') {
    stats.total++;
    stats.monthly++;
    stats.weekly++;
    stats.daily++;
    props.setProperty("traffic_stats", JSON.stringify(stats));
  }

  // 回傳 JSON 格式結果，供網頁讀取
  return ContentService.createTextOutput(JSON.stringify({ success: true, data: stats }))
    .setMimeType(ContentService.MimeType.JSON);
}
