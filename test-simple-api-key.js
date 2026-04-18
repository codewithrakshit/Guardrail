// Import required dependencies
const express = require('express');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

// Initialize Express app
const app = express();

// Function to retrieve secret from AWS Secrets Manager
async function getOpenAIApiKey() {
  // Initialize Secrets Manager client
  const client = new SecretsManagerClient({ region: 'us-west-2' });
  
  // Retrieve secret value
  const response = await client.send(new GetSecretValueCommand({
    SecretId: 'guardrail/public/9dbce133-d1d1-4a05-887b-645b6dfaf18b/test_simple_api_key_js/1776520710749/hardcoded_secret'
  }));
  
  // Return the retrieved secret
  return response.SecretString;
}

// Function that uses the API key
async function generateText(prompt) {
  // Retrieve API key from Secrets Manager
  const openAIApiKey = await getOpenAIApiKey();
  
  // Use the retrieved API key for authentication
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      // Securely use the retrieved API key
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  // Return the response as JSON
  return await response.json();
}

// Define API endpoint
app.get('/generate', async (req, res) => {
  // Retrieve prompt from query parameters
  const { prompt } = req.query;
  
  try {
    // Generate text using the secure API key
    const result = await generateText(prompt);
    res.json(result);
  } catch (error) {
    // Handle any errors that occur during text generation
    console.error(error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});

// Export the generateText function for external use
module.exports = { generateText };