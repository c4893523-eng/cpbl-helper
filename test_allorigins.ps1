$url = "https://api.allorigins.win/get?url=https://www.rebas.tw/api/seasons/CPBL-2026-oB/games"
$r = Invoke-RestMethod -Uri $url -TimeoutSec 15
Write-Output "Length of contents: $($r.contents.Length)"
