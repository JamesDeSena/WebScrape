const express = require('express');
const router = express.Router();

const { 
  ParaphraseText,
  GetFile
} = require('../controllers/Paraphrase');

router.post('/', ParaphraseText);
router.post('/get', GetFile);

module.exports = router;
