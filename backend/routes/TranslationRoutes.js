const express = require('express');
const router = express.Router();

const { 
  TranslateText
} = require('../controllers/Translation.js');

router.post('/', TranslateText);

module.exports = router;
