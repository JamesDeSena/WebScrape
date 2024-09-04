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

const ScrapeWhole = async (req, res) => {
  const url = "https://www.bworldonline.com/top-stories/";

  const cacheFilePath = path.join(__dirname, "../cache/data", "bw.json");

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    const articles = [];

    $(".td_block_template_1.widget.widget_recent_entries ul li").each(
      (i, element) => {
        const title = $(element).find("a").first().text().trim();
        const articleUrl = $(element).find("a").first().attr("href");
        const dateTime = $(element).find(".post-date").text().trim();

        const [date] = dateTime.split("|").map((part) => part.trim());

        if (title && articleUrl && !articleUrl.includes("undefined")) {
          const article = {
            title,
            articleUrl,
            date,
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
    "../cache/pages/business-world",
    extractFileNameFromUrl(url)
  );

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    const element = $("article").first();

    const title = element.find(".entry-title").first().text().trim();
    const author = element
      .find(".td-post-content.td-pb-padding-side b")
      .last()
      .text()
      .trim();
    const dateText = element
      .find("time.entry-date.updated.td-module-date")
      .first()
      .attr("datetime");
    const content = element
      .find(".td-post-content.td-pb-padding-side p")
      .each((i, el) => {
        $(el)
          .find(
            ".addtoany_share_save_container.addtoany_content.addtoany_content_top").remove();
        $(el).find(".td-post-featured-image").remove();
        $(el)
          .find(".td-a-rec.td-a-rec-id-content_inline.tdi_2.td_block_template_1")
          .remove();
        $(el).find("#div-gpt-ad-AD2").remove();
        $(el)
          .find(".addtoany_share_save_container.addtoany_content.addtoany_content_bottom")
          .remove();
        $(el)
          .find(".td-a-rec.td-a-rec-id-content_bottom.tdi_3 td_block_template_1")
          .remove();
        $(el).find("em").remove();
        $(el).find("img").remove();
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
      .join("\n")
      .replace(/ADVERTISEMENT/g, "");

    const dateObject = new Date(dateText);
    const date = dateObject.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", // Full month name
      day: "numeric",
      timeZone: "Asia/Manila",
    });

    const article = {
      title,
      author,
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
  const cacheFilePath = path.join(__dirname, "../cache/data", "bw.json");

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
    "../cache/pages/business-world",
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

cron.schedule("0 */6 * * * *", ScrapeWhole);

module.exports = {
  ScrapeWhole,
  ScrapePage,
  GetCacheData,
  GetCacheFile,
};
