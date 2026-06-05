$urlB = "https://www.rebas.tw/api/seasons/CPBL-2026-oB/games"
$rB = Invoke-RestMethod -Uri $urlB
$games = $rB.data

Write-Output "First game: $($games[0].info.scheduled_start_at)"
Write-Output "Game 50: $($games[50].info.scheduled_start_at)"
Write-Output "Game 100: $($games[100].info.scheduled_start_at)"
Write-Output "Game 150: $($games[150].info.scheduled_start_at)"
Write-Output "Game 200: $($games[200].info.scheduled_start_at)"
Write-Output "Last game: $($games[-1].info.scheduled_start_at)"
