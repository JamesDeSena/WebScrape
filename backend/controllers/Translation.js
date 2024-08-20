const { translateWithProxy } = require('../utils/Proxy');

const TranslateText = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text to translate is required.' });
  }

  try {
    // Translate the text from English to Mandarin (Simplified Chinese) using proxy
    const translatedText = await translateWithProxy(text);
    res.json({ translation: translatedText });
  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({ error: 'Translation failed.' });
  }
};

module.exports = {
  TranslateText
};
