// Custom build script for Render deployment
const { execSync } = require('child_process');

console.log('Starting Render build process...');

try {
  // Install dependencies for the backend
  console.log('Installing backend dependencies...');
  execSync('cd backend && npm install --production', { stdio: 'inherit' });
  
  console.log('Render build completed successfully!');
} catch (error) {
  console.error('Render build failed:', error);
  process.exit(1);
} 