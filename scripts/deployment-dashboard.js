#!/usr/bin/env node

/**
 * JawaStock Interactive Deployment Status Dashboard
 * - Visualizes deployment status
 * - Tracks health metrics
 * - Provides interactive console-based dashboard
 */

const chalk = require('chalk');
const readline = require('readline');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuration
let domain = 'jawastock.pages.dev'; // Default domain
let endpoints = [
  { path: '/', name: 'Home Page' },
  { path: '/api/health', name: 'API Health' },
  { path: '/api/assets', name: 'Assets API' }
];
let refreshInterval = 30; // seconds
let running = true;
let lastResults = [];
let startTime = new Date();
let uptimePercentage = 100;
let totalChecks = 0;
let successfulChecks = 0;

// Header display function
function displayHeader() {
  console.clear();
  console.log(chalk.bold.blue('================================================================='));
  console.log(chalk.bold.blue('          JawaStock Interactive Deployment Status Dashboard       '));
  console.log(chalk.bold.blue('================================================================='));
  console.log('');
  console.log(chalk.bold(`Domain: ${domain}`));
  
  // Calculate uptime
  const uptime = Math.floor((new Date() - startTime) / 1000);
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;
  
  console.log(chalk.bold(`Dashboard Running: ${hours}h ${minutes}m ${seconds}s`));
  console.log(chalk.bold(`Uptime: ${uptimePercentage.toFixed(2)}%`));
  console.log('');
  console.log(chalk.bold.yellow('Press "q" to quit, "r" to refresh manually, "c" to change configuration'));
  console.log('');
}

// Function to check endpoint health
function checkEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const url = `https://${domain}${endpoint.path}`;
    
    const req = https.request(url, { method: 'GET', timeout: 10000 }, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          name: endpoint.name,
          path: endpoint.path,
          statusCode: res.statusCode,
          responseTime: responseTime,
          contentType: res.headers['content-type'] || 'unknown',
          contentLength: data.length,
          timestamp: new Date().toISOString(),
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });
    
    req.on('error', (e) => {
      resolve({
        name: endpoint.name,
        path: endpoint.path,
        error: e.message,
        timestamp: new Date().toISOString(),
        success: false
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: endpoint.name,
        path: endpoint.path,
        error: 'Request timed out',
        timestamp: new Date().toISOString(),
        success: false
      });
    });
    
    req.end();
  });
}

// Function to display status indicators
function getStatusIndicator(result) {
  if (result.error) {
    return chalk.red('✖');
  }
  
  if (result.statusCode >= 200 && result.statusCode < 300) {
    return chalk.green('✓');
  } else if (result.statusCode >= 300 && result.statusCode < 400) {
    return chalk.blue('→');
  } else if (result.statusCode >= 400 && result.statusCode < 500) {
    return chalk.yellow('!');
  } else if (result.statusCode >= 500) {
    return chalk.red('✖');
  }
  
  return chalk.gray('?');
}

// Function to display response time with color coding
function getResponseTimeDisplay(responseTime) {
  if (!responseTime) return chalk.gray('N/A');
  
  if (responseTime < 300) {
    return chalk.green(`${responseTime}ms`);
  } else if (responseTime < 1000) {
    return chalk.yellow(`${responseTime}ms`);
  } else {
    return chalk.red(`${responseTime}ms`);
  }
}

