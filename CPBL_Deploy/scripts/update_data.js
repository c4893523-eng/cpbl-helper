const fs = require('fs');
const path = require('path');

const SCHEDULE_URL = "https://www.rebas.tw/api/seasons/CPBL-2026-oB/games";
const STANDINGS_URL = "https://www.rebas.tw/api/seasons/CPBL-2026-oB/leaders?type=team&section=standard&pa=undefined";

const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Origin": "https://www.rebas.tw",
    "Referer": "https://www.rebas.tw/season/CPBL-2026-oB"
};

async function fetchAndSave(url, filename) {
    try {
        console.log(`Fetching ${url}...`);
        const response = await fetch(url, { headers: HEADERS });
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data && data.data) {
            const outputPath = path.join(__dirname, '..', filename);
            fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
            console.log(`✅ Successfully saved to ${filename}`);
        } else {
            console.error(`❌ Invalid data format for ${filename}`);
        }
    } catch (error) {
        console.error(`❌ Error fetching ${filename}:`, error.message);
        process.exit(1); // Fail the GitHub action if we can't fetch
    }
}

async function main() {
    console.log("Starting data update...");
    await fetchAndSave(SCHEDULE_URL, 'schedule.json');
    await fetchAndSave(STANDINGS_URL, 'standings.json');
    console.log("Update completed.");
}

main();
