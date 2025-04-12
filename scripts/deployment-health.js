#!/usr/bin/env node

/**
 * JawaStock Deployment Health Notification System
 * - Monitors deployment health
 * - Sends notifications on issues
 * - Provides health status dashboard
 */

const https = require('https');
const chalk = require('chalk');
const readline = require('readline');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const DEFAULT_CHECK_INTERVAL = 15; // minutes
let checkInterval = DEFAULT_CHECK_INTERVAL;
let domain = 'jawastock.pages.dev'; // Default domain
let healthCheckPath = '/api/health'; // Health check endpoint
let notificationsEnabled = true;
let slackWebhook = ''; // Optional Slack webhook URL
let emailRecipient = ''; // Optional email for notifications

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Header
console.log(chalk.bold.blue('=== JawaStock Deployment Health Notification System ==='));
console.log('This tool monitors your deployment and sends notifications on issues.\n');

// Function to check deployment health
function checkDeploymentHealth(domain, path) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const req = https.request({
      hostname: domain,
      port: 443,
      path: path,
      method: 'GET',
      timeout: 10000 // 10s timeout
    }, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        let status = {
          statusCode: res.statusCode,
          responseTime: responseTime,
          headers: res.headers,
          body: data,
          timestamp: new Date().toISOString()
        };
        
        resolve(status);
      });
    });
    
    req.on('error', (e) => {
      reject({
        error: e.message,
        timestamp: new Date().toISOString()
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject({
        error: 'Request timed out',
        timestamp: new Date().toISOString()
      });
    });
    
    req.end();
  });
}

// Function to format health status
function formatHealthStatus(status) {
  if (status.error) {
    return {
      status: 'ERROR',
      message: status.error,
      timestamp: status.timestamp
    };
  }
  
  let statusText;
  if (status.statusCode >= 200 && status.statusCode < 300) {
    statusText = 'HEALTHY';
  } else if (status.statusCode >= 300 && status.statusCode < 400) {
    statusText = 'REDIRECT';
  } else if (status.statusCode >= 400 && status.statusCode < 500) {
    statusText = 'CLIENT ERROR';
  } else if (status.statusCode >= 500) {
    statusText = 'SERVER ERROR';
  } else {
    statusText = 'UNKNOWN';
  }
  
  return {
    status: statusText,
    statusCode: status.statusCode,
    responseTime: status.responseTime + 'ms',
    contentType: status.headers['content-type'] || 'unknown',
    timestamp: status.timestamp
  };
}

// Function to send notification (mock implementation)
function sendNotification(message, type = 'alert') {
  if (!notificationsEnabled) return;
  
  console.log(chalk.yellow(`\n[NOTIFICATION] ${type.toUpperCase()}: ${message}`));
  
  // Log to notifications file
  const notificationsDir = path.join(process.cwd(), 'deployment-logs');
  if (!fs.existsSync(notificationsDir)){
    fs.mkdirSync(notificationsDir, { recursive: true });
  }
  
  const logFile = path.join(notificationsDir, 'notifications.log');
  const logEntry = `${new Date().toISOString()} [${type.toUpperCase()}] ${message}\n`;
  fs.appendFileSync(logFile, logEntry);
  
  // Send to Slack if configured
  if (slackWebhook) {
    console.log(chalk.gray(`Would send to Slack: ${message}`));
    // Actual implementation would post to the webhook
  }
  
  // Send email if configured
  if (emailRecipient) {
    console.log(chalk.gray(`Would send email to ${emailRecipient}: ${message}`));
    // Actual implementation would send an email
  }
}

// Function to start monitoring
function startMonitoring() {
  console.log(chalk.green(`\nStarting deployment health monitoring for https://${domain}${healthCheckPath}`));
  console.log(chalk.green(`Check interval: ${checkInterval} minutes`));
  console.log(chalk.gray('Press Ctrl+C to stop monitoring\n'));
  
  // Initial check
  runHealthCheck();
  
  // Schedule regular checks
  const intervalId = setInterval(runHealthCheck, checkInterval * 60 * 1000);
  
  // Return the interval ID to allow stopping
  return intervalId;
}

