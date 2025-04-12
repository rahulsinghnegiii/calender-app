/**
 * Ping Service for Render Free Tier
 * 
 * This script will ping the backend service every 14 minutes to prevent 
 * it from going to sleep on Render's free tier.
 */

const https = require('https');
const http = require('http');

// Backend URL to ping (change this to your actual deployed backend URL)
const BACKEND_URL = process.env.BACKEND_URL || 'https://calendar-app-backend.onrender.com';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes in milliseconds
const PING_ENDPOINTS = ['/api/health', '/api/debug/status'];

// Function to ping the backend
const pingBackend = () => {
  const now = new Date().toISOString();
  console.log(`[${now}] Pinging backend service to keep it alive...`);
  
  // Randomly choose an endpoint to ping
  const endpoint = PING_ENDPOINTS[Math.floor(Math.random() * PING_ENDPOINTS.length)];
  const url = `${BACKEND_URL}${endpoint}`;
  console.log(`Pinging ${url}`);
  
  // Select the appropriate library based on URL protocol
  const client = url.startsWith('https') ? https : http;
  
  const req = client.get(url, (res) => {
    const { statusCode } = res;
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        // Try to parse the response as JSON
        const responseData = JSON.parse(data);
        console.log(`Backend responded with status ${statusCode}`);
        console.log(`Database connected: ${responseData.databaseConnected}`);
      } catch (e) {
        console.log(`Backend responded with status ${statusCode} (raw response)`);
      }
      console.log(`Next ping scheduled in ${PING_INTERVAL/60000} minutes`);
    });
  });
  
  req.on('error', (error) => {
    console.error(`Error pinging backend: ${error.message}`);
  });
  
  req.end();
};

// Ping immediately on startup
pingBackend();

// Schedule regular pings
setInterval(pingBackend, PING_INTERVAL);

console.log(`Ping service started. Will ping ${BACKEND_URL} every ${PING_INTERVAL/60000} minutes.`);

// Keep the script running
process.on('SIGINT', () => {
  console.log('Ping service stopped.');
  process.exit(0);
});

// Keep the process running
process.stdin.resume(); 