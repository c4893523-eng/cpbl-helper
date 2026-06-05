$json = Get-Content rebas_calendar.json -Raw | ConvertFrom-Json
$games = $json.props.pageProps.initialState.season.games
$juneGames = $games | Where-Object { $_.info.scheduled_start_at -like '2026-06-0*' }
$juneGames | Select-Object -ExpandProperty info | Select-Object scheduled_start_at, away_team_id, home_team_id
