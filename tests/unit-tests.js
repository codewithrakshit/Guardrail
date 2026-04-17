/**
 * Unit Tests - No AWS credentials required
 * Tests core logic and module integration
 */

const RemediationEngine = require('../src/modules/remediation-engine');

async function runTests() {
  console.log('🧪 Running GuardRail AI Unit Tests\n');
  console.log('='.repeat(60) + '\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Remediation Engine - Hardcoded Secret Detection
  console.log('Test 1: Remediation Strategy for Hardcoded Secret');
  console.log('-'.repeat(60));
  try {
    const engine = new RemediationEngine();
    const analysis = {
      risk_type: 'hardcoded_secret',
      severity: 'critical',
      extracted_value: 'sk_live_1234567890'
    };
    
    const strategy = await engine.createStrategy(analysis);
    
    if (strategy.requiresSecretStorage === true &&
        strategy.fixType === 'secret_extraction' &&
        strategy.confidence >= 90) {
      console.log('✅ PASSED');
      console.log(`   Fix Type: ${strategy.fixType}`);
      console.log(`   Requires Secret Storage: ${strategy.requiresSecretStorage}`);
      console.log(`   Confidence: ${strategy.confidence}%`);
      console.log(`   Approach: ${strategy.approach}\n`);
      passed++;
    } else {
      console.log('❌ FAILED - Strategy validation failed\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAILED - ${error.message}\n`);
    failed++;
  }

  // Test 2: Remediation Engine - SQL Injection
  console.log('Test 2: Remediation Strategy for SQL Injection');
  console.log('-'.repeat(60));
  try {
    const engine = new RemediationEngine();
    const analysis = {
      risk_type: 'sql_injection',
      severity: 'high'
    };
    
    const strategy = await engine.createStrategy(analysis);
    
    if (strategy.requiresSecretStorage === false &&
        strategy.fixType === 'code_sanitization' &&
        strategy.approach.includes('parameterized')) {
      console.log('✅ PASSED');
      console.log(`   Fix Type: ${strategy.fixType}`);
      console.log(`   Approach: ${strategy.approach}`);
      console.log(`   Confidence: ${strategy.confidence}%\n`);
      passed++;
    } else {
      console.log('❌ FAILED - Strategy validation failed\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAILED - ${error.message}\n`);
    failed++;
  }

  // Test 3: Secret Name Generation
  console.log('Test 3: Secret Name Generation');
  console.log('-'.repeat(60));
  try {
    const SecretManager = require('../src/modules/secret-manager');
    const manager = new SecretManager({ region: 'us-east-1', projectName: 'test' });
    
    const secretName = manager.generateSecretName('src/api/client.js', 'api_key', 1234567890);
    
    if (secretName.startsWith('guardrail/test/') && 
        secretName.includes('api_key') &&
        secretName.includes('1234567890')) {
      console.log('✅ PASSED');
      console.log(`   Generated: ${secretName}\n`);
      passed++;
    } else {
      console.log('❌ FAILED - Invalid secret name format\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAILED - ${error.message}\n`);
    failed++;
  }

  // Test 4: Retrieval Code Generation
  console.log('Test 4: Retrieval Code Generation');
  console.log('-'.repeat(60));
  try {
    const SecretManager = require('../src/modules/secret-manager');
    const manager = new SecretManager({ region: 'us-east-1', projectName: 'test' });
    
    const retrievalCode = manager.generateRetrievalCode('guardrail/test/secret');
    
    if (retrievalCode.nodejs && 
        retrievalCode.python && 
        retrievalCode.java &&
        retrievalCode.nodejs.includes('getSecretValue')) {
      console.log('✅ PASSED');
      console.log(`   Node.js: ${retrievalCode.nodejs}`);
      console.log(`   Python: ${retrievalCode.python}`);
      console.log(`   Java: ${retrievalCode.java}\n`);
      passed++;
    } else {
      console.log('❌ FAILED - Missing retrieval code\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAILED - ${error.message}\n`);
    failed++;
  }

  // Test 5: Fix Type Determination
  console.log('Test 5: Fix Type Determination');
  console.log('-'.repeat(60));
  try {
    const engine = new RemediationEngine();
    
    const tests = [
      { risk: 'hardcoded_secret', expected: 'secret_extraction' },
      { risk: 'sql_injection', expected: 'code_sanitization' },
      { risk: 'insecure_http', expected: 'secure_library_replacement' },
      { risk: 'permissive_config', expected: 'configuration_hardening' }
    ];
    
    let allPassed = true;
    for (const test of tests) {
      const fixType = engine.determineFixType(test.risk);
      if (fixType !== test.expected) {
        allPassed = false;
        console.log(`   ❌ ${test.risk} -> ${fixType} (expected ${test.expected})`);
      } else {
        console.log(`   ✓ ${test.risk} -> ${fixType}`);
      }
    }
    
    if (allPassed) {
      console.log('✅ PASSED\n');
      passed++;
    } else {
      console.log('❌ FAILED\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAILED - ${error.message}\n`);
    failed++;
  }

  // Test 6: Security Analysis Prompt Building
  console.log('Test 6: Security Analysis Prompt Building');
  console.log('-'.repeat(60));
  try {
    const SecurityAnalyzer = require('../src/modules/security-analyzer');
    const analyzer = new SecurityAnalyzer({ region: 'us-east-1' });
    
    const code = 'const API_KEY = "sk_test_123";';
    const prompt = analyzer.buildAnalysisPrompt(code, 'javascript', [1]);
    
    if (prompt.includes('hardcoded secrets') &&
        prompt.includes('SQL injection') &&
        prompt.includes('risk_detected') &&
        prompt.includes(code)) {
      console.log('✅ PASSED');
      console.log(`   Prompt length: ${prompt.length} chars`);
      console.log(`   Contains security rules: Yes`);
      console.log(`   Contains code: Yes\n`);
      passed++;
    } else {
      console.log('❌ FAILED - Prompt missing required elements\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAILED - ${error.message}\n`);
    failed++;
  }

  // Test 7: JSON Response Parsing
  console.log('Test 7: JSON Response Parsing');
  console.log('-'.repeat(60));
  try {
    const SecurityAnalyzer = require('../src/modules/security-analyzer');
    const analyzer = new SecurityAnalyzer({ region: 'us-east-1' });
    
    const mockResponse = `Here is the analysis:
{
  "risk_detected": true,
  "risk_type": "hardcoded_secret",
  "severity": "critical",
  "explanation": "API key found",
  "affected_lines": [1],
  "remediation_required": true
}`;
    
    const parsed = analyzer.parseAnalysisResponse(mockResponse);
    
    if (parsed.risk_detected === true &&
        parsed.risk_type === 'hardcoded_secret' &&
        parsed.severity === 'critical') {
      console.log('✅ PASSED');
      console.log(`   Parsed: ${JSON.stringify(parsed, null, 2)}\n`);
      passed++;
    } else {
      console.log('❌ FAILED - Parsing error\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAILED - ${error.message}\n`);
    failed++;
  }

  // Test 8: Code Extraction from Markdown
  console.log('Test 8: Code Extraction from Markdown');
  console.log('-'.repeat(60));
  try {
    const CodeRefactor = require('../src/modules/code-refactor');
    const refactor = new CodeRefactor();
    
    const mockResponse = `Here is the secure code:
\`\`\`javascript
const secret = await getSecret('api-key');
console.log(secret);
\`\`\`
This is much safer!`;
    
    const extracted = refactor.extractCode(mockResponse);
    
    if (extracted.includes('getSecret') && 
        !extracted.includes('Here is') &&
        !extracted.includes('```')) {
      console.log('✅ PASSED');
      console.log(`   Extracted: ${extracted}\n`);
      passed++;
    } else {
      console.log('❌ FAILED - Code extraction error\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAILED - ${error.message}\n`);
    failed++;
  }

  // Test 9: Diff Generation
  console.log('Test 9: Diff Generation');
  console.log('-'.repeat(60));
  try {
    const CodeRefactor = require('../src/modules/code-refactor');
    const refactor = new CodeRefactor();
    
    const original = 'const API_KEY = "secret";\nconst client = new Client(API_KEY);';
    const secure = 'const API_KEY = await getSecret("api-key");\nconst client = new Client(API_KEY);';
    
    const diff = refactor.generateDiff(original, secure);
    
    if (diff.removed && diff.added && diff.preview) {
      console.log('✅ PASSED');
      console.log(`   Lines removed: ${diff.removed}`);
      console.log(`   Lines added: ${diff.added}`);
      console.log(`   Preview:\n${diff.preview}\n`);
      passed++;
    } else {
      console.log('❌ FAILED - Diff generation error\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAILED - ${error.message}\n`);
    failed++;
  }

  // Test 10: Module Integration
  console.log('Test 10: Module Integration Check');
  console.log('-'.repeat(60));
  try {
    const GuardRailAI = require('../src/index');
    
    const config = {
      bedrock: { region: 'us-east-1' },
      aws: { 
        region: 'us-east-1',
        projectName: 'test',
        tableName: 'test-table',
        logGroup: '/test'
      }
    };
    
    const guardrail = new GuardRailAI(config);
    
    if (guardrail.analyzer && 
        guardrail.remediation && 
        guardrail.secretManager &&
        guardrail.refactor &&
        guardrail.logger) {
      console.log('✅ PASSED');
      console.log('   All modules initialized successfully\n');
      passed++;
    } else {
      console.log('❌ FAILED - Module initialization error\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAILED - ${error.message}\n`);
    failed++;
  }

  // Summary
  console.log('='.repeat(60));
  console.log(`\n📊 Test Results: ${passed}/${passed + failed} passed`);

  if (failed === 0) {
    console.log('✨ All unit tests passed!\n');
    process.exit(0);
  } else {
    console.log(`⚠️  ${failed} test(s) failed\n`);
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
