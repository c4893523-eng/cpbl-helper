$url = "https://www.rebas.tw/api/seasons/CPBL-2026-oB/games"
$r = Invoke-WebRequest -Uri $url
$r.Headers | ConvertTo-Json
