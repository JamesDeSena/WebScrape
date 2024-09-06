const express = require('express');
const router = express.Router();

const { 
  Translate,
  GetFile
} = require('../controllers/GeminiController');

router.post('/translate', Translate);
router.post('/get', GetFile);

module.exports = router;
