const express = require('express');
const router = express.Router();

const { 
  ScrapeWhole,
  ScrapePage,
  GetCacheData,
  GetCacheFile
} = require('../controllers/ABSCBNScraper');

router.post('/', ScrapeWhole);
router.post('/page', ScrapePage);
router.get('/get-data', GetCacheData);
router.get('/get-page', GetCacheFile);

module.exports = router;
