const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const cacheFilePath = path.join(__dirname, "../cache", "gma.json");
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

function convertTimeToDate(timeString) {
  const currentDate = new Date();
  const [time, period] = timeString.split(" ");
  const [hours, minutes] = time.split(":").map(Number);

  let adjustedHours = hours;

  if (period === "PM" && hours !== 12) {
    adjustedHours += 12;
  } else if (period === "AM" && hours === 12) {
    adjustedHours = 0;
  }

  currentDate.setHours(adjustedHours, minutes, 0, 0);

  const options = { year: "numeric", month: "long", day: "numeric" };
  return currentDate.toLocaleDateString(undefined, options);
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

    $(".just-in-content a").each((i, element) => {
      const title = $(element).find("h3.just-in-story-title").text().trim();
      const articleUrl = $(element).attr("href");
      const time = $(element).find("p.just-in-date-published").text().trim();

      if (title && articleUrl && time) {
        const date = convertTimeToDate(time);

        const article = {
          title,
          articleUrl,
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
