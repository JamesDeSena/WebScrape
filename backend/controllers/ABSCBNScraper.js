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

function convertTimeAgoToDate(timeAgo) {
  const now = new Date();

  if (timeAgo.includes("minute")) {
    const minutes = parseInt(timeAgo.split(" ")[0]);
    const date = new Date(now.getTime() - minutes * 60000);
    return formatDate(date);
  }

  if (timeAgo.includes("hour")) {
    const hours = parseInt(timeAgo.split(" ")[0]);
    const date = new Date(now.getTime() - hours * 3600000);
    return formatDate(date);
  }

  if (timeAgo.includes("day")) {
    const days = parseInt(timeAgo.split(" ")[0]);
    const date = new Date(now.getTime() - days * 86400000);
    return formatDate(date);
  }

  return formatDate(now);
}

function formatDate(date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ScrapeWhole = async (req, res) => {
  const url = "https://news.abs-cbn.com/news";

  const cacheFilePath = path.join(__dirname, "../cache/data", "abscbn.json");

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--window-size=1280,800",
        "--disable-software-rasterizer",
      ],
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await wait(3000);

    try {
      await page.waitForSelector(".MuiBox-root.css-0", { timeout: 30000 });
    } catch (error) {
      await browser.close();
      return res.status(500).json({ error: "Failed to find the selector" });
    }

    const html = await page.content();
    const $ = cheerio.load(html);
    const articles = [];

    $(".MuiBox-root.css-0").each((i, element) => {
      const title = $(element)
        .find("h5.MuiTypography-root")
        .first()
        .text()
        .trim();
      const articleUrl = $(element).find("a.MuiTypography-root").attr("href");
      const timeAgo = $(element)
        .find(".MuiTypography-root.MuiTypography-h6")
        .text()
        .trim();

      if (title && articleUrl && timeAgo) {
        const formattedDate = convertTimeAgoToDate(timeAgo);
        const article = {
          title,
          articleUrl: `https://news.abs-cbn.com${articleUrl}`,
          date: formattedDate,
        };

        articles.push(article);
        addToCache(article, cacheFilePath);
      }
    });

    await browser.close();
  } catch (error) {
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
    "../cache/pages/abs-cbn",
    extractFileNameFromUrl(url)
  );

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--window-size=1280,800",
        "--disable-software-rasterizer",
      ],
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    try {
      await page.waitForSelector(
        "#bodyTopPart, #bodyMiddlePart, #bodyBottomPart",
        { timeout: 30000 }
      );
    } catch (error) {
      await browser.close();
      return res.status(500).json({ error: "Failed to find the selectors" });
    }

    const html = await page.content();
    const $ = cheerio.load(html);

    const element = $(
      ".MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.MuiGrid-grid-md-9.css-1xd5sck #row0-col0"
    ).first();

    const title = element
      .find("h2.MuiTypography-root.MuiTypography-h2.css-15rcv26")
      .first()
      .text()
      .trim();
    const author = element
      .find(
        ".MuiTypography-root.MuiTypography-h5.MuiTypography-gutterBottom.css-vldcmf"
      )
      .first()
      .text()
      .trim();
    const dateStr = element
      .find('span[itemprop="datePublished"]')
      .attr("content");

    const replaceBrWithSpace = (text) => {
      return text.replace(/(\s*<br\s*\/?>\s*)+/gi, " ");
    };

    const processUlElements = (el) => {
      $(el)
        .find("ul")
        .each((j, ul) => {
          $(ul)
            .find("a")
            .each((k, anchor) => {
              $(anchor).replaceWith($(anchor).text());
            });

          const items = $(ul).find("li");
          let lastItemIndex = items.length - 1;

          items.each((k, li) => {
            $(li)
              .find("a")
              .each((l, anchor) => {
                $(anchor).replaceWith($(anchor).text());
              });

            let text = $(li).text().trim();
            if (k === lastItemIndex) {
              text += ".";
            } else {
              text += ",";
            }
            $(li).replaceWith(text + " ");
          });
        });
    };

    const bodyTopPartHtml = replaceBrWithSpace(
      element
        .find(
          '.imp-article-0 #bodyTopPart span[style*="color:#000000;background-color:transparent;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"]'
        )
        .each((i, el) => {
          processUlElements(el);
          $(el).find("#isPasted").remove();
          $(el).find("em").remove();
          $(el).find("span.fr-img-caption.fr-fic.fr-dib").remove();
          $(el).find("a").remove();
        })
        .map((i, el) => $(el).html())
        .get()
        .join("\n")
    );

    const bodyMiddlePartHtml = replaceBrWithSpace(
      element
        .find(
          '.imp-article-0 #bodyMiddlePart span[style*="color:#000000;background-color:transparent;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"]'
        )
        .each((i, el) => {
          processUlElements(el);
          $(el).find("#isPasted").remove();
          $(el).find("em").remove();
          $(el).find("span.fr-img-caption.fr-fic.fr-dib").remove();
          $(el).find("a").remove();
        })
        .map((i, el) => $(el).html())
        .get()
        .join("\n")
    );

    const bodyBottomPartHtml = replaceBrWithSpace(
      element
        .find(
          '.imp-article-0 #bodyBottomPart span[style*="color:#000000;background-color:transparent;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"]'
        )
        .each((i, el) => {
          processUlElements(el);
          $(el).find("#isPasted").remove();
          $(el).find("em").remove();
          $(el).find("span.fr-img-caption.fr-fic.fr-dib").remove();
          $(el).find("a").remove();
          $(el)
            .find("strong")
            .filter(function () {
              return $(this).text().startsWith("RELATED");
            })
            .last()
            .remove();
          $(el)
            .find(".fr-video.fr-deletable.fr-fvc.fr-dvb.fr-draggable")
            .remove();
        })
        .map((i, el) => $(el).html())
        .get()
        .join("\n")
    );

    const bodyTopPartFallbackHtml = replaceBrWithSpace(
      element
        .find(".imp-article-0 #bodyTopPart p")
        .each((i, el) => {
          processUlElements(el);
          $(el).find("#isPasted").remove();
          $(el).find("em").remove();
          $(el).find("span.fr-img-caption.fr-fic.fr-dib").remove();
          $(el).find("a").remove();
        })
        .map((i, el) => $(el).html())
        .get()
        .join("\n")
    );

    const bodyMiddlePartFallbackHtml = replaceBrWithSpace(
      element
        .find(".imp-article-0 #bodyMiddlePart p")
        .each((i, el) => {
          processUlElements(el);
          $(el).find("#isPasted").remove();
          $(el).find("em").remove();
          $(el).find("span.fr-img-caption.fr-fic.fr-dib").remove();
          $(el).find("a").remove();
        })
        .map((i, el) => $(el).html())
        .get()
        .join("\n")
    );

    const bodyBottomPartFallbackHtml = replaceBrWithSpace(
      element
        .find(".imp-article-0 #bodyBottomPart p")
        .each((i, el) => {
          processUlElements(el);
          $(el).find("#isPasted").remove();
          $(el).find("em").remove();
          $(el).find("span.fr-img-caption.fr-fic.fr-dib").remove();
          $(el).find("a").remove();
          $(el)
            .find("strong")
            .filter(function () {
              return $(this).text().startsWith("RELATED");
            })
            .last()
            .remove();
          $(el)
            .find(".fr-video.fr-deletable.fr-fvc.fr-dvb.fr-draggable")
            .remove();
        })
        .map((i, el) => $(el).html())
        .get()
        .join("\n")
    );

    const bodyTopPart = bodyTopPartHtml || bodyTopPartFallbackHtml;
    const bodyMiddlePart = bodyMiddlePartHtml || bodyMiddlePartFallbackHtml;
    const bodyBottomPart = bodyBottomPartHtml || bodyBottomPartFallbackHtml;

    const content = `${bodyTopPart}\n\n${bodyMiddlePart}\n\n${bodyBottomPart}`;

    if (!dateStr) {
      console.warn("Date string is missing or invalid");
    }

    const date = new Date(dateStr);
    const dateFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Manila",
    };
    const formattedDate = new Intl.DateTimeFormat(
      "en-US",
      dateFormatOptions
    ).format(date);

    const article = {
      title,
      author,
      date: formattedDate,
      content: content,
    };

    addToCache(article, cacheFilePath);

    res.json(article);

    await browser.close();
  } catch (error) {
    console.error("Error during scraping:", error);
    res.status(500).json({ error: "Failed to scrape the page" });
  }
};

const GetCacheData = (req, res) => {
  const cacheFilePath = path.join(__dirname, "../cache/data", "abscbn.json");

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
    "../cache/pages/abs-cbn",
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

cron.schedule("0 */5 * * * *", ScrapeWhole);

module.exports = {
  ScrapeWhole,
  ScrapePage,
  GetCacheData,
  GetCacheFile,
};
