/**
 * Demo Route - Preloaded vulnerable examples
 */

const express = require('express');
const router = express.Router();

const DEMO_EXAMPLES = {
  hardcoded_api_key: {
    name: 'Hardcoded API Key',
    language: 'javascript',
    code: `const stripe = require('stripe');

// ⚠️ SECURITY RISK: Hardcoded API key
const STRIPE_API_KEY = 'sk_live_51234567890abcdefghijklmnop';

const client = stripe(STRIPE_API_KEY);

async function processPayment(amount, currency) {
  return await client.charges.create({
    amount: amount,
    currency: currency,
    source: 'tok_visa'
  });
}

module.exports = { processPayment };`,
    description: 'API key exposed in source code - Critical security vulnerability'
  },

  sql_injection: {
    name: 'SQL Injection',
    language: 'javascript',
    code: `const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'app_user',
  database: 'production'
});

// ⚠️ SECURITY RISK: SQL Injection vulnerability
function getUserByEmail(email) {
  const query = "SELECT * FROM users WHERE email = '" + email + "'";
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) reject(error);
      resolve(results);
    });
  });
}

module.exports = { getUserByEmail };`,
    description: 'Unsanitized user input in SQL query - High risk injection attack'
  },

  database_password: {
    name: 'Hardcoded Database Password',
    language: 'python',
    code: `import psycopg2

# ⚠️ SECURITY RISK: Database credentials in code
def get_connection():
    return psycopg2.connect(
        host="prod-db.example.com",
        database="production",
        user="admin",
        password="SuperSecret123!"
    )

def fetch_users():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    return cursor.fetchall()`,
    description: 'Database password hardcoded - Critical credential exposure'
  },

  insecure_http: {
    name: 'Insecure HTTP',
    language: 'javascript',
    code: `const axios = require('axios');

// ⚠️ SECURITY RISK: Sensitive data over HTTP
async function sendUserData(userData) {
  return await axios.post('http://api.example.com/users', {
    email: userData.email,
    password: userData.password,
    ssn: userData.ssn,
    creditCard: userData.creditCard
  });
}

module.exports = { sendUserData };`,
    description: 'Sensitive data transmitted over insecure HTTP protocol'
  }
};

/**
 * GET /api/demo
 * List all demo examples
 */
router.get('/', (req, res) => {
  const examples = Object.entries(DEMO_EXAMPLES).map(([id, example]) => ({
    id,
    name: example.name,
    language: example.language,
    description: example.description
  }));

  res.json({ examples });
});

/**
 * GET /api/demo/:exampleId
 * Get specific demo example
 */
router.get('/:exampleId', (req, res) => {
  const { exampleId } = req.params;
  const example = DEMO_EXAMPLES[exampleId];

  if (!example) {
    return res.status(404).json({ error: 'Demo example not found' });
  }

  res.json({
    id: exampleId,
    ...example
  });
});

module.exports = router;
