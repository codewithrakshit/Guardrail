/**
 * DEMO FILE - Contains intentional vulnerabilities
 * Save this file to trigger GuardRail AI remediation
 */

// VULNERABILITY 1: Hardcoded Database Password
const dbConfig = {
  host: 'localhost',
  user: 'admin',
  password: 'SuperSecret123!',
  database: 'production'
};

// VULNERABILITY 2: SQL Injection
function getUserByEmail(email) {
  const query = "SELECT * FROM users WHERE email = '" + email + "'";
  return database.execute(query);
}

// VULNERABILITY 3: Hardcoded API Key
const STRIPE_API_KEY = 'sk_live_51234567890abcdefghijklmnop';

function processPayment(amount) {
  const stripe = require('stripe')(STRIPE_API_KEY);
  return stripe.charges.create({ amount, currency: 'usd' });
}

// VULNERABILITY 4: Insecure HTTP for sensitive data
function sendUserData(userData) {
  return fetch('http://api.example.com/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
}

module.exports = { getUserByEmail, processPayment, sendUserData };
