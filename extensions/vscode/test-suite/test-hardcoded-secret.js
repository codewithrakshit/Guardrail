// Test Case 1: Hardcoded API Key
// Expected: CRITICAL severity, CWE-798
// Should detect: Hardcoded secret

const apiKey = 'sk-1234567890abcdef';
const apiSecret = 'secret_key_abc123';

fetch('https://api.example.com/data', {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'X-API-Secret': apiSecret
  }
});