// Function to run a health check
function runHealthCheck() {
  const timestamp = new Date().toISOString();
  console.log(chalk.gray(`[${timestamp}] Running health check...`));
  
  checkDeploymentHealth(domain, healthCheckPath)
    .then(status => {
      const formattedStatus = formatHealthStatus(status);
      
      // Print status with appropriate color
      let statusColor;
      switch(formattedStatus.status) {
        case 'HEALTHY':
          statusColor = chalk.green;
          break;
        case 'REDIRECT':
          statusColor = chalk.blue;
          break;
        case 'CLIENT ERROR':
          statusColor = chalk.yellow;
          break;
        case 'SERVER ERROR':
          statusColor = chalk.red;
          break;
        default:
          statusColor = chalk.gray;
      }
      
      console.log(statusColor(`[${formattedStatus.timestamp}] Status: ${formattedStatus.status} (${formattedStatus.statusCode}), Response Time: ${formattedStatus.responseTime}`));
      
      // Send notification for errors
      if (formattedStatus.status === 'SERVER ERROR' || formattedStatus.status === 'CLIENT ERROR') {
        sendNotification(`Deployment health issue: ${formattedStatus.status} (${formattedStatus.statusCode}) for ${domain}${healthCheckPath}`, 'alert');
      }
      
      // Save status to log file
      const logsDir = path.join(process.cwd(), 'deployment-logs');
      if (!fs.existsSync(logsDir)){
        fs.mkdirSync(logsDir, { recursive: true });
      }
      
      const logFile = path.join(logsDir, 'health-checks.log');
      const logEntry = `${formattedStatus.timestamp}|${formattedStatus.status}|${formattedStatus.statusCode || 'N/A'}|${formattedStatus.responseTime || 'N/A'}|${domain}${healthCheckPath}\n`;
      fs.appendFileSync(logFile, logEntry);
    })
    .catch(error => {
      console.log(chalk.red(`[${timestamp}] Error: ${error.error}`));
      sendNotification(`Cannot connect to ${domain}${healthCheckPath}: ${error.error}`, 'critical');
      
      // Save error to log file
      const logsDir = path.join(process.cwd(), 'deployment-logs');
      if (!fs.existsSync(logsDir)){
        fs.mkdirSync(logsDir, { recursive: true });
      }
      
      const logFile = path.join(logsDir, 'health-checks.log');
      const logEntry = `${timestamp}|ERROR|CONNECTION_FAILED|N/A|${domain}${healthCheckPath}|${error.error}\n`;
      fs.appendFileSync(logFile, logEntry);
    });
}

// Main function to configure and start the monitor
function main() {
  // Configure the tool
  rl.question(chalk.green('Enter your deployment domain (default: jawastock.pages.dev): '), (answer) => {
    if (answer) domain = answer;
    
    rl.question(chalk.green(`Enter health check endpoint (default: ${healthCheckPath}): `), (answer) => {
      if (answer) healthCheckPath = answer;
      
      rl.question(chalk.green(`Enter check interval in minutes (default: ${DEFAULT_CHECK_INTERVAL}): `), (answer) => {
        if (answer && !isNaN(answer)) checkInterval = parseInt(answer);
        
        rl.question(chalk.green('Enable notifications? (y/n, default: y): '), (answer) => {
          if (answer.toLowerCase() === 'n') notificationsEnabled = false;
          
          if (notificationsEnabled) {
            rl.question(chalk.green('Enter Slack webhook URL for notifications (optional): '), (answer) => {
              if (answer) slackWebhook = answer;
              
              rl.question(chalk.green('Enter email for notifications (optional): '), (answer) => {
                if (answer) emailRecipient = answer;
                
                rl.close();
                const intervalId = startMonitoring();
                
                // Handle exit
                process.on('SIGINT', () => {
                  clearInterval(intervalId);
                  console.log(chalk.blue('\nStopping deployment health monitoring'));
                  process.exit(0);
                });
              });
            });
          } else {
            rl.close();
            const intervalId = startMonitoring();
            
            // Handle exit
            process.on('SIGINT', () => {
              clearInterval(intervalId);
              console.log(chalk.blue('\nStopping deployment health monitoring'));
              process.exit(0);
            });
          }
        });
      });
    });
  });
}

// Start the application
main();