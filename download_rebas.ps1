$urlA = "https://www.rebas.tw/api/seasons/CPBL-2026-oA/games"
$urlB = "https://www.rebas.tw/api/seasons/CPBL-2026-oB/games"

try {
    $rA = Invoke-RestMethod -Uri $urlA -TimeoutSec 15
    $rB = Invoke-RestMethod -Uri $urlB -TimeoutSec 15
    $rA.data + $rB.data | ConvertTo-Json -Depth 10 | Out-File "rebas_games_2026.json" -Encoding UTF8
    Write-Output "Successfully downloaded all games to rebas_games_2026.json"
} catch {
    Write-Output "Direct fetch failed: $_"
}
