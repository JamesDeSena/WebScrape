const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

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

const ScrapeWhole = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const cacheFilePath = path.join(__dirname, "../cache/data", "inq.json");

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    const articles = [];

    $("#inq-channel-left #ch-ls-box").each((i, element) => {
      const title = $(element).find("#ch-ls-head h2 a").first().text().trim();
      const articleUrl = $(element).find("a").first().attr("href");
      const date = $(element).find("#ch-postdate span").first().text().trim();

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

    res.json(articles);
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
    "../cache/pages/inquirer",
    extractFileNameFromUrl(url)
  );

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    const element = $("article#article_level_wrap").first();

    const title = element
      .find("#art-head-group h1.entry-title")
      .first()
      .text()
      .trim();

    const author = element
      .find("#byline_share #art_author a")
      .first()
      .text()
      .trim()
      .replace(/@\s*$/, "");

    const dateText = element
      .find("#art_plat")
      .first()
      .text()
      .trim();

    const clean = author.replace(/\s*@.*$/, "");

    const dateParts = dateText.split(' / ').pop();
    const dateMatch = dateParts.match(/([A-Za-z]+ \d{2}, \d{4})/);
    const formattedDate = dateMatch ? dateMatch[0] : "";

    const content = element
      .find("#article_content.article_align p")
      .filter((i, el) => {
        const $el = $(el);
        const html = $el.text().trim();

        const startsWithRead  = html.startsWith('READ:');

        const hasExcludedClass = 
          $el.hasClass("wp-caption aligncenter") ||
          $el.hasClass("wp-caption-text") ||
          $el.hasClass("modal-body nofbia") ||
          $el.hasClass("view-comments");

        const hasExcludedId = 
          $el.attr("id") === "billboard_article" ||
          $el.attr("id") === "teads_divtag2" ||
          $el.attr("id") === "nl_article_content" ||
          $el.attr("id") === "rn-2023" ||
          $el.attr("id") === "lsmr-latest" ||
          $el.attr("id") === "lsmr-mostread";

        return !(startsWithRead || hasExcludedClass || hasExcludedId);
      })
      .map((i, el) => $(el).text())
      .get()
      .join("\n");

    const article = {
      title,
      author: clean,
      date: formattedDate,
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
  const cacheFilePath = path.join(__dirname, "../cache/data", "inq.json");

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
    "../cache/pages/inquirer",
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

module.exports = {
  ScrapeWhole,
  ScrapePage,
  GetCacheData,
  GetCacheFile,
};