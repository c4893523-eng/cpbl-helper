$url = "https://tw.sports.yahoo.com/cpbl/scoreboard/"
$proxy = "https://api.allorigins.win/get?url=" + [uri]::EscapeDataString($url)

$r = Invoke-RestMethod -Uri $proxy
if ($r.contents -match 'id="__NEXT_DATA__" type="application/json">(.*?)</script>') {
    $matches[1] | Out-File "yahoo_score.json" -Encoding UTF8
    Write-Output "Saved to yahoo_score.json"
} else {
    Write-Output "Failed to find NEXT_DATA"
}
