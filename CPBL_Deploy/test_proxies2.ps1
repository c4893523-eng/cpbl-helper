$url = "https://www.rebas.tw/api/seasons/CPBL-2026-oA/games"
$proxy = "https://corsproxy.io/?" + [uri]::EscapeDataString($url)

try {
    $r = Invoke-WebRequest -Uri $proxy -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36" -TimeoutSec 15
    Write-Output "corsproxy success, length: $($r.Content.Length)"
} catch {
    Write-Output "corsproxy failed: $_"
}

$proxy2 = "https://thingproxy.freeboard.io/fetch/" + $url
try {
    $r2 = Invoke-WebRequest -Uri $proxy2 -UserAgent "Mozilla/5.0" -TimeoutSec 15
    Write-Output "thingproxy success, length: $($r2.Content.Length)"
} catch {
    Write-Output "thingproxy failed: $_"
}
