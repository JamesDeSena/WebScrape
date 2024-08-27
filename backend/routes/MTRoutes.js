const express = require('express');
const router = express.Router();

const { 
  ScrapeWhole,
  ScrapePage,
  GetCacheData,
  GetCacheFile
} = require('../controllers/ManilaTimesScraper');

router.post('/', ScrapeWhole);
router.post('/page', ScrapePage);
router.get('/get-data', GetCacheData);
router.get('/get-page', GetCacheFile);

module.exports = router;
