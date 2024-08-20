const express = require('express');
const router = express.Router();

const { 
  ScrapeWhole,
  GetCacheData
} = require('../controllers/RapplerScraper.js');

router.post('/', ScrapeWhole);
router.get('/get', GetCacheData);

module.exports = router;
