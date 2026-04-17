// Test Case 4: Safe Code
// Expected: No vulnerabilities detected
// Should return: status "safe"

const express = require('express');
const app = express();

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.get('/time', (req, res) => {
  res.json({ timestamp: new Date().toISOString() });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
