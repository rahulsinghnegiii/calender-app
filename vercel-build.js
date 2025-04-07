// This is a custom build script for Vercel
const fs = require('fs');
const path = require('path');

// Function to modify package.json to ensure React 18 is used
function ensureReact18() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Force React 18
    packageJson.dependencies.react = "^18.2.0";
    packageJson.dependencies["react-dom"] = "^18.2.0";
    
    // Update devDependencies as well if they exist
    if (packageJson.devDependencies) {
      if (packageJson.devDependencies["@types/react"]) {
        packageJson.devDependencies["@types/react"] = "^18.2.64";
      }
      if (packageJson.devDependencies["@types/react-dom"]) {
        packageJson.devDependencies["@types/react-dom"] = "^18.2.21";
      }
    }
    
    // Write changes back to package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Successfully updated package.json to use React 18');
  } catch (error) {
    console.error('Error updating package.json:', error);
  }
}

// Run the modification
ensureReact18();

// Execute normal build process
const { execSync } = require('child_process');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
