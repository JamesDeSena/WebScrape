const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");

const maxCacheSize = 50;

function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadCache(cacheFilePath) {
  if (fs.existsSync(cacheFilePath)) {
    try {
      return JSON.parse(fs.readFileSync(cacheFilePath, "utf8"));
    } catch (error) {
      console.error("Failed to parse cache file:", error);
      return [];
    }
  }
  return [];
}

function saveCache(cache, cacheFilePath) {
  ensureDirectoryExists(cacheFilePath);
  try {
    fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to save cache file:", error);
  }
}

function addToCache(newData, cacheFilePath) {
  let cache = loadCache(cacheFilePath);

  const isDuplicate = cache.some(
    (article) =>
      article.title === newData.title &&
      article.articleUrl === newData.articleUrl
  );

  if (!isDuplicate) {
    cache.unshift(newData);
    if (cache.length > maxCacheSize) {
      cache.pop();
    }
    saveCache(cache, cacheFilePath);
  }
}

function extractFileNameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/^-|-$/g, "");
    return `${fileName}.json`;
  } catch (error) {
    return "default.json";
  }
}

function formatDate(relativeTimeString) {
  const now = new Date();
  const match = relativeTimeString.match(/(\d+)\s*(min|hour|day)s?\s*ago/);

  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "min":
        now.setMinutes(now.getMinutes() - value);
        break;
      case "hour":
        now.setHours(now.getHours() - value);
        break;
      case "day":
        now.setDate(now.getDate() - value);
        break;
      default:
        return null;
    }
  }

  return now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const ScrapeWhole = async (req, res) => {
  const url = "https://www.rappler.com/latest/";

  const cacheFilePath = path.join(__dirname, "../cache/data", "rp.json");

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    const articles = [];

    $(".archive-article__content").each((i, element) => {
      const title = $(element).find("h2 a").text().trim();
      const articleUrl = $(element).find("h2 a").attr("href");
      const relativeDate = $(element)
        .find(".archive-article__timeago")
        .text()
        .trim();
      const date = formatDate(relativeDate);

      if (title && articleUrl && !articleUrl.includes("undefined")) {
        const article = {
          title,
          articleUrl,
          date,
        };

        articles.push(article);
        addToCache(article, cacheFilePath);
      }
    });
  } catch (error) {
    console.error("Error scraping the website:", error);
    res.status(500).json({ error: "Failed to scrape the website" });
  }
};

const ScrapePage = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const cacheFilePath = path.join(
    __dirname,
    "../cache/pages/rappler",
    extractFileNameFromUrl(url)
  );

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    const element = $("#primary.site-main").first();

    const title = element
      .find(".post-single__header h1.post-single__title")
      .first()
      .text()
      .trim();

    const author = element
      .find(".post-single__header .post-single__authors")
      .each((i, el) => {
        $(el)
          .find("a")
          .each((j, anchor) => {
            $(anchor).replaceWith($(anchor).text());
          });
      })
      .map((i, el) => $(el).text())
      .get()
      .join(", ")
      .trim();

    const dateText = element
      .find("time.entry-date.published.post__timeago")
      .first()
      .attr("datetime");

    const dateObject = new Date(dateText);
    const date = dateObject.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", // Full month name
      day: "numeric",
      timeZone: "Asia/Manila",
    });

    const content = element
      .find(".post-single__content.entry-content")
      .each((i, el) => {
        $(el).find(".rappler-ad-container").remove();
        $(el).find(".related-article ").remove();
        $(el).find("#cx_inline").remove();
        $(el).find("em").last().remove();
        $(el)
          .find(".has-drop-cap")
          .each((j, p) => {
            $(p).replaceWith($(p).text());
          });
        $(el)
          .find(".wp-block-heading")
          .each((j, p) => {
            $(p).replaceWith($(p).text());
          });
        $(el)
          .find("a")
          .each((j, anchor) => {
            $(anchor).replaceWith($(anchor).text());
          });
      })
      .map((i, el) => $(el).text())
      .get()
      .map((text) => text.trim())
      .join("");

    const article = {
      title,
      author,
      date,
      content,
    };

    addToCache(article, cacheFilePath);
    res.json(article);
  } catch (error) {
    console.error("Error during scraping:", error);
    res.status(500).json({ error: "Failed to scrape the page" });
  }
};

const GetCacheData = (req, res) => {
  const cacheFilePath = path.join(__dirname, "../cache/data", "rp.json");

  try {
    const cache = loadCache(cacheFilePath);
    res.json(cache);
  } catch (error) {
    res.status(500).json({ error: "Failed to load cached data" });
  }
};

const GetCacheFile = (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const filePath = path.join(
    __dirname,
    "../cache/pages/rappler",
    extractFileNameFromUrl(url)
  );

  if (fs.existsSync(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath, "utf8");
      res.send(fileContent);
    } catch (error) {
      res.status(500).json({ error: "Failed to read the cached file" });
    }
  } else {
    res.status(404).json({ error: "Cached file not found" });
  }
};

cron.schedule("0 */11 * * * *", ScrapeWhole);

module.exports = {
  ScrapeWhole,
  ScrapePage,
  GetCacheData,
  GetCacheFile,
};
