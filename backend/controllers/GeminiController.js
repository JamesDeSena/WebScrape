const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI('AIzaSyB4JsEIVeYkMvE0IeuQC9Y3lCCysXbaqTk');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const Translate = async (req, res) => {
  const { text, filePath } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ message: "Text is required" });
  }

  if (!filePath) {
    return res.status(400).json({ error: 'File path is required.' });
  }

  try {
    const prompt = 
      `Translate this English/Tagalog or combined text to Simplified Chinese. Retain all proper nouns and common nouns without translation, and make the sentence readable. Text: "${text}"`;

    const response1 = await model.generateContent(prompt);
    const translatedText = response1.response.text();

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

    return res.status(200).json({
      result: response1.response.text()
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ message: "Error:", error: error.message });
  }
};

const GetFile = (req, res) => {
  const { filePath } = req.body;

  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  const absolutePath = path.resolve(filePath);

  fs.readFile(absolutePath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read the file' });
    }

    try {
      const jsonContent = JSON.parse(data);
      res.json(jsonContent);
    } catch (parseError) {
      res.status(500).json({ error: 'Failed to parse JSON' });
    }
  });
};

module.exports = { 
  Translate,
  GetFile
};
