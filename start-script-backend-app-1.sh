#!/bin/bash

# Connect to RDS
# Connect to S3 public bucket 
# Connect to Parameter Store

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" 
nvm install 20
nvm use 20
nvm alias default 20

# Install npm
sudo yum install -y npm

# Install AWS CLI
sudo yum install -y aws-cli

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo yum install -y git

git clone https://github.com/jass-trix/cn-cloud-computing-project.git
cd backend-app-1

# Set NODE_ENV to production
export NODE_ENV=production

# FILL THIS PART
# - Insert this with your name e.g (jasson-harsojo)
NAME_SUFFIX='UPDATE THIS PART WITH YOUR NAME SUFFIX'

# Retrieve RDS endpoint
DB_NAME_PREFIX="rds-cloud-computing-"
DATABASE_URL=$(aws rds describe-db-instances \
  --query "DBInstances[?starts_with(DBInstanceIdentifier, '$DB_NAME_PREFIX') && ends_with(DBInstanceIdentifier, '$NAME_SUFFIX')].Endpoint.Address" \
  --output text)

PARAMETER_STORE_NAME_USERNAME="/cloud-computing/$NAME_SUFFIX/database/username"
PARAMETER_STORE_NAME_PASSWORD="/cloud-computing/$NAME_SUFFIX/database/password"

S3_BUCKET_NAME="public-image-data-bucket-$NAME_SUFFIX"

# Export environment variables
echo "export NODE_ENV=$NODE_ENV" >> /etc/environment
echo "export DATABASE_URL=$DATABASE_URL" >> /etc/environment
echo "export S3_BUCKET_NAME=$S3_BUCKET_NAME" >> /etc/environment
echo "export PARAMETER_STORE_NAME_USERNAME=$PARAMETER_STORE_NAME_USERNAME" >> /etc/environment
echo "export PARAMETER_STORE_NAME_PASSWORD=$PARAMETER_STORE_NAME_PASSWORD" >> /etc/environment

# Change permissions on the app directory (adjust as needed)
sudo chown -R ec2-user:ec2-user /home/ec2-user/backend-app-1

# Start your Node.js application or do other setup tasks
cd /home/ec2-user/backend-app-1
npm install
pm2 start server.js --name backend-app-1

# Save PM2 configuration to ensure the process restarts on instance reboot
pm2 save
pm2 startup

# Start PM2 at boot
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user

# Save current PM2 process list to be restored on reboot
pm2 save