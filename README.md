# Silaimart - Premium Sculptures Website

A modern React.js website for Silaimart sculpture shop with responsive design and EC2 deployment configuration.

## Features

- 🎨 Modern, responsive design
- 🏛️ Sculpture-focused content
- 📱 Mobile-friendly interface
- 🚀 EC2 deployment ready
- ⚡ Fast loading with optimized assets

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```
   
   Visit `http://localhost:3000` to view the website.

3. **Build for production:**
   ```bash
   npm run build
   ```

## EC2 Deployment

### Prerequisites
- EC2 instance (Amazon Linux 2)
- Domain pointed to EC2 IP address
- SSH access to EC2 instance

### Deployment Steps

1. **Upload files to EC2:**
   ```bash
   scp -r * ec2-user@your-ec2-ip:/home/ec2-user/silaimart/
   ```

2. **SSH into EC2 and run deployment script:**
   ```bash
   ssh ec2-user@your-ec2-ip
   cd silaimart
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Configure domain:**
   - Point silaimart.com to your EC2 IP address
   - Set up SSL certificate (recommended: Let's Encrypt)

## Website Sections

- **Header:** Navigation with Silaimart branding
- **Hero:** Eye-catching introduction to sculptures
- **Features:** Sculpture collection highlights
- **About:** Company information
- **Footer:** Contact details (silaimartindia@gmail.com)

## Contact

- **Email:** silaimartindia@gmail.com
- **Website:** silaimart.com

## License

© 2024 Silaimart. All rights reserved.