const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const cacheFilePath = path.join(__dirname, "../cache", "mb.json");
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

// Helper function to parse relative time and get the formatted date
function parseRelativeTime(relativeTime) {
  const now = new Date();
  const [value, unit] = relativeTime.split(" ");

  let timeDiff;

  switch (unit) {
    case "minutes":
      timeDiff = parseInt(value) * 60 * 1000; // Convert minutes to milliseconds
      break;
    case "hours":
      timeDiff = parseInt(value) * 60 * 60 * 1000; // Convert hours to milliseconds
      break;
    case "days":
      timeDiff = parseInt(value) * 24 * 60 * 60 * 1000; // Convert days to milliseconds
      break;
    default:
      timeDiff = 0;
  }

  const articleDate = new Date(now.getTime() - timeDiff);

  // Format the date as Month Day, Year
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Intl.DateTimeFormat("en-US", options).format(articleDate);
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

    $(".article-list.mx-auto .row.mb-5 div[data-v-498e1d89].col").each(
      (i, element) => {
        const title = $(element)
          .find("div[data-v-498e1d89] .mb-font-article-title.mt-0.mb-1")
          .text()
          .trim();
        const relativeUrl = $(element)
          .find("div[data-v-498e1d89] .custom-text-link")
          .attr("href");
        const articleUrl = `mb.com.ph${relativeUrl}`;
        const time = $(element)
          .find(
            "div[data-v-498e1d89] .d-flex.align-center.timestamp.mb-font-article-date.pt-0.pb-0"
          )
          .text()
          .trim();

        if (relativeUrl && !relativeUrl.includes("undefined")) {
          const article = {
            title,
            articleUrl,
            time: parseRelativeTime(time),
          };

          articles.push(article);
          addToCache(article);
        }
      }
    );

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
