const express = require('express');
const router = express.Router();

const { 
  ScrapeWhole,
  GetCacheData
} = require('../controllers/ManilaBulletinScraper');

router.post('/', ScrapeWhole);
router.get('/get', GetCacheData);

module.exports = router;
