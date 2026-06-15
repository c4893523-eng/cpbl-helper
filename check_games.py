import json

with open(r'C:\Users\s180a\.gemini\antigravity\brain\322dd6ed-484d-4a5f-bfb3-91d47dac2587\.system_generated\steps\72\content.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

json_str = ""
for line in lines:
    if line.startswith('{"data":'):
        json_str = line
        break

data = json.loads(json_str)
games = data.get('data', [])

may_games = [g for g in games if g.get('scheduled_start_at', '').startswith('2026-05')]
print(f"Total May games: {len(may_games)}")
for g in may_games[:10]:
    print(g['scheduled_start_at'], g['away']['team'], "vs", g['home']['team'])
