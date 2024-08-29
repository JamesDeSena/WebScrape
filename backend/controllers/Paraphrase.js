const fetch = require('node-fetch');

const accessToken = 'rr2mlAjTfyYx10CSu0ctJYZFiQmCXrZ8';
const apiUrl = 'https://api.ai21.com/studio/v1/paraphrase';
const maxLength = 500;

async function paraphraseText(text) {
  let paraphrasedText = '';

  const splitTextIntoSentences = (text) => {
    return text.match(/[^.!?]+[.!?]/g) || [text];
  };

  const sentences = splitTextIntoSentences(text);

  let batch = '';
  for (const sentence of sentences) {
    if ((batch.length + sentence.length) > maxLength) {
      if (batch.length > 0) {
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              text: batch.trim(),
              style: 'formal'
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          if (data.suggestions && data.suggestions.length > 0) {
            paraphrasedText += data.suggestions[0].text + ' ';
          } else {
            paraphrasedText += batch + ' ';
          }
        } catch (error) {
          console.error('Error paraphrasing text:', error);
          paraphrasedText += batch + ' ';
        }
      }
      batch = sentence;
    } else {
      batch += sentence;
    }
  }

  if (batch.length > 0) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: batch.trim(),
          style: 'formal'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.suggestions && data.suggestions.length > 0) {
        paraphrasedText += data.suggestions[0].text + ' ';
      } else {
        paraphrasedText += batch + ' ';
      }
    } catch (error) {
      console.error('Error paraphrasing text:', error);
      paraphrasedText += batch + ' ';
    }
  }

  return paraphrasedText.trim();
}

const ParaphraseText = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const paraphrasedText = await paraphraseText(text);
    res.json({ original: text, paraphrased: paraphrasedText });
  } catch (error) {
    console.error('Error paraphrasing the text:', error);
    res.status(500).json({ error: 'Failed to paraphrase the text' });
  }
};

module.exports = {
  ParaphraseText
};