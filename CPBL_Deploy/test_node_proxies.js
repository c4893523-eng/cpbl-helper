const fs = require('fs');

async function testProxies() {
    const targetUrl = "https://www.rebas.tw/api/seasons/CPBL-2026-oA/games";
    const proxies = [
        "https://api.allorigins.win/raw?url=" + encodeURIComponent(targetUrl),
        "https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent(targetUrl),
        "https://corsproxy.io/?" + encodeURIComponent(targetUrl)
    ];

    for (const p of proxies) {
        try {
            console.log("Testing:", p);
            const res = await fetch(p, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
                }
            });
            console.log("Status:", res.status);
            if (res.ok) {
                const data = await res.json();
                console.log("Success! Data length:", data.data.length);
                return;
            }
        } catch (e) {
            console.log("Failed:", e.message);
        }
    }
}

testProxies();
