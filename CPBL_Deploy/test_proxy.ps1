$url1 = "https://api.allorigins.win/raw?url=https://www.rebas.tw/api/seasons/CPBL-2026-oB/games"
$url2 = "https://corsproxy.io/?https://www.rebas.tw/api/seasons/CPBL-2026-oB/games"

try {
    $r1 = Invoke-RestMethod -Uri $url1 -TimeoutSec 10
    Write-Output "allorigins: success, length $($r1.data.Length)"
} catch {
    Write-Output "allorigins: failed"
}

try {
    $r2 = Invoke-RestMethod -Uri $url2 -TimeoutSec 10
    Write-Output "corsproxy: success, length $($r2.data.Length)"
} catch {
    Write-Output "corsproxy: failed"
}
