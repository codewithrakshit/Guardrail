#!/usr/bin/env node

/**
 * GuardRail AI Extension - Comprehensive Test Suite
 * Tests all functionality of the VS Code extension
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_DIR = path.join(__dirname, 'test-suite');

class ExtensionTester {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  async runAllTests() {
    console.log('🛡️  GuardRail AI Extension - Test Suite');
    console.log('==========================================\n');

    // Test 1: Backend Health Check
    await this.testBackendHealth();

    // Test 2: Hardcoded Secret Detection
    await this.testHardcodedSecret();

    // Test 3: SQL Injection Detection
    await this.testSQLInjection();

    // Test 4: Insecure HTTP Detection
    await this.testInsecureHTTP();

    // Test 5: Safe Code (No Vulnerabilities)
    await this.testSafeCode();

    // Test 6: API Response Format
    await this.testAPIResponseFormat();

    // Test 7: Session Management
    await this.testSessionManagement();

    // Print Summary
    this.printSummary();
  }

  async testBackendHealth() {
    console.log('Test 1: Backend Health Check');
    try {
      const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
      this.pass('Backend is running and healthy');
    } catch (error) {
      this.fail('Backend health check failed', error.message);
    }
  }

  async testHardcodedSecret() {
    console.log('\nTest 2: Hardcoded Secret Detection');
    const code = fs.readFileSync(path.join(TEST_DIR, 'test-hardcoded-secret.js'), 'utf8');
    
    try {
      const scanResult = await this.scanCode(code, 'javascript', 'test-hardcoded-secret.js');
      
      if (scanResult.status === 'vulnerable') {
        this.pass('Detected hardcoded secret');
        
        if (scanResult.vulnerabilities && scanResult.vulnerabilities.length > 0) {
          const vuln = scanResult.vulnerabilities[0];
          this.pass(`Severity: ${vuln.severity}`);
          this.pass(`CWE: ${vuln.cwe}`);
        }
        
        const result = await this.getResult(scanResult.sessionId);
        if (result.patchedCode) {
          this.pass('Generated secure patch');
        } else {
          this.fail('No patch generated');
        }
      } else {
        this.fail('Failed to detect hardcoded secret');
      }
    } catch (error) {
      this.fail('Hardcoded secret test failed', error.message);
    }
  }

  async testSQLInjection() {
    console.log('\nTest 3: SQL Injection Detection');
    const code = fs.readFileSync(path.join(TEST_DIR, 'test-sql-injection.js'), 'utf8');
    
    try {
      const scanResult = await this.scanCode(code, 'javascript', 'test-sql-injection.js');
      
      if (scanResult.status === 'vulnerable') {
        this.pass('Detected SQL injection vulnerability');
      } else {
        this.fail('Failed to detect SQL injection');
      }
    } catch (error) {
      this.fail('SQL injection test failed', error.message);
    }
  }

  async testInsecureHTTP() {
    console.log('\nTest 4: Insecure HTTP Detection');
    const code = fs.readFileSync(path.join(TEST_DIR, 'test-insecure-http.js'), 'utf8');
    
    try {
      const scanResult = await this.scanCode(code, 'javascript', 'test-insecure-http.js');
      
      if (scanResult.status === 'vulnerable') {
        this.pass('Detected insecure HTTP connection');
      } else {
        this.fail('Failed to detect insecure HTTP');
      }
    } catch (error) {
      this.fail('Insecure HTTP test failed', error.message);
    }
  }

  async testSafeCode() {
    console.log('\nTest 5: Safe Code (No Vulnerabilities)');
    const code = fs.readFileSync(path.join(TEST_DIR, 'test-safe-code.js'), 'utf8');
    
    try {
      const scanResult = await this.scanCode(code, 'javascript', 'test-safe-code.js');
      
      if (scanResult.status === 'safe') {
        this.pass('Correctly identified safe code');
      } else {
        this.fail('False positive: Safe code flagged as vulnerable');
      }
    } catch (error) {
      this.fail('Safe code test failed', error.message);
    }
  }

  async testAPIResponseFormat() {
    console.log('\nTest 6: API Response Format');
    const code = "const key = 'secret123';";
    
    try {
      const scanResult = await this.scanCode(code, 'javascript', 'test.js');
      
      // Check required fields
      if (scanResult.sessionId) this.pass('Response includes sessionId');
      else this.fail('Missing sessionId');
      
      if (scanResult.status) this.pass('Response includes status');
      else this.fail('Missing status');
      
      if (scanResult.vulnerabilities !== undefined) this.pass('Response includes vulnerabilities');
      else this.fail('Missing vulnerabilities');
      
      // Get full result
      const result = await this.getResult(scanResult.sessionId);
      
      if (result.patchedCode) this.pass('Result includes patchedCode');
      else this.fail('Missing patchedCode');
      
      if (result.patch) this.pass('Result includes patch details');
      else this.fail('Missing patch details');
      
    } catch (error) {
      this.fail('API response format test failed', error.message);
    }
  }

  async testSessionManagement() {
    console.log('\nTest 7: Session Management');
    const code = "const key = 'test';";
    
    try {
      const scanResult = await this.scanCode(code, 'javascript', 'test.js');
      const sessionId = scanResult.sessionId;
      
      // Wait for processing
      await this.sleep(3000);
      
      // Get result
      const result = await this.getResult(sessionId);
      
      if (result.status === 'completed') {
        this.pass('Session status updated to completed');
      } else {
        this.fail(`Session status is ${result.status}, expected completed`);
      }
      
      if (result.createdAt) this.pass('Session includes createdAt timestamp');
      if (result.expiresAt) this.pass('Session includes expiresAt timestamp');
      
    } catch (error) {
      this.fail('Session management test failed', error.message);
    }
  }

  // Helper methods
  async scanCode(code, language, filename) {
    const response = await axios.post(`${API_URL}/api/scan`, {
      code,
      language,
      filename
    }, { timeout: 30000 });
    return response.data;
  }

  async getResult(sessionId) {
    // Poll for result
    for (let i = 0; i < 10; i++) {
      const response = await axios.get(`${API_URL}/api/result/${sessionId}`);
      if (response.data.status === 'completed' || response.data.status === 'error') {
        return response.data;
      }
      await this.sleep(1000);
    }
    throw new Error('Timeout waiting for result');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  pass(message) {
    console.log(`  ✅ ${message}`);
    this.passed++;
    this.results.push({ status: 'PASS', message });
  }

  fail(message, error = '') {
    console.log(`  ❌ ${message}${error ? ': ' + error : ''}`);
    this.failed++;
    this.results.push({ status: 'FAIL', message, error });
  }

  printSummary() {
    console.log('\n==========================================');
    console.log('Test Summary');
    console.log('==========================================');
    console.log(`Total Tests: ${this.passed + this.failed}`);
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
    
    if (this.failed > 0) {
      console.log('\nFailed Tests:');
      this.results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`  - ${r.message}`);
      });
    }
    
    process.exit(this.failed > 0 ? 1 : 0);
  }
}

// Run tests
const tester = new ExtensionTester();
tester.runAllTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
