const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const cacheFilePath = path.join(__dirname, "../cache", "abscbn.json");
const maxCacheSize = 15;

function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadCache() {
  if (fs.existsSync(cacheFilePath)) {
    return JSON.parse(fs.readFileSync(cacheFilePath, "utf8"));
  }
  return [];
}

function saveCache(cache) {
  ensureDirectoryExists(cacheFilePath);
  fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2), "utf8");
}

function addToCache(newData) {
  let cache = loadCache();
  const isDuplicate = cache.some(
    (article) =>
      article.title === newData.title &&
      article.articleUrl === newData.articleUrl
  );

  if (!isDuplicate) {
    cache.push(newData);
    if (cache.length > maxCacheSize) {
      cache.shift();
    }
    saveCache(cache);
  }
}

function convertTimeAgoToDate(timeAgo) {
  const now = new Date();

  if (timeAgo.includes("minute")) {
    const minutes = parseInt(timeAgo.split(' ')[0]);
    const date = new Date(now.getTime() - minutes * 60000);
    return formatDate(date);
  }

  if (timeAgo.includes("hour")) {
    const hours = parseInt(timeAgo.split(' ')[0]);
    const date = new Date(now.getTime() - hours * 3600000);
    return formatDate(date);
  }

  if (timeAgo.includes("day")) {
    const days = parseInt(timeAgo.split(' ')[0]);
    const date = new Date(now.getTime() - days * 86400000);
    return formatDate(date);
  }

  return formatDate(now); 
}

function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const ScrapeWhole = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--window-size=1280,800',
        '--disable-software-rasterizer'
      ],
    });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1280, height: 800 });

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    await wait(3000);

    try {
      await page.waitForSelector('.MuiBox-root.css-0', { timeout: 30000 });
    } catch (error) {
      await browser.close();
      return res.status(500).json({ error: "Failed to find the selector" });
    }

    const html = await page.content();

    const $ = cheerio.load(html);
    const articles = [];

    $(".MuiBox-root.css-0").each((i, element) => {
      const title = $(element)
        .find("h5.MuiTypography-root")
        .first()
        .text()
        .trim();
      const articleUrl = $(element)
        .find("a.MuiTypography-root")
        .attr("href");
      const timeAgo = $(element)
        .find(".MuiTypography-root.MuiTypography-h6")
        .text()
        .trim();

      if (title && articleUrl && timeAgo) {
        const formattedDate = convertTimeAgoToDate(timeAgo);

        const article = {
          title,
          articleUrl: `https://news.abs-cbn.com/news${articleUrl}`,
          date: formattedDate,
        };

        articles.push(article);
        addToCache(article);
      }
    });

    res.json(articles);
    await browser.close();
  } catch (error) {
    res.status(500).json({ error: "Failed to scrape the website" });
  }
};

const GetCacheData = (req, res) => {
  try {
    const cache = loadCache();
    res.json(cache);
  } catch (error) {
    res.status(500).json({ error: "Failed to load cached data" });
  }
};

module.exports = {
  ScrapeWhole,
  GetCacheData,
};
