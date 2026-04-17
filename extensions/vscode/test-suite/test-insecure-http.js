// Test Case 3: Insecure HTTP
// Expected: MEDIUM severity, CWE-319
// Should detect: Insecure HTTP connection

const axios = require('axios');

// Insecure HTTP connection
fetch('http://api.example.com/sensitive-data')
  .then(response => response.json())
  .then(data => console.log(data));

// Another insecure connection
axios.get('http://payment-gateway.com/process', {
  params: {
    cardNumber: '4111111111111111',
    cvv: '123'
  }
});
