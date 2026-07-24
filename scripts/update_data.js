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

// Helper to determine root directory dynamically
function getOutputPath(filename) {
    let baseDir = __dirname;
    // If running inside scripts folder, go up one level to the root
    if (baseDir.endsWith('scripts') || baseDir.endsWith('scripts/') || baseDir.endsWith('scripts\\')) {
        baseDir = path.join(baseDir, '..');
    }
    return path.join(baseDir, filename);
}

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

    const keywords = ['中職', '棒球', '中信', '兄弟', '味全', '龍隊', '龍將', '統一', '獅隊', '樂天', '桃猿', '富邦', '悍將', '台鋼', '雄鷹', '中華職棒', '宋家豪', '大谷', '張育成', '旅外', '勇士', '特攻', '獵鷹', '領航猿', '攻城獅', '國王', '夢想家', '海神', '雲豹', '戰神', 'plg', 'tpbl', 't1', '職籃', '林書豪', '孫易磊', '日職'];

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

        const excludeKeywords = ['台球', '撞球', '桌球', '足球', '羽球', '網球', '高爾夫', '體操', '舉重', '排球', '田徑', '游泳', '射箭', '跆拳道', '柔道', '角力', '冰球', '賽車', 'F1', '政大', 'UBA', 'HBL', '高中籃球', '大專籃球', '國中籃球', '金州', '沙加緬度', '美國職籃', 'NBA總冠軍', 'NBA季後賽', '湖人', '塞爾提克', '獨行俠', '金塊', '世足', 'FIFA', '世界盃足球', '溫網', '溫布頓', '法網', '美網', '澳網'];

        const hasKeyword = keywords.some(kw => title.includes(kw) || description.includes(kw));
        const hasExclude = excludeKeywords.some(kw => title.includes(kw) || description.includes(kw));

        if (title && hasKeyword && !hasExclude) {
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

async function fetchJson(url, label) {
    try {
        console.log(`Fetching ${url}...`);
        const response = await fetch(url, { headers: HEADERS });
        if (!response.ok) throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        const data = await response.json();
        if (data && data.data) return data;
        throw new Error(`Invalid data format for ${label}`);
    } catch (error) {
        console.error(`❌ Error fetching ${label}:`, error.message);
        process.exit(1);
    }
}

function saveJson(filename, data) {
    fs.writeFileSync(getOutputPath(filename), JSON.stringify(data, null, 2));
    console.log(`✅ Successfully saved to ${filename}`);
}

// Rebas 的排行榜偶爾會比單場賽果晚更新。以已結束的正式比賽重算連勝／連敗，
// 和局與無效比賽不會中斷連勝／連敗。
function calculateStreaks(standings, games) {
    const finishedGames = games
        .filter(game => game.is_formal && game.info?.status === 'FINISHED')
        .sort((a, b) => new Date(b.info.ended_at || b.info.scheduled_start_at) - new Date(a.info.ended_at || a.info.scheduled_start_at));

    return standings.map(row => {
        const teamId = row.team?.season_team_uniqid;
        let streak = 0;
        let result = null;
        for (const game of finishedGames) {
            const isAway = game.away?.season_team_uniqid === teamId;
            const isHome = game.home?.season_team_uniqid === teamId;
            if (!isAway && !isHome) continue;
            const winnerSide = game.info?.winner_side;
            if (winnerSide !== 'AWAY' && winnerSide !== 'HOME') continue;
            const won = (isAway && winnerSide === 'AWAY') || (isHome && winnerSide === 'HOME');
            if (result === null) result = won;
            if (result !== won) break;
            streak += won ? 1 : -1;
        }
        return { ...row, STRK: streak };
    });
}

async function fetchAndSaveNews() {
    const urls = [
        "https://tw.news.yahoo.com/rss/sports",
        "https://news.ltn.com.tw/rss/sports.xml"
    ];
    let allNews = [];

    for (const url of urls) {
        try {
            console.log(`Fetching Sports RSS: ${url}...`);
            const response = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }
            
            const xmlText = await response.text();
            const parsedNews = parseYahooRss(xmlText);
            allNews = allNews.concat(parsedNews);
            
            console.log(`Parsed ${parsedNews.length} matching sports news items from ${url}.`);
        } catch (error) {
            console.error(`❌ Error fetching news from ${url}:`, error.message);
        }
    }
    
    // Deduplicate by title
    const seenTitles = new Set();
    const uniqueNews = [];
    for (const item of allNews) {
        if (!seenTitles.has(item.title)) {
            seenTitles.add(item.title);
            uniqueNews.push(item);
        }
    }

    // Re-assign unique IDs
    uniqueNews.forEach((item, i) => item.id = `rss_${i}`);

    console.log(`Total unique matching sports news items: ${uniqueNews.length}`);
    
    const outputPath = getOutputPath('news.json');
    fs.writeFileSync(outputPath, JSON.stringify({ success: true, data: uniqueNews }, null, 2));
    console.log(`✅ Successfully saved to news.json`);
}

async function main() {
    console.log("Starting data update...");
    const schedule = await fetchJson(SCHEDULE_URL, 'schedule.json');
    const standings = await fetchJson(STANDINGS_URL, 'standings.json');
    standings.data = calculateStreaks(standings.data, schedule.data);
    saveJson('schedule.json', schedule);
    saveJson('standings.json', standings);
    await fetchAndSaveNews();
    console.log("Update completed.");
}

main();
