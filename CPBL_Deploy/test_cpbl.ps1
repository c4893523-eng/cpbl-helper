$url = "https://www.cpbl.com.tw/schedule"
$proxy = "https://api.allorigins.win/raw?url=" + [uri]::EscapeDataString($url)
$r = Invoke-WebRequest -Uri $proxy -TimeoutSec 15
Write-Output "CPBL success, length: $($r.Content.Length)"
