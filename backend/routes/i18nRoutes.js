const express = require('express');
const router = express.Router();
const { 
  TranslateText 
} = require('../controllers/i18nController');

router.post('/translate', TranslateText);

module.exports = router;
