const express = require('express');
const router = express.Router();

const { 
  ScrapeWhole,
  ScrapePage,
  GetCacheData,
  GetCacheFile
} = require('../controllers/PhilstarScraper.js');

router.post('/', ScrapeWhole);
router.post('/page', ScrapePage);
router.get('/get-data', GetCacheData);
router.post('/get-page', GetCacheFile);

module.exports = router;