// Function to display the dashboard
function displayDashboard() {
  displayHeader();
  
  // Display current status
  console.log(chalk.bold('Current Status:'));
  console.log('');
  
  console.log(chalk.bold('  Status | Endpoint              | Response Time | Status Code | Last Checked'));
  console.log('  ' + '-'.repeat(75));
  
  lastResults.forEach(result => {
    const status = getStatusIndicator(result);
    const name = result.name.padEnd(22, ' ');
    const responseTime = getResponseTimeDisplay(result.responseTime);
    const statusCode = result.statusCode ? `${result.statusCode}`.padEnd(10, ' ') : 'ERROR     ';
    const timestamp = new Date(result.timestamp).toLocaleTimeString();
    
    console.log(`  ${status}      | ${name} | ${responseTime.padEnd(12, ' ')} | ${statusCode} | ${timestamp}`);
  });
  
  console.log('');
  
  // Display historical data if available
  if (fs.existsSync(path.join(process.cwd(), 'deployment-logs', 'health-checks.log'))) {
    try {
      const logContent = fs.readFileSync(path.join(process.cwd(), 'deployment-logs', 'health-checks.log'), 'utf8');
      const logLines = logContent.split('\n').filter(line => line.trim() !== '');
      
      if (logLines.length > 0) {
        console.log(chalk.bold('Recent History:'));
        console.log('');
        
        // Display last 5 log entries
        const lastEntries = logLines.slice(-5);
        
        lastEntries.forEach(entry => {
          const parts = entry.split('|');
          if (parts.length >= 4) {
            const timestamp = new Date(parts[0]).toLocaleTimeString();
            const status = parts[1];
            const statusCode = parts[2];
            const responseTime = parts[3];
            const endpoint = parts[4] || 'unknown';
            
            let statusDisplay;
            switch(status) {
              case 'HEALTHY':
                statusDisplay = chalk.green('HEALTHY  ');
                break;
              case 'REDIRECT':
                statusDisplay = chalk.blue('REDIRECT ');
                break;
              case 'CLIENT ERROR':
                statusDisplay = chalk.yellow('CLIENT ERR');
                break;
              case 'SERVER ERROR':
                statusDisplay = chalk.red('SERVER ERR');
                break;
              case 'ERROR':
                statusDisplay = chalk.red('ERROR    ');
                break;
              default:
                statusDisplay = chalk.gray('UNKNOWN  ');
            }
            
            console.log(`  ${timestamp} | ${statusDisplay} | ${statusCode.padEnd(4, ' ')} | ${responseTime.padEnd(7, ' ')} | ${endpoint}`);
          }
        });
        
        console.log('');
      }
    } catch (e) {
      // Silent fail if log reading fails
    }
  }
  
  // Display refresh information
  console.log(chalk.gray(`Auto-refreshing every ${refreshInterval} seconds. Last update: ${new Date().toLocaleTimeString()}`));
}

// Function to check all endpoints
async function checkAllEndpoints() {
  const promises = endpoints.map(endpoint => checkEndpoint(endpoint));
  const results = await Promise.all(promises);
  
  // Update stats
  totalChecks += results.length;
  successfulChecks += results.filter(r => r.success).length;
  uptimePercentage = (successfulChecks / Math.max(1, totalChecks)) * 100;
  
  lastResults = results;
  displayDashboard();
  
  // Log results
  const logsDir = path.join(process.cwd(), 'deployment-logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  results.forEach(result => {
    const logFile = path.join(logsDir, 'dashboard-checks.log');
    let status = 'UNKNOWN';
    
    if (result.error) {
      status = 'ERROR';
    } else if (result.statusCode >= 200 && result.statusCode < 300) {
      status = 'HEALTHY';
    } else if (result.statusCode >= 300 && result.statusCode < 400) {
      status = 'REDIRECT';
    } else if (result.statusCode >= 400 && result.statusCode < 500) {
      status = 'CLIENT ERROR';
    } else if (result.statusCode >= 500) {
      status = 'SERVER ERROR';
    }
    
    const logEntry = `${result.timestamp}|${status}|${result.statusCode || 'N/A'}|${result.responseTime || 'N/A'}|${result.path}|${result.error || ''}\n`;
    fs.appendFileSync(logFile, logEntry);
  });
}

