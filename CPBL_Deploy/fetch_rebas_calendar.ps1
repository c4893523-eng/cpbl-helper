$url = "https://www.rebas.tw/season/CPBL-2026-oB/calendar"
$r = Invoke-WebRequest -Uri $url -UserAgent "Mozilla/5.0"
$html = $r.Content
if ($html -match 'id="__NEXT_DATA__" type="application/json">(.+?)</script>') {
    $matches[1] | Out-File "rebas_calendar.json" -Encoding UTF8
    Write-Output "Found NEXT_DATA in Rebas calendar, length: $($matches[1].Length)"
} else {
    Write-Output "NEXT_DATA not found in calendar"
}
