const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");

const maxCacheSize = 100;

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

function parseRelativeTime(relativeTime) {
  const now = new Date();
  const [value, unit] = relativeTime.split(" ");

  let timeDiff;

  switch (unit) {
    case "minutes":
      timeDiff = parseInt(value) * 60 * 1000;
      break;
    case "hours":
      timeDiff = parseInt(value) * 60 * 60 * 1000;
      break;
    case "days":
      timeDiff = parseInt(value) * 24 * 60 * 60 * 1000;
      break;
    default:
      timeDiff = 0;
  }

  const articleDate = new Date(now.getTime() - timeDiff);

  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Intl.DateTimeFormat("en-US", options).format(articleDate);
}

const ScrapeWhole = async (req, res) => {
  const url = "https://mb.com.ph/category/news";

  const cacheFilePath = path.join(__dirname, "../cache/data", "mb.json");

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
        const articleUrl = `https://mb.com.ph${relativeUrl}`;
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
            date: parseRelativeTime(time),
          };

          articles.push(article);
          addToCache(article, cacheFilePath);
        }
      }
    );
    
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
    "../cache/pages/manila-bulletin",
    extractFileNameFromUrl(url)
  );

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    const element = $("div[data-v-03318cb8]").first();

    const title = element
      .find("h1.pt-3.mb-font-article-title")
      .first()
      .text()
      .trim();
    const author = element
      .find("span[data-v-03318cb8].pb-0")
      .first()
      .text()
      .trim();
    const dateText = element
      .find("span[data-v-03318cb8].mb-font-article-date")
      .first()
      .text()
      .trim();

    const dateObj = new Date(dateText);
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = dateObj.toLocaleDateString("en-US", options);

    const content = element
      .find(
        "div[data-v-03318cb8].pt-8.custom-article-body.mb-font-article-body p"
      )
      .each((i, el) => {
        $(el).find("div[data-v-03318cb8].pt-3.pb-3").remove();
        $(el).find("img").remove();
        $(el).find("figure").remove();
        $(el).find("ul").each((j, ul) => {
          $(ul).find("a").each((k, anchor) => {
            $(anchor).replaceWith($(anchor).text());
          });
    
          const items = $(ul).find("li");
          let lastItemIndex = items.length - 1;
    
          items.each((k, li) => {
            $(li).find("a").each((l, anchor) => {
              $(anchor).replaceWith($(anchor).text());
            });
    
            let text = $(li).text().trim();
            if (k === lastItemIndex) {
              text += '.';
            } else {
              text += ',';
            }
            $(li).replaceWith(text + ' ');
          });
        });
      })
      .map((i, el) => $(el).text().trim() + ' ')
      .get()
      .join("\n")
      .replace(/ADVERTISEMENT/g, "");

    const article = {
      title,
      author,
      date: formattedDate,
      content,
      url: cacheFilePath
    };

    addToCache(article, cacheFilePath);
    res.json(article);
  } catch (error) {
    console.error("Error during scraping:", error);
    res.status(500).json({ error: "Failed to scrape the page" });
  }
};

const GetCacheData = (req, res) => {
  const cacheFilePath = path.join(__dirname, "../cache/data", "mb.json");

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
    "../cache/pages/manila-bulletin",
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

cron.schedule("0 */9 * * * *", ScrapeWhole);

module.exports = {
  ScrapeWhole,
  ScrapePage,
  GetCacheData,
  GetCacheFile,
};
