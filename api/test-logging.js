#!/usr/bin/env node

/**
 * Test CloudWatch Logging
 */

require('dotenv').config();
const EventLogger = require('./services/event-logger');

async function testLogging() {
  console.log('🧪 Testing CloudWatch Logging...\n');
  
  const logger = new EventLogger();
  const testSessionId = `test-${Date.now()}`;
  
  try {
    // Test 1: Log scan start
    console.log('1️⃣ Testing logScanStart...');
    await logger.logScanStart({
      sessionId: testSessionId,
      language: 'javascript',
      filename: 'test.js',
      fileSize: 1024
    });
    console.log('✅ Scan start logged\n');
    
    // Test 2: Log scan progress
    console.log('2️⃣ Testing logScanProgress...');
    await logger.logScanProgress({
      sessionId: testSessionId,
      step: 'analyzing',
      details: 'Running AI analysis'
    });
    console.log('✅ Scan progress logged\n');
    
    // Test 3: Log scan completion
    console.log('3️⃣ Testing logScan (completion)...');
    await logger.logScan({
      sessionId: testSessionId,
      status: 'vulnerable',
      vulnerabilityType: 'hardcoded_secret',
      severity: 'critical',
      language: 'javascript',
      secretCreated: true,
      confidence: 95,
      duration: 2500
    });
    console.log('✅ Scan completion logged\n');
    
    // Test 4: Log error
    console.log('4️⃣ Testing logError...');
    await logger.logError({
      sessionId: testSessionId,
      error: 'Test error message',
      stack: 'Error stack trace here',
      context: 'Testing error logging'
    });
    console.log('✅ Error logged\n');
    
    // Wait for logs to be written
    console.log('⏳ Waiting 3 seconds for logs to be written to CloudWatch...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 5: Retrieve logs
    console.log('5️⃣ Testing getSessionLogs...');
    const logs = await logger.getSessionLogs(testSessionId);
    console.log(`✅ Retrieved ${logs.length} logs for session ${testSessionId}\n`);
    
    if (logs.length > 0) {
      console.log('📋 Sample log entry:');
      console.log(JSON.stringify(logs[0], null, 2));
    }
    
    console.log('\n✅ All tests passed!');
    console.log(`\n🔍 Check CloudWatch Logs: /guardrail-ai/public`);
    console.log(`📊 Check DynamoDB: GuardRailEvents table`);
    console.log(`🆔 Test Session ID: ${testSessionId}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

testLogging();
