const express = require('express');
const router = express.Router();

const { 
  ScrapeWhole,
  GetCacheData
} = require('../controllers/PhilstarScraper.js');

router.post('/', ScrapeWhole);

module.exports = router;
