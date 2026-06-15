const fetch = require('node-fetch');

async function testCPBL() {
    try {
        console.log("Fetching CPBL Standings...");
        const res = await fetch("https://www.cpbl.com.tw/standings/season");
        const html = await res.text();
        console.log("Status:", res.status);
        console.log("Length:", html.length);
        console.log("Snippet:", html.substring(0, 500));
    } catch (e) {
        console.error("Error:", e);
    }
}
testCPBL();
