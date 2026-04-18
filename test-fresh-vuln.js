const express = require('express');
const app = express();

// VULNERABLE: Hardcoded API key
const OPENAI_API_KEY = 'sk-proj-1234567890abcdefghijklmnopqrstuvwxyz';

async function generateText(prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  return await response.json();
}

app.get('/generate', async (req, res) => {
  const { prompt } = req.query;
  
  try {
    const result = await generateText(prompt);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

module.exports = { generateText };
