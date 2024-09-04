const fs = require('fs');
const path = require('path');
const { translateWithProxy } = require('../utils/Proxy');

const TranslateText = async (req, res) => {
  const { text, filePath } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text to translate is required.' });
  }

  if (!filePath) {
    return res.status(400).json({ error: 'File path is required.' });
  }

  try {
    const translatedText = await translateWithProxy(text);

    const absolutePath = path.resolve(filePath);

    let fileContent = [];
    if (fs.existsSync(absolutePath)) {
      const rawData = fs.readFileSync(absolutePath, 'utf-8');
      fileContent = JSON.parse(rawData);
    }

    fileContent.forEach(item => {
      item.translated = translatedText;
    });

    fs.writeFileSync(absolutePath, JSON.stringify(fileContent, null, 2), 'utf-8');

    res.json({ message: 'Text translated and saved to file', filePath: absolutePath });
  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({ error: 'Translation failed.' });
  }
};

module.exports = {
  TranslateText
};
