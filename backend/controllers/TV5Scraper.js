const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

// Define file paths and cache size
const cacheFilePath = path.join(__dirname, "../cache", "tv5.json");
const maxCacheSize = 30;

// Ensure the cache directory exists
function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Load cached data
function loadCache() {
  if (fs.existsSync(cacheFilePath)) {
    return JSON.parse(fs.readFileSync(cacheFilePath, "utf8"));
  }
  return [];
}

// Save data to cache
function saveCache(cache) {
  ensureDirectoryExists(cacheFilePath);
  fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2), "utf8");
}

// Add new data to cache
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

// Utility function to wait for a specific duration
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Main scraping function
const ScrapeWhole = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--window-size=1280,800',
        '--disable-software-rasterizer'
      ],
    });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    await wait(3000);

    try {
      // Wait for the dynamic content
      await page.waitForFunction(() => document.querySelector('.item') !== null, { timeout: 60000 });

      // Extract the HTML content
      const html = await page.content();
      const $ = cheerio.load(html);

      // Log the HTML content for debugging
      console.log("HTML Content:", html);

      // Extract data using page.evaluate
      const articles = await page.evaluate(() => {
        const data = [];
        document.querySelectorAll('.content').forEach(element => {
          const title = element.querySelector('title')?.textContent.trim();
          // const articleUrl = element.querySelector('a')?.href;
          // const date = element.querySelector('.date')?.textContent.trim();
          if (title && articleUrl && date) {
            data.push({ 
              title, 
              // articleUrl, 
              // date 
            });
          }
        });
        return data;
      });

      // Log the extracted data for debugging
      console.log("Extracted Articles:", articles);

      articles.forEach(article => addToCache(article));

      await browser.close();

      res.json(articles);
    } catch (error) {
      console.error("Error finding the selector:", error);
      const html = await page.content();
      console.log("HTML Content on Error:", html); // Log HTML content for debugging
      await browser.close();
      res.status(500).json({ error: "Failed to find the selector" });
    }
  } catch (error) {
    console.error("Error scraping the website:", error);
    res.status(500).json({ error: "Failed to scrape the website" });
  }
};

// Function to get cached data
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
