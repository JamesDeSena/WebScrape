const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const cacheFilePath = path.join(__dirname, "../cache", "mt.json");
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

function formatDate(dateString) {
  const cleanedDate = dateString.replace(/[-\n\r]+/g, " ").trim();

  if (!cleanedDate) {
    return null;
  }

  return cleanedDate;
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

    $(".item-row").each((i, element) => {
      const title = $(element).find(".article-title-h4 a").text().trim();
      const articleUrl = $(element).find(".article-title-h4 a").attr("href");
      const author = $(element).find(".author-name-a a").text().trim();
      const date = formatDate($(element).find(".roboto-a").text().trim());

      if (title && articleUrl && !articleUrl.includes("undefined")) {
        const article = {
          title,
          articleUrl,
          author,
          date,
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
