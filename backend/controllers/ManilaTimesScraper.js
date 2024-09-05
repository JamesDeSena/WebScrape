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

function formatDate(dateString) {
  const cleanedDate = dateString.replace(/[-\n\r]+/g, " ").trim();

  if (!cleanedDate) {
    return null;
  }

  return cleanedDate;
}

const ScrapeWhole = async (req, res) => {
  const url = "https://www.manilatimes.net/news";

  const cacheFilePath = path.join(__dirname, "../cache/data", "mt.json");

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    const articles = [];

    $(".item-row.item-row-2.flex-row").each((i, element) => {
      const title = $(element).find(".article-title-h4 a").text().trim();
      const articleUrl = $(element).find(".article-title-h4 a").attr("href");
      // const author = $(element).find(".author-name-a a").text().trim();
      const date = formatDate($(element).find(".roboto-a").text().trim());

      if (title && articleUrl && !articleUrl.includes("undefined")) {
        const article = {
          title,
          articleUrl,
          // author,
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
    "../cache/pages/manila-times",
    extractFileNameFromUrl(url)
  );

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    const element = $("section.article-page").first();

    const title = element
      .find("h1.article-title.font-700.roboto-slab-3.tdb-title-text")
      .first()
      .text()
      .trim();
    const author = element
      .find(".author-info")
      .each((i, el) => {
        $(el)
          .find("a")
          .each((j, anchor) => {
            $(anchor).replaceWith($(anchor).text());
          });
      })
      .map((i, el) => $(el).text().trim())
      .get()
      .join("");
    const dateText = element
      .find(".article-publish-time.roboto-a")
      .first()
      .text()
      .trim();
    const content = element
      .find(".article-body-content p")
      .each((i, el) => {
        $(el).find(".article-body-ad").remove();
        $(el).find("img").remove();
        $(el).find(".article_top_image_widget").remove();
        $(el).find(".article-image-caption.roboto-a").remove();
        $(el)
          .find(".widget-container.article-embedded-newsletter-form.manila-newsletter-theme.flex-row pos-relative")
          .remove();
        $(el).find(".article-ad-one.article-ad").remove();
        $(el).find(".fixed-gray-color").remove();
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
      .map((i, el) => $(el).text().trim() + " ")
      .get()
      .join("\n");

    const cleanedAuthor = author.startsWith("By")
      ? author.slice(3).trim()
      : author;

    const article = {
      title,
      author: cleanedAuthor,
      date: dateText,
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
  const cacheFilePath = path.join(__dirname, "../cache/data", "mt.json");

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
    "../cache/pages/manila-times",
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

cron.schedule("0 */12 * * * *", ScrapeWhole);

module.exports = {
  ScrapeWhole,
  ScrapePage,
  GetCacheData,
  GetCacheFile,
};
