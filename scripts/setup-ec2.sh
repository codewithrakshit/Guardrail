#!/bin/bash
# GuardRail AI - Fast EC2 Deployment Script

set -e

echo "🚀 GuardRail AI - EC2 Deployment"
echo "=================================="

# Configuration
INSTANCE_TYPE="t3.micro"
AMI_ID="ami-0c55b159cbfafe1f0"  # Amazon Linux 2023 (us-east-1)
KEY_NAME="guardrail-key"
SECURITY_GROUP="guardrail-sg"
REGION="${AWS_REGION:-us-east-1}"

echo "📍 Region: $REGION"
echo "💻 Instance Type: $INSTANCE_TYPE"
echo ""

# Step 1: Create key pair if doesn't exist
echo "🔑 Creating SSH key pair..."
if ! aws ec2 describe-key-pairs --key-names $KEY_NAME --region $REGION 2>/dev/null; then
  aws ec2 create-key-pair \
    --key-name $KEY_NAME \
    --region $REGION \
    --query 'KeyMaterial' \
    --output text > ~/.ssh/$KEY_NAME.pem
  chmod 400 ~/.ssh/$KEY_NAME.pem
  echo "✅ Key pair created: ~/.ssh/$KEY_NAME.pem"
else
  echo "✅ Key pair already exists"
fi

# Step 2: Create security group
echo ""
echo "🔒 Creating security group..."
SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=$SECURITY_GROUP" \
  --region $REGION \
  --query 'SecurityGroups[0].GroupId' \
  --output text 2>/dev/null || echo "None")

if [ "$SG_ID" = "None" ]; then
  SG_ID=$(aws ec2 create-security-group \
    --group-name $SECURITY_GROUP \
    --description "GuardRail AI API Security Group" \
    --region $REGION \
    --query 'GroupId' \
    --output text)
  
  # Allow SSH, API, and HTTP in one call
  aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --region $REGION \
    --ip-permissions \
      IpProtocol=tcp,FromPort=22,ToPort=22,IpRanges='[{CidrIp=0.0.0.0/0}]' \
      IpProtocol=tcp,FromPort=3001,ToPort=3001,IpRanges='[{CidrIp=0.0.0.0/0}]' \
      IpProtocol=tcp,FromPort=80,ToPort=80,IpRanges='[{CidrIp=0.0.0.0/0}]' \
    2>/dev/null || echo "Rules may already exist"
  
  echo "✅ Security group created: $SG_ID"
else
  echo "✅ Security group already exists: $SG_ID"
fi

# Step 3: Get latest Amazon Linux 2023 AMI
echo ""
echo "🔍 Finding latest AMI..."
AMI_ID=$(aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=al2023-ami-2023.*-x86_64" \
  --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
  --region $REGION \
  --output text)
echo "✅ Using AMI: $AMI_ID"

# Step 4: Create user data script
echo ""
echo "📝 Preparing user data script..."
cat > /tmp/user-data.sh << 'EOF'
#!/bin/bash
set -e

# Update system
yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs git

# Install PM2
npm install -g pm2

# Create app directory
mkdir -p /home/ec2-user/guardrail-api
cd /home/ec2-user/guardrail-api

# Clone repo (you'll need to update this with your repo URL)
# For now, we'll create a placeholder
echo "App directory ready at /home/ec2-user/guardrail-api"

# Set ownership
chown -R ec2-user:ec2-user /home/ec2-user/guardrail-api

echo "✅ EC2 instance setup complete"
EOF

# Step 5: Launch EC2 instance
echo ""
echo "🚀 Launching EC2 instance..."
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type $INSTANCE_TYPE \
  --key-name $KEY_NAME \
  --security-group-ids $SG_ID \
  --user-data file:///tmp/user-data.sh \
  --region $REGION \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=GuardRail-API},{Key=Project,Value=GuardRailAI}]" \
  --query 'Instances[0].InstanceId' \
  --output text)

echo "✅ Instance launched: $INSTANCE_ID"
echo ""
echo "⏳ Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $REGION

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --region $REGION \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

echo ""
echo "=================================="
echo "✅ EC2 Instance Ready!"
echo "=================================="
echo ""
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"
echo "SSH Key: ~/.ssh/$KEY_NAME.pem"
echo ""
echo "🔗 API will be available at: http://$PUBLIC_IP:3001"
echo ""
echo "📋 Next Steps:"
echo "1. SSH into instance:"
echo "   ssh -i ~/.ssh/$KEY_NAME.pem ec2-user@$PUBLIC_IP"
echo ""
echo "2. Upload your code (run from your local machine):"
echo "   scp -i ~/.ssh/$KEY_NAME.pem -r ../api ec2-user@$PUBLIC_IP:~/guardrail-api/"
echo ""
echo "3. Or use the deploy script:"
echo "   ./deploy-to-ec2.sh $PUBLIC_IP"
echo ""

# Save instance info
cat > ec2-instance.txt << EOF
INSTANCE_ID=$INSTANCE_ID
PUBLIC_IP=$PUBLIC_IP
KEY_PATH=~/.ssh/$KEY_NAME.pem
API_URL=http://$PUBLIC_IP:3001
EOF

echo "💾 Instance info saved to: ec2-instance.txt"
