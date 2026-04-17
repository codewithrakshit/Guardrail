/**
 * GuardRail AI Test Suite
 * Validates security detection and remediation pipeline
 */

const GuardRailAI = require('../src/index');

const testConfig = {
  bedrock: { region: 'us-east-1' },
  aws: { 
    region: 'us-east-1',
    projectName: 'test-project',
    tableName: 'guardrail-events-test',
    logGroup: '/guardrail-ai/test'
  }
};

const tests = [
  {
    name: 'Test 1 - Hardcoded API Key',
    file: {
      path: 'src/api-client.js',
      language: 'javascript',
      content: `const API_KEY = "sk-1234567890abcdef";
const client = new APIClient({ apiKey: API_KEY });`,
      diff: [1, 2]
    },
    expectedRisk: 'hardcoded_secret',
    expectedSeverity: 'critical'
  },
  {
    name: 'Test 2 - SQL Injection',
    file: {
      path: 'src/database.js',
      language: 'javascript',
      content: `function getUser(userId) {
  const query = "SELECT * FROM users WHERE id = '" + userId + "'";
  return db.execute(query);
}`,
      diff: [2]
    },
    expectedRisk: 'sql_injection',
    expectedSeverity: 'high'
  },
  {
    name: 'Test 3 - Exposed JWT Secret',
    file: {
      path: 'src/auth.js',
      language: 'javascript',
      content: `const jwt = require('jsonwebtoken');
const JWT_SECRET = "my-super-secret-key-12345";
const token = jwt.sign(payload, JWT_SECRET);`,
      diff: [2, 3]
    },
    expectedRisk: 'hardcoded_secret',
    expectedSeverity: 'critical'
  }
];

async function runTests() {
  console.log('🧪 Running GuardRail AI Test Suite\n');
  console.log('=' .repeat(60) + '\n');

  const guardrail = new GuardRailAI(testConfig);
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`Running: ${test.name}`);
    console.log('-'.repeat(60));

    try {
      const result = await guardrail.processFileSave(test.file);

      if (result.status === 'risk_detected') {
        const analysis = result.analysis;
        
        console.log(`✓ Risk detected: ${analysis.risk_type}`);
        console.log(`✓ Severity: ${analysis.severity}`);
        console.log(`✓ Latency: ${result.latency}ms`);
        
        if (result.patch) {
          console.log(`✓ Patch generated`);
          console.log(`  Preview: ${result.patch.diff_view.preview.substring(0, 100)}...`);
        }

        if (analysis.risk_type === test.expectedRisk) {
          console.log(`✅ PASSED\n`);
          passed++;
        } else {
          console.log(`❌ FAILED - Expected ${test.expectedRisk}, got ${analysis.risk_type}\n`);
          failed++;
        }
      } else {
        console.log(`❌ FAILED - No risk detected\n`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ FAILED - Error: ${error.message}\n`);
      failed++;
    }
  }

  console.log('=' .repeat(60));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log(`⏱️  Performance: All tests completed\n`);
}

// Run if executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
