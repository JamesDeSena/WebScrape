const express = require('express');
const router = express.Router();

const { 
  ScrapeWhole,
  GetCacheData
} = require('../controllers/ManilaTimesScraper');

router.post('/', ScrapeWhole);

module.exports = router;
