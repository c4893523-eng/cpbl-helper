const fs = require('fs');
const path = require('path');

const SCHEDULE_URL = "https://www.rebas.tw/api/seasons/CPBL-2026-oB/games";
const STANDINGS_URL = "https://www.rebas.tw/api/seasons/CPBL-2026-oB/leaders?type=team&section=standard&pa=undefined";
const NEWS_RSS_URL = "https://tw.news.yahoo.com/rss/sports";

const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Origin": "https://www.rebas.tw",
    "Referer": "https://www.rebas.tw/season/CPBL-2026-oB"
};

function parseYahooRss(xmlText) {
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    // Curated baseball placeholder images
    const fallbackImages = [
        'https://images.unsplash.com/photo-1508344928928-7137b29de216?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1558000143-a6217b1b3699?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80'
    ];

    const keywords = ['中職', '棒球', '中信', '兄弟', '味全', '龍', '統一', '獅', '樂天', '桃猿', '富邦', '悍將', '台鋼', '雄鷹', '中華職棒', '女排', '射箭', '世界盃', 'NBA', '泳將', '高爾夫', '宋家豪', '大谷'];

    let idx = 0;
    while ((match = itemRegex.exec(xmlText)) !== null) {
        const itemContent = match[1];
        
        // Helper to extract tag content (handling CDATA)
        const getTagContent = (tagPattern) => {
            const regex = new RegExp(`<${tagPattern}>([\\s\\S]*?)<\\/${tagPattern}>`, 'i');
            const tagMatch = itemContent.match(regex);
            if (tagMatch) {
                let val = tagMatch[1];
                if (val.startsWith('<![CDATA[')) {
                    val = val.substring(9, val.length - 3);
                }
                return val.trim();
            }
            return '';
        };

        const title = getTagContent('title');
        const link = getTagContent('link');
        const pubDate = getTagContent('pubDate');
        const description = getTagContent('description');
        
        // Extract content:encoded
        let contentEncoded = '';
        const encodedMatch = itemContent.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i);
        if (encodedMatch) {
            contentEncoded = encodedMatch[1];
            if (contentEncoded.startsWith('<![CDATA[')) {
                contentEncoded = contentEncoded.substring(9, contentEncoded.length - 3);
            }
            contentEncoded = contentEncoded.trim();
        }

        // Extract image url
        let imgUrl = '';
        if (contentEncoded && contentEncoded.startsWith('http')) {
            imgUrl = contentEncoded;
        } else if (contentEncoded) {
            const srcMatch = contentEncoded.match(/src="([^"]+)"/);
            if (srcMatch) imgUrl = srcMatch[1];
        }

        if (!imgUrl) {
            // Try enclosure url="..."
            const encMatch = itemContent.match(/<enclosure[^>]+url="([^"]+)"/i);
            if (encMatch) imgUrl = encMatch[1];
        }

        if (!imgUrl) {
            // Try media:content url="..."
            const mediaMatch = itemContent.match(/<(?:media:)?content[^>]+url="([^"]+)"/i);
            if (mediaMatch) imgUrl = mediaMatch[1];
        }

        if (!imgUrl) {
            // Try media:thumbnail url="..."
            const thumbMatch = itemContent.match(/<(?:media:)?thumbnail[^>]+url="([^"]+)"/i);
            if (thumbMatch) imgUrl = thumbMatch[1];
        }

        const dateObj = new Date(pubDate);
        const formattedDate = !isNaN(dateObj) ? `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${dateObj.getHours()}:${String(dateObj.getMinutes()).padStart(2, '0')}` : '即時';

        if (title && keywords.some(kw => title.includes(kw) || description.includes(kw))) {
            items.push({
                id: `rss_${idx++}`,
                title,
                description,
                link,
                pubDate: formattedDate,
                rawImg: imgUrl || '',
                fallbackImg: fallbackImages[idx % fallbackImages.length]
            });
        }
    }
    return items;
}

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
        process.exit(1); // Fail the GitHub action if we can't fetch standings or schedule
    }
}

async function fetchAndSaveNews() {
    try {
        console.log(`Fetching Yahoo Sports RSS: ${NEWS_RSS_URL}...`);
        const response = await fetch(NEWS_RSS_URL, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        
        const xmlText = await response.text();
        const parsedNews = parseYahooRss(xmlText);
        
        console.log(`Parsed ${parsedNews.length} matching sports news items.`);
        
        const outputPath = path.join(__dirname, '..', 'news.json');
        fs.writeFileSync(outputPath, JSON.stringify({ success: true, data: parsedNews }, null, 2));
        console.log(`✅ Successfully saved to news.json`);
    } catch (error) {
        console.error(`❌ Error fetching/saving news:`, error.message);
        // Do not fail the script if news fails, as schedule/standings are more critical
    }
}

async function main() {
    console.log("Starting data update...");
    await fetchAndSave(SCHEDULE_URL, 'schedule.json');
    await fetchAndSave(STANDINGS_URL, 'standings.json');
    await fetchAndSaveNews();
    console.log("Update completed.");
}

main();
