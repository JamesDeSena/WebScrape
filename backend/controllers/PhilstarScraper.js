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

const ScrapeWhole = async (req, res) => {
  const url = "https://www.philstar.com/headlines";

  const cacheFilePath = path.join(__dirname, "../cache/data", "ps.json");

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--single-process",
        "--no-zygote",
        "--disable-gpu",
        "--window-size=1280,800",
        "--disable-software-rasterizer",
      ],
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2", timeout: 300000 });

    try {
      await page.waitForSelector(".news_column.latest .TilesText.spec", { timeout: 300000 });
    } catch (error) {
      await browser.close();
      return res.status(500).json({ error: "Failed to find the selector" });
    }

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    const articles = [];

    $(".news_column.latest .TilesText.spec").each((i, element) => {
      const title = $(element).find(".news_title h2 a").text().trim();
      const articleUrl = $(element).find(".news_title h2 a").attr("href");
      // const author = $(element).find(".dateOfFeature a").text().trim();
      const rawDate = $(element)
        .find(".dateOfFeature")
        .text()
        .trim()
        .split("|")[1]
        ?.trim();
      const formattedDate = convertRelativeDate(rawDate);
      // const summary = $(element).find(".news_summary a").text().trim();

      if (title && articleUrl && !articleUrl.includes("undefined")) {
        const article = {
          title,
          articleUrl,
          // author,
          date: formattedDate,
          // summary,
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
    "../cache/pages/philstar",
    extractFileNameFromUrl(url)
  );

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--single-process",
        "--no-zygote",
        "--disable-gpu",
        "--window-size=1280,800",
        "--disable-software-rasterizer",
      ],
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2", timeout: 300000 });

    try {
      await page.waitForSelector("#sports_article_content .padding", { timeout: 300000 });
    } catch (error) {
      await browser.close();
      return res.status(500).json({ error: "Failed to find the selector" });
    }

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    const element = $("#sports_article_content .padding").first();

    const title = element.find(".article__title h1").first().text().trim();
    const author = element
      .find(".article__credits-author-pub")
      .each((i, el) => {
        $(el).find("#pub-dis").remove();
        $(el)
          .find("a")
          .each((j, anchor) => {
            $(anchor).replaceWith($(anchor).text());
          });
      })
      .map((i, el) => $(el).text())
      .get()
      .join("");
    const dateText = element
      .find(".article__date-published")
      .first()
      .text()
      .trim();

    const formattedDate = dateText.split("|")[0].trim();

    const content = element
      .find("#sports_article_writeup.article__writeup p")
      .each((i, el) => {
        $(el).find("#inserted_instream").remove();
        $(el).find("#inserted_mrec").remove();
        $(el).find("img").remove();
        $(el).find("#article_leaderboard").remove();
        $(el).find(".clear").remove();
        $(el).find(".facebook-philstar-embed").remove();
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
  const cacheFilePath = path.join(__dirname, "../cache/data", "ps.json");

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
    "../cache/pages/philstar",
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
