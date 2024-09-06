const express = require('express');
const router = express.Router();

const { 
  TranslateText,
  GetFile
} = require('../controllers/Translation.js');

router.post('/', TranslateText);
router.post('/get', GetFile);

module.exports = router;
