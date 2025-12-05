#!/usr/bin/env node

/**
 * Health Check Test Script
 * 
 * This script tests the backend API health endpoint and verifies CORS configuration.
 * 
 * Usage:
 *   node test-health.js [API_URL]
 * 
 * Example:
 *   node test-health.js https://klaviyo-metric-dashboard-production.up.railway.app
 */

const https = require('https');
const http = require('http');

const API_URL = process.argv[2] || 'http://localhost:3001';

console.log('🔍 Testing Backend API Health...\n');
console.log(`API URL: ${API_URL}\n`);

// Test health endpoint
function testHealth() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}/health`);
    const client = url.protocol === 'https:' ? https : http;
    
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    console.log('📡 Testing /health endpoint...');
    
    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log('✅ Health check passed!');
            console.log('Response:', JSON.stringify(json, null, 2));
            resolve(json);
          } catch (e) {
            console.error('❌ Failed to parse response:', e.message);
            reject(e);
          }
        } else {
          console.error(`❌ Health check failed with status ${res.statusCode}`);
          console.error('Response:', data);
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Test CORS preflight
function testCORS() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}/api/admin/clients`);
    const client = url.protocol === 'https:' ? https : http;
    
    const options = {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://klaviyo-metric-dashboard.vercel.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    };

    console.log('\n📡 Testing CORS preflight (OPTIONS request)...');
    
    const req = client.request(url, options, (res) => {
      const corsHeaders = {
        'access-control-allow-origin': res.headers['access-control-allow-origin'],
        'access-control-allow-methods': res.headers['access-control-allow-methods'],
        'access-control-allow-headers': res.headers['access-control-allow-headers'],
        'access-control-allow-credentials': res.headers['access-control-allow-credentials']
      };

      console.log('CORS Headers:', JSON.stringify(corsHeaders, null, 2));
      
      if (res.statusCode === 200 || res.statusCode === 204) {
        if (corsHeaders['access-control-allow-origin']) {
          console.log('✅ CORS preflight passed!');
          resolve(corsHeaders);
        } else {
          console.log('⚠️  CORS preflight returned 200 but missing CORS headers');
          resolve(corsHeaders);
        }
      } else {
        console.error(`❌ CORS preflight failed with status ${res.statusCode}`);
        reject(new Error(`Status ${res.statusCode}`));
      }
    });

    req.on('error', (error) => {
      console.error('❌ CORS test failed:', error.message);
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Test actual GET request
function testGetClients() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}/api/admin/clients`);
    const client = url.protocol === 'https:' ? https : http;
    
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://klaviyo-metric-dashboard.vercel.app'
      }
    };

    console.log('\n📡 Testing GET /api/admin/clients...');
    
    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log('✅ GET request successful!');
            console.log('Response:', JSON.stringify(json, null, 2));
            resolve(json);
          } catch (e) {
            console.log('✅ GET request successful (non-JSON response)');
            console.log('Response:', data);
            resolve(data);
          }
        } else {
          console.error(`❌ GET request failed with status ${res.statusCode}`);
          console.error('Response:', data);
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ GET request failed:', error.message);
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  try {
    await testHealth();
    await testCORS();
    await testGetClients();
    
    console.log('\n✅ All tests passed!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

runTests();

