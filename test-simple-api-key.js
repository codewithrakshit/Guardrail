// Simple API Key Test - Single Vulnerability

const express = require('express');
const app = express();

// Hardcoded API key - CRITICAL SECURITY ISSUE
const OPENAI_API_KEY = 'sk-proj-abcdef1234567890ABCDEF1234567890abcdef1234567890';

// Function that uses the API key
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
    const result = await generateText(prompt);
    res.json(result);
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

module.exports = { generateText };
