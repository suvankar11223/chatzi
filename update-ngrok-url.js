#!/usr/bin/env node

/**
 * Script to automatically update ngrok URL in frontend
 * Usage: node update-ngrok-url.js <ngrok-url>
 * Example: node update-ngrok-url.js https://abc123.ngrok-free.app
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('❌ Error: Please provide ngrok URL');
  console.log('');
  console.log('Usage: node update-ngrok-url.js <ngrok-url>');
  console.log('Example: node update-ngrok-url.js https://abc123.ngrok-free.app');
  console.log('');
  console.log('To get your ngrok URL:');
  console.log('1. Make sure ngrok is running: ngrok http 3000');
  console.log('2. Look for "Forwarding" line in ngrok terminal');
  console.log('3. Copy the HTTPS URL');
  process.exit(1);
}

const ngrokUrl = args[0].trim();

// Validate URL
if (!ngrokUrl.startsWith('http://') && !ngrokUrl.startsWith('https://')) {
  console.log('❌ Error: URL must start with http:// or https://');
  console.log('You provided:', ngrokUrl);
  process.exit(1);
}

// Remove trailing slash if present
const cleanUrl = ngrokUrl.replace(/\/$/, '');

// Path to network.ts
const networkFilePath = path.join(__dirname, 'frontend', 'utils', 'network.ts');

if (!fs.existsSync(networkFilePath)) {
  console.log('❌ Error: Could not find frontend/utils/network.ts');
  console.log('Make sure you run this script from the project root directory');
  process.exit(1);
}

// Read file
let content = fs.readFileSync(networkFilePath, 'utf8');

// Replace ngrok URL
const regex = /const NGROK_URL = ".*?";/;
const newLine = `const NGROK_URL = "${cleanUrl}";`;

if (!regex.test(content)) {
  console.log('❌ Error: Could not find NGROK_URL in network.ts');
  console.log('Make sure the file has the correct format');
  process.exit(1);
}

content = content.replace(regex, newLine);

// Write file
fs.writeFileSync(networkFilePath, content, 'utf8');

console.log('✅ Success! ngrok URL updated');
console.log('');
console.log('New URL:', cleanUrl);
console.log('File updated:', networkFilePath);
console.log('');
console.log('Next steps:');
console.log('1. Restart Expo: cd frontend && npx expo start -c');
console.log('2. Reload your app');
console.log('');
