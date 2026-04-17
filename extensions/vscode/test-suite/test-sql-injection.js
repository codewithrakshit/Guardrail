// Test Case 2: SQL Injection
// Expected: HIGH severity, CWE-89
// Should detect: SQL injection vulnerability

const express = require('express');
const mysql = require('mysql');

const app = express();
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'myapp'
});

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});
