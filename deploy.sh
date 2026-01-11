#!/bin/bash

# Silaimart EC2 Deployment Script
# Run this script on your EC2 instance

echo "🚀 Starting Silaimart deployment..."

# Update system
sudo yum update -y

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install nginx
sudo yum install -y nginx

# Create app directory
sudo mkdir -p /var/www/silaimart
sudo chown ec2-user:ec2-user /var/www/silaimart

# Copy application files (assuming you've uploaded them)
cp -r * /var/www/silaimart/

# Navigate to app directory
cd /var/www/silaimart

# Install dependencies
npm install

# Build the application
npm run build

# Configure nginx
sudo tee /etc/nginx/conf.d/silaimart.conf > /dev/null <<EOF
server {
    listen 80;
    server_name silaimart.com www.silaimart.com;
    
    root /var/www/silaimart/build;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Start and enable nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Configure firewall
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

echo "✅ Silaimart deployment completed!"
echo "🌐 Your website should be accessible at http://your-ec2-ip"
echo "📝 Don't forget to:"
echo "   - Point your domain silaimart.com to your EC2 IP"
echo "   - Set up SSL certificate for HTTPS"