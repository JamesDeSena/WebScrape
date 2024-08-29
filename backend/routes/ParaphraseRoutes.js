const express = require('express');
const router = express.Router();

const { 
  ParaphraseText
} = require('../controllers/Paraphrase');

router.post('/', ParaphraseText);

module.exports = router;
