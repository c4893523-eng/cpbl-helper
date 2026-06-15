$urlA = "https://www.rebas.tw/api/seasons/CPBL-2026-oA/games"
try {
    $rA = Invoke-RestMethod -Uri $urlA
    Write-Output "oA length: $($rA.data.Count)"
} catch {
    Write-Output "oA failed: $_"
}

$urlB = "https://www.rebas.tw/api/seasons/CPBL-2026-oB/games"
try {
    $rB = Invoke-RestMethod -Uri $urlB
    Write-Output "oB length: $($rB.data.Count)"
} catch {
    Write-Output "oB failed: $_"
}
