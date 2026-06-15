import urllib.request
import re

url = "https://tw.sports.yahoo.com/cpbl/standings"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        print("Status: 200")
        match = re.search(r'root\.App\.main\s*=\s*(\{.*?\});', html)
        if match:
            print("Found JSON!")
        else:
            print("No JSON found in Yahoo.")
except Exception as e:
    print("Error:", e)
