const express = require('express');
const router = express.Router();

const { 
  ScrapeWhole,
  GetCacheData
} = require('../controllers/RapplerScraper.js');

router.post('/', ScrapeWhole);

module.exports = router;
