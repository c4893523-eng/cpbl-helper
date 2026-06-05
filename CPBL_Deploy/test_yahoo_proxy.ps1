$url = "https://tw.sports.yahoo.com/cpbl/scoreboard/"
$proxy = "https://api.allorigins.win/raw?url=" + [uri]::EscapeDataString($url)

try {
    $r = Invoke-RestMethod -Uri $proxy -TimeoutSec 15
    Write-Output "Yahoo fetch success, length: $($r.Length)"
    if ($r -match '<script id="__NEXT_DATA__" type="application/json">(.*?)</script>') {
        $jsonStr = $matches[1]
        Write-Output "Found NEXT_DATA, length: $($jsonStr.Length)"
        # Write to file to inspect
        $jsonStr | Out-File "yahoo_next_data.json"
    } else {
        Write-Output "NEXT_DATA not found"
    }
} catch {
    Write-Output "Yahoo fetch failed"
}
