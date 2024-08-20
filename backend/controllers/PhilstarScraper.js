const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const cacheFilePath = path.join(__dirname, "../cache", "ps.json");
const maxCacheSize = 30;

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

const ScrapeWhole = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    const articles = [];

    $(".news_column.latest .TilesText.spec").each((i, element) => {
      const title = $(element).find(".news_title h2 a").text().trim();
      const articleUrl = $(element).find(".news_title h2 a").attr("href");
      const author = $(element).find(".dateOfFeature a").text().trim();
      const rawDate = $(element).find(".dateOfFeature").text().trim().split("|")[1]?.trim();
      const formattedDate = convertRelativeDate(rawDate);
      const summary = $(element).find(".news_summary a").text().trim();

      if (title && articleUrl && !articleUrl.includes("undefined")) {
        const article = {
          title,
          articleUrl,
          author,
          date: formattedDate,
          summary,
        };

        articles.push(article);
        addToCache(article);
      }
    });

    res.json(articles);
  } catch (error) {
    console.error("Error scraping the website:", error);
    res.status(500).json({ error: "Failed to scrape the website" });
  }
};

const convertRelativeDate = (rawDate) => {
  if (!rawDate) return rawDate;

  const now = new Date();

  const hoursMatch = rawDate.match(/(\d+)\s+hours?\s+ago/);
  const daysMatch = rawDate.match(/(\d+)\s+days?\s+ago/);

  if (hoursMatch) {
    const hoursAgo = parseInt(hoursMatch[1], 10);
    const pastDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    return formatDate(pastDate);
  }

  if (daysMatch) {
    const daysAgo = parseInt(daysMatch[1], 10);
    const pastDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return formatDate(pastDate);
  }

  return rawDate;
};

const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const GetCacheData = (req, res) => {
  try {
    const cache = loadCache();
    res.json(cache);
  } catch (error) {
    console.error("Error loading cached data:", error);
    res.status(500).json({ error: "Failed to load cached data" });
  }
};

module.exports = {
  ScrapeWhole,
  GetCacheData,
};
