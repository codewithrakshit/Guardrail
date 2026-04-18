#!/bin/bash
# Deploy GuardRail API to EC2

set -e

if [ -z "$1" ]; then
  echo "Usage: ./deploy-to-ec2.sh <EC2_PUBLIC_IP>"
  echo ""
  echo "Example: ./deploy-to-ec2.sh 54.123.45.67"
  exit 1
fi

PUBLIC_IP=$1
KEY_PATH="$HOME/.ssh/guardrail-key.pem"

echo "🚀 Deploying GuardRail API to EC2"
echo "=================================="
echo "Target: $PUBLIC_IP"
echo ""

# Step 1: Upload code
echo "📦 Uploading code..."
scp -i $KEY_PATH -r ../api ec2-user@$PUBLIC_IP:~/guardrail-api/

# Step 2: SSH and setup
echo ""
echo "⚙️  Setting up application..."
ssh -i $KEY_PATH ec2-user@$PUBLIC_IP << 'ENDSSH'
set -e

cd ~/guardrail-api/api

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Create .env file
echo "📝 Creating .env file..."
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
FRONTEND_URL=*

# Groq API
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MAX_TOKENS=2000

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# DynamoDB
DYNAMODB_TABLE=GuardRailSessions
EVENTS_TABLE=GuardRailEvents

# S3
S3_BUCKET=guardrail-sessions

# CloudWatch
LOG_GROUP=/guardrail-ai/public

# Rate Limiting
RATE_LIMIT=100

# Security
SESSION_TTL_HOURS=24
MAX_FILE_SIZE_MB=1
EOF

echo ""
echo "⚠️  IMPORTANT: Edit .env file with your actual credentials:"
echo "   nano ~/guardrail-api/api/.env"
echo ""
echo "Press Enter after you've updated the .env file..."
read

# Start with PM2
echo "🚀 Starting application with PM2..."
pm2 delete guardrail-api 2>/dev/null || true
pm2 start server.js --name guardrail-api
pm2 save
pm2 startup | tail -n 1 | bash

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Check status: pm2 status"
echo "📋 View logs: pm2 logs guardrail-api"
echo "🔄 Restart: pm2 restart guardrail-api"
echo ""

ENDSSH

echo ""
echo "=================================="
echo "✅ Deployment Complete!"
echo "=================================="
echo ""
echo "🔗 API URL: http://$PUBLIC_IP:3001"
echo "🏥 Health Check: http://$PUBLIC_IP:3001/health"
echo ""
echo "📋 Manage your app:"
echo "   ssh -i $KEY_PATH ec2-user@$PUBLIC_IP"
echo "   pm2 status"
echo "   pm2 logs guardrail-api"
echo ""