// Function to change configuration
function changeConfiguration() {
  console.clear();
  console.log(chalk.bold.blue('=== JawaStock Deployment Dashboard Configuration ==='));
  console.log('');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question(chalk.green(`Enter domain to monitor (currently: ${domain}): `), (answer) => {
    if (answer) domain = answer;
    
    rl.question(chalk.green(`Enter refresh interval in seconds (currently: ${refreshInterval}): `), (answer) => {
      if (answer && !isNaN(parseInt(answer))) {
        refreshInterval = parseInt(answer);
      }
      
      console.log(chalk.yellow('\nConfiguring endpoints to monitor:'));
      console.log('Current endpoints:');
      endpoints.forEach((endpoint, index) => {
        console.log(`${index + 1}. ${endpoint.name} (${endpoint.path})`);
      });
      
      rl.question(chalk.green('\nWould you like to modify endpoints? (y/n): '), (answer) => {
        if (answer.toLowerCase() === 'y') {
          modifyEndpoints(rl, 0, []);
        } else {
          rl.close();
          displayDashboard();
        }
      });
    });
  });
  
  function modifyEndpoints(rl, index, newEndpoints) {
    if (index === 0) {
      rl.question(chalk.green('\nHow many endpoints would you like to monitor? '), (answer) => {
        const count = parseInt(answer);
        if (isNaN(count) || count < 1) {
          console.log(chalk.red('Invalid number, keeping current endpoints.'));
          rl.close();
          displayDashboard();
          return;
        }
        
        modifyEndpoints(rl, 1, []);
      });
    } else if (newEndpoints.length < 5) { // Limit to 5 endpoints
      rl.question(chalk.green(`\nEnter endpoint #${newEndpoints.length + 1} path (e.g., /api/users): `), (path) => {
        if (!path) {
          console.log(chalk.red('Invalid path, skipping.'));
          modifyEndpoints(rl, index, newEndpoints);
          return;
        }
        
        rl.question(chalk.green(`Enter name for this endpoint: `), (name) => {
          if (!name) name = path;
          
          newEndpoints.push({ path, name });
          
          rl.question(chalk.green('Add another endpoint? (y/n): '), (answer) => {
            if (answer.toLowerCase() === 'y' && newEndpoints.length < 5) {
              modifyEndpoints(rl, index, newEndpoints);
            } else {
              if (newEndpoints.length > 0) {
                endpoints = newEndpoints;
              }
              rl.close();
              displayDashboard();
            }
          });
        });
      });
    } else {
      console.log(chalk.yellow('Maximum number of endpoints (5) reached.'));
      endpoints = newEndpoints;
      rl.close();
      displayDashboard();
    }
  }
}

// Handle keyboard input
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

// Main function
async function main() {
  // Ensure logs directory exists
  const logsDir = path.join(process.cwd(), 'deployment-logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Initial check
  await checkAllEndpoints();
  
  // Set up interval for auto-refresh
  const intervalId = setInterval(async () => {
    if (running) {
      await checkAllEndpoints();
    }
  }, refreshInterval * 1000);
  
  // Handle keyboard input
  process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
      console.log(chalk.blue('\nExiting dashboard...'));
      process.exit(0);
    } else if (key.name === 'q') {
      console.log(chalk.blue('\nExiting dashboard...'));
      process.exit(0);
    } else if (key.name === 'r') {
      checkAllEndpoints();
    } else if (key.name === 'c') {
      changeConfiguration();
    }
  });
  
  // Cleanup on exit
  process.on('exit', () => {
    clearInterval(intervalId);
    console.log(chalk.blue('\nThank you for using JawaStock Deployment Dashboard!'));
  });
}

// Display welcome message and instructions
console.clear();
console.log(chalk.bold.blue('=== JawaStock Interactive Deployment Status Dashboard ==='));
console.log('');
console.log('Starting dashboard...');
console.log('');
console.log(chalk.yellow('Controls:'));
console.log('  - Press "q" to quit the dashboard');
console.log('  - Press "r" to refresh manually');
console.log('  - Press "c" to change configuration');
console.log('');

// Start the dashboard
main().catch(error => {
  console.error('Error in dashboard:', error);
  process.exit(1);
});