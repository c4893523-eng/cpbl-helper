$content = Get-Content -Path "C:\Users\s180a\.gemini\antigravity\brain\322dd6ed-484d-4a5f-bfb3-91d47dac2587\.system_generated\steps\72\content.md" | Where-Object { $_ -like "{*" }
$obj = $content | ConvertFrom-Json
$games = $obj.data

$games | Where-Object { $_.info.scheduled_start_at -like "2026-06*" } | Select-Object -ExpandProperty info | Select-Object scheduled_start_at | Select-Object -First 10
