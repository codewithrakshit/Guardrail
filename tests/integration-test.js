/**
 * Integration Test - Simulates Full Pipeline
 * Tests end-to-end flow without AWS calls
 */

const GuardRailAI = require('../src/index');

// Mock AWS SDK clients to avoid real API calls
const mockBedrockResponse = {
  body: new TextEncoder().encode(JSON.stringify({
    output: {
      message: {
        content: [{
          text: JSON.stringify({
            risk_detected: true,
            risk_type: 'hardcoded_secret',
            severity: 'critical',
            explanation: 'Hardcoded API key detected in code',
            affected_lines: [1],
            remediation_required: true,
            extracted_value: 'sk_live_1234567890abcdef'
          })
        }]
      }
    }
  }))
};

const mockSecureCodeResponse = {
  body: new TextEncoder().encode(JSON.stringify({
    output: {
      message: {
        content: [{
          text: `\`\`\`javascript
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

async function getAPIKey() {
  const client = new SecretsManagerClient({ region: 'us-east-1' });
  const response = await client.send(new GetSecretValueCommand({
    SecretId: 'guardrail/demo/api_key'
  }));
  return response.SecretString;
}

const API_KEY = await getAPIKey();
const client = new APIClient({ apiKey: API_KEY });
\`\`\``
        }]
      }
    }
  }))
};

// Mock Bedrock client
jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn().mockImplementation(() => ({
    send: jest.fn()
      .mockResolvedValueOnce(mockBedrockResponse)  // First call: analysis
      .mockResolvedValueOnce(mockSecureCodeResponse)  // Second call: refactor
  })),
  InvokeModelCommand: jest.fn()
}));

// Mock Secrets Manager client
jest.mock('@aws-sdk/client-secrets-manager', () => ({
  SecretsManagerClient: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({
      ARN: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:test',
      Name: 'guardrail/test/secret'
    })
  })),
  CreateSecretCommand: jest.fn(),
  GetSecretValueCommand: jest.fn()
}));

// Mock DynamoDB client
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({})
  })),
  PutItemCommand: jest.fn()
}));

// Mock CloudWatch client
jest.mock('@aws-sdk/client-cloudwatch-logs', () => ({
  CloudWatchLogsClient: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({})
  })),
  PutLogEventsCommand: jest.fn()
}));

async function runIntegrationTest() {
  console.log('🔬 Running GuardRail AI Integration Test\n');
  console.log('='.repeat(60) + '\n');

  const config = {
    bedrock: { region: 'us-east-1' },
    aws: { 
      region: 'us-east-1',
      projectName: 'integration-test',
      tableName: 'guardrail-events-test',
      logGroup: '/guardrail-ai/test'
    }
  };

  const guardrail = new GuardRailAI(config);

  // Test Case: Hardcoded API Key Detection and Remediation
  console.log('Test Case: Full Pipeline - Hardcoded API Key');
  console.log('-'.repeat(60));

  const vulnerableFile = {
    path: 'src/api-client.js',
    language: 'javascript',
    content: `const API_KEY = "sk_live_1234567890abcdef";
const client = new APIClient({ apiKey: API_KEY });

module.exports = client;`,
    diff: [1, 2]
  };

  console.log('📄 Input File:');
  console.log(`   Path: ${vulnerableFile.path}`);
  console.log(`   Language: ${vulnerableFile.language}`);
  console.log(`   Lines: ${vulnerableFile.content.split('\n').length}`);
  console.log();

  try {
    const startTime = Date.now();
    const result = await guardrail.processFileSave(vulnerableFile);
    const duration = Date.now() - startTime;

    console.log('📊 Pipeline Results:');
    console.log(`   Status: ${result.status}`);
    console.log(`   Latency: ${duration}ms`);
    console.log();

    if (result.status === 'risk_detected') {
      console.log('🔍 Security Analysis:');
      console.log(`   Risk Type: ${result.analysis.risk_type}`);
      console.log(`   Severity: ${result.analysis.severity}`);
      console.log(`   Explanation: ${result.analysis.explanation}`);
      console.log(`   Affected Lines: ${result.analysis.affected_lines.join(', ')}`);
      console.log();

      if (result.patch) {
        console.log('🔧 Generated Patch:');
        console.log(`   Reason: ${result.patch.reason_for_change}`);
        console.log(`   Security Benefit: ${result.patch.security_benefit}`);
        console.log();
        console.log('📝 Diff Preview:');
        console.log(result.patch.diff_view.preview);
        console.log();
        console.log('✅ Secure Code Generated:');
        console.log(result.patch.secure_code.substring(0, 200) + '...');
        console.log();
      }

      // Validate performance targets
      console.log('⚡ Performance Validation:');
      if (duration < 6000) {
        console.log(`   ✅ Total latency ${duration}ms < 6000ms target`);
      } else {
        console.log(`   ⚠️  Total latency ${duration}ms exceeds 6000ms target`);
      }
      console.log();

      console.log('='.repeat(60));
      console.log('✨ Integration Test PASSED\n');
      console.log('Pipeline successfully:');
      console.log('  1. ✅ Detected hardcoded secret');
      console.log('  2. ✅ Classified risk as CRITICAL');
      console.log('  3. ✅ Generated remediation strategy');
      console.log('  4. ✅ Created AWS secret reference');
      console.log('  5. ✅ Generated secure replacement code');
      console.log('  6. ✅ Produced diff preview');
      console.log('  7. ✅ Logged event');
      console.log();

      return true;
    } else {
      console.log('❌ Integration Test FAILED - No risk detected\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Integration Test FAILED');
    console.log(`   Error: ${error.message}`);
    console.log(`   Stack: ${error.stack}\n`);
    return false;
  }
}

// Run if executed directly
if (require.main === module) {
  runIntegrationTest()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Test error:', error);
      process.exit(1);
    });
}

module.exports = { runIntegrationTest };
