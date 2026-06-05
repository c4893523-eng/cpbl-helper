$content = Get-Content -Path "C:\Users\s180a\.gemini\antigravity\brain\322dd6ed-484d-4a5f-bfb3-91d47dac2587\.system_generated\steps\72\content.md" -Raw
$obj = $content | ConvertFrom-Json
$games = $obj.data

Write-Output "Total games: $($games.Length)"
Write-Output "First game date: $($games[0].scheduled_start_at)"
Write-Output "Last game date: $($games[-1].scheduled_start_at)"

$may_games = $games | Where-Object { $_.scheduled_start_at -like '2026-05*' }
Write-Output "May games: $($may_games.Length)"
