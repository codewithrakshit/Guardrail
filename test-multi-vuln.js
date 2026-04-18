// GuardRail AI - Multi-Vulnerability Test File
// This file contains 10+ security vulnerabilities for testing

const express = require('express');
const mysql = require('mysql');
const { exec } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');

// 1. HARDCODED SECRETS (Critical)
const API_KEY = 'sk-proj-1234567890abcdefghijklmnopqrstuvwxyz';
const DATABASE_PASSWORD = 'MyS3cr3tP@ssw0rd!';
const JWT_SECRET = 'super-secret-jwt-key-12345';
const AWS_ACCESS_KEY = 'AKIAIOSFODNN7EXAMPLE';
const AWS_SECRET = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';

// 2. SQL INJECTION (Critical)
function getUserByEmail(email) {
    const query = "SELECT * FROM users WHERE email = '" + email + "'";
    return db.query(query);
}

function loginUser(username, password) {
    const sql = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
    return db.execute(sql);
}

// 3. COMMAND INJECTION (Critical)
function pingHost(hostname) {
    exec('ping -c 4 ' + hostname, (error, stdout, stderr) => {
        console.log(stdout);
    });
}

function compressFile(filename) {
    exec(`tar -czf archive.tar.gz ${filename}`);
}

// 4. PATH TRAVERSAL (High)
function readUserFile(filename) {
    const filePath = '/var/uploads/' + filename;
    return fs.readFileSync(filePath, 'utf8');
}

function downloadFile(req, res) {
    const file = req.query.file;
    res.sendFile('/public/' + file);
}

// 5. XSS VULNERABILITY (High)
function displayComment(comment) {
    document.getElementById('comments').innerHTML = comment;
}

function renderUserInput(userInput) {
    return '<div>' + userInput + '</div>';
}

// 6. WEAK CRYPTOGRAPHY (Medium)
function hashPassword(password) {
    return crypto.createHash('md5').update(password).digest('hex');
}

function encryptData(data) {
    const cipher = crypto.createCipher('des', 'weak-key');
    return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
}

// 7. INSECURE RANDOM (Medium)
function generateSessionToken() {
    return Math.random().toString(36).substring(2, 15);
}

function createResetToken() {
    return Math.floor(Math.random() * 1000000).toString();
}

// 8. DANGEROUS EVAL (Critical)
function executeUserCode(code) {
    eval(code);
}

function processFormula(formula) {
    return eval('result = ' + formula);
}

// 9. INSECURE DESERIALIZATION (High)
function deserializeData(data) {
    return eval('(' + data + ')');
}

// 10. INSECURE HTTP FOR SENSITIVE DATA (Medium)
function sendCredentials(username, password) {
    fetch('http://api.example.com/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
}

// 11. MISSING INPUT VALIDATION (Medium)
function setUserAge(age) {
    user.age = age; // No validation
    db.save(user);
}

// 12. REGEX DOS (Medium)
function validateEmail(email) {
    const regex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

module.exports = {
    getUserByEmail,
    loginUser,
    pingHost,
    compressFile,
    readUserFile,
    downloadFile,
    displayComment,
    renderUserInput,
    hashPassword,
    encryptData,
    generateSessionToken,
    createResetToken,
    executeUserCode,
    processFormula,
    deserializeData,
    sendCredentials,
    setUserAge,
    validateEmail
};
