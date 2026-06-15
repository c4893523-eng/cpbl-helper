const fs = require('fs');

async function fetchYahoo() {
    const url = "https://tw.sports.yahoo.com/cpbl/scoreboard/?date=2026-05-26";
    // Try via codetabs
    const proxyUrl = "https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent(url);
    
    try {
        const res = await fetch(proxyUrl);
        const html = await res.text();
        fs.writeFileSync('yahoo_test.html', html);
        
        // Let's see if we can find team names
        if (html.includes('中信兄弟')) {
            console.log("Success! Found team names in HTML.");
        } else {
            console.log("Failed to find team names. Might be fully CSR or blocked.");
        }
    } catch (e) {
        console.error(e);
    }
}
fetchYahoo();
