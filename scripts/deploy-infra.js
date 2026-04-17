/**
 * Infrastructure Deployment Script
 * Sets up AWS resources for GuardRail AI
 */

const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');
const { CloudWatchLogsClient, CreateLogGroupCommand } = require('@aws-sdk/client-cloudwatch-logs');

async function deployInfrastructure() {
  console.log('🚀 Deploying GuardRail AI infrastructure...\n');

  const region = process.env.AWS_REGION || 'us-east-1';

  // Create DynamoDB Table
  console.log('📊 Creating DynamoDB table...');
  const dynamodb = new DynamoDBClient({ region });
  
  try {
    await dynamodb.send(new CreateTableCommand({
      TableName: 'guardrail-events',
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      BillingMode: 'PAY_PER_REQUEST',
      Tags: [{ Key: 'Project', Value: 'GuardRailAI' }]
    }));
    console.log('✅ DynamoDB table created\n');
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('ℹ️  DynamoDB table already exists\n');
    } else {
      console.error('❌ DynamoDB creation failed:', error.message);
    }
  }

  // Create CloudWatch Log Group
  console.log('📝 Creating CloudWatch log group...');
  const cloudwatch = new CloudWatchLogsClient({ region });
  
  try {
    await cloudwatch.send(new CreateLogGroupCommand({
      logGroupName: '/guardrail-ai/detections'
    }));
    console.log('✅ CloudWatch log group created\n');
  } catch (error) {
    if (error.name === 'ResourceAlreadyExistsException') {
      console.log('ℹ️  CloudWatch log group already exists\n');
    } else {
      console.error('❌ CloudWatch creation failed:', error.message);
    }
  }

  console.log('✨ Infrastructure deployment complete!');
  console.log('\nNext steps:');
  console.log('1. Ensure AWS credentials are configured');
  console.log('2. Activate the GuardRail hook in Kiro IDE');
  console.log('3. Start coding - security is now automated!\n');
}

deployInfrastructure().catch(console.error);
