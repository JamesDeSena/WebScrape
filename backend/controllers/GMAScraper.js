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
  const url = "https://www.gmanetwork.com/news/";

  const cacheFilePath = path.join(__dirname, "../cache/data", "gma.json");

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
    "../cache/pages/gma",
    extractFileNameFromUrl(url)
  );

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    const element = $(".upper_article").first();

    const title = element.find("h1.story_links").first().text().trim();
    const author = element
      .find(".main-byline")
      .each((i, el) => {
        $(el).find(".author-social-buttons").remove();
      })
      .first()
      .text()
      .trim();
    const dateText = element
      .find("time[itemprop='datePublished']")
      .first()
      .text()
      .trim();
    const content = element
      .find(".story_main")
      .each((i, el) => {
        $(el).find(".ad.offset-computed").remove();
        $(el).find("#mrect_related_content_holder").remove();
        $(el).find("#outstream-ad").remove();
        $(el).find("img").remove();
        $(el).find("p").each((j, p) => {
          $(p).find("a").each((k, anchor) => {
            $(anchor).replaceWith($(anchor).text());
          });
          $(p).replaceWith($(p).text().trim() + ' ');
        });
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
      .map((i, el) => $(el).text().trim())
      .get()
      .join("\n");
    
 
    const date = dateText
      .replace(/Published\s+/, "")
      .replace(/\d{1,2}:\d{2}(am|pm)/i, "")
      .trim();
    const cleanedAuthor = author.startsWith("By")
      ? author.slice(3).trim()
      : author;

    const article = {
      title,
      author: cleanedAuthor,
      date,
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
  const cacheFilePath = path.join(__dirname, "../cache/data", "gma.json");

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
    "../cache/pages/gma",
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

cron.schedule("0 */7 * * * *", ScrapeWhole);

module.exports = {
  ScrapeWhole,
  ScrapePage,
  GetCacheData,
  GetCacheFile,
};
