$proxyUrl = "https://api.codetabs.com/v1/proxy?quest=https://www.rebas.tw/api/seasons/CPBL-2026-oB/games"
$response = Invoke-RestMethod -Uri $proxyUrl
$games = $response.data
$juneGames = $games | Where-Object { $_.info.scheduled_start_at -like "2026-06*" }
Write-Output "Total June games: $($juneGames.Count)"
if ($juneGames.Count -gt 0) {
    $juneGames | Select-Object -First 5 | ForEach-Object {
        Write-Output "$($_.info.scheduled_start_at) $($_.away.team) vs $($_.home.team)"
    }
}
$mayGames = $games | Where-Object { $_.info.scheduled_start_at -like "2026-05*" }
Write-Output "Total May games: $($mayGames.Count)"
