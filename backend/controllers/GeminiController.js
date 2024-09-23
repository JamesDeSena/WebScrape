const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  }
];

const genAI = new GoogleGenerativeAI('AIzaSyB4JsEIVeYkMvE0IeuQC9Y3lCCysXbaqTk');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', safetySettings: safetySettings});

const Translate = async (req, res) => {
  const { content, title, filePath } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ message: "Text is required" });
  }

  if (!title || title.trim() === '') {
    return res.status(400).json({ message: "Title is required" });
  }

  if (!filePath) {
    return res.status(400).json({ error: 'File path is required.' });
  }

  try {
    const contentPrompt = 
      `Translate this English/Tagalog or combined text to Simplified Chinese. Retain all proper nouns and common nouns without translation, and make the sentence readable. Text: "${content}"`;
    
    const titlePrompt = 
      `Translate this English/Tagalog or combined text to Simplified Chinese. Retain all proper nouns and common nouns without translation, and make the sentence readable. Text: "${title}"`;

    const responseContent = await model.generateContent(contentPrompt);
    const translatedContent = responseContent.response.text();

    const responseTitle = await model.generateContent(titlePrompt);
    const translatedTitle = responseTitle.response.text();

    const absolutePath = path.resolve(filePath);

    let fileContent = [];
    if (fs.existsSync(absolutePath)) {
      const rawData = fs.readFileSync(absolutePath, 'utf-8');
      fileContent = JSON.parse(rawData);
    }

    // Update each item with translated content and title
    fileContent.forEach(item => {
      item.translatedContent = translatedContent;
      item.translatedTitle = translatedTitle;
    });

    // Write the updated content back to the file
    fs.writeFileSync(absolutePath, JSON.stringify(fileContent, null, 2), 'utf-8');

    // Return the results in JSON format
    return res.status(200).json({
      translatedContent,
      translatedTitle
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
