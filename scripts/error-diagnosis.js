#!/usr/bin/env node

/**
 * JawaStock One-click Error Diagnosis Tool
 * - Analyzes deployment errors
 * - Provides solution recommendations
 * - Supports common error patterns
 */

const chalk = require('chalk');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Header
console.log(chalk.bold.blue('=== JawaStock One-click Error Diagnosis Tool ==='));
console.log('This tool analyzes deployment errors and provides solutions.\n');

// Common error patterns and solutions
const errorPatterns = [
  {
    pattern: /404 not found/i,
    name: 'Page Not Found (404)',
    description: 'The requested page or resource could not be found.',
    possibleCauses: [
      'Missing or incorrect routes configuration',
      'File not included in the build output',
      'Incorrect deployment settings',
      'DNS configuration issues'
    ],
    solutions: [
      'Check your routes configuration in _routes.json',
      'Verify file exists in your build output (dist directory)',
      'Ensure all required build assets are being published',
      'Verify DNS records point to the correct Cloudflare Pages domain'
    ]
  },
  {
    pattern: /500 internal server error/i,
    name: 'Internal Server Error (500)',
    description: 'The server encountered an unexpected condition that prevented it from fulfilling the request.',
    possibleCauses: [
      'Runtime error in server-side code',
      'Database connection issues',
      'Missing environment variables',
      'Resource limitations'
    ],
    solutions: [
      'Check server logs for detailed error messages',
      'Verify all required environment variables are set in Cloudflare Pages',
      'Test database connectivity',
      'Simplify complex server-side operations'
    ]
  },
  {
    pattern: /mixed content/i,
    name: 'Mixed Content Issues',
    description: 'The page includes resources via HTTP instead of HTTPS, causing security warnings.',
    possibleCauses: [
      'Hard-coded HTTP URLs in your code',
      'Third-party resources loading over HTTP',
      'Relative URLs not properly handling HTTPS'
    ],
    solutions: [
      'Use protocol-relative URLs (//example.com) or HTTPS URLs',
      'Update Content-Security-Policy headers',
      'Replace HTTP resources with HTTPS alternatives',
      'Use the "upgrade-insecure-requests" CSP directive'
    ]
  },
  {
    pattern: /CORS|cross.origin/i,
    name: 'CORS (Cross-Origin Resource Sharing) Issues',
    description: 'The browser is blocking cross-origin requests due to CORS policy.',
    possibleCauses: [
      'Missing CORS headers on API responses',
      'Incorrect CORS configuration',
      'Making requests to different domains without proper setup'
    ],
    solutions: [
      'Update _headers file to include proper CORS headers',
      'Configure your API to return Access-Control-Allow-Origin header',
      'Add appropriate preflight response handlers for OPTIONS requests',
      'Check your Cloudflare Pages Functions configuration'
    ]
  },
  {
    pattern: /certificate|SSL|TLS/i,
    name: 'SSL/TLS Certificate Issues',
    description: 'Problems with the SSL/TLS certificate affecting secure connections.',
    possibleCauses: [
      'Certificate not yet provisioned',
      'Certificate verification issues',
      'DNS configuration not fully propagated',
      'Certificate authority problems'
    ],
    solutions: [
      'Wait for Cloudflare to provision the certificate (can take up to 24 hours)',
      'Verify DNS records are correctly set up',
      'Check if your domain's nameservers are properly configured',
      'Remove any existing SSL certificates from other providers for this domain'
    ]
  },
  {
    pattern: /build failed|compilation error/i,
    name: 'Build Process Failures',
    description: 'The deployment build process failed to complete successfully.',
    possibleCauses: [
      'Code syntax errors',
      'Missing dependencies',
      'Incompatible package versions',
      'Environment configuration issues',
      'Memory or resource limitations during build'
    ],
    solutions: [
      'Check build logs for specific error messages',
      'Verify all dependencies are properly listed in package.json',
      'Ensure build commands in build.sh are correct',
      'Test the build process locally before deploying',
      'Incrementally add code to identify problematic components'
    ]
  },
  {
    pattern: /DNS|domain/i,
    name: 'DNS Configuration Issues',
    description: 'Problems with the domain's DNS configuration affecting site availability.',
    possibleCauses: [
      'Incorrect DNS records',
      'DNS propagation delays',
      'Missing required records',
      'Nameserver configuration issues'
    ],
    solutions: [
      'Verify A or CNAME records point to your Cloudflare Pages domain',
      'Use our DNS Configuration Wizard (scripts/dns-wizard.js)',
      'Allow 24-48 hours for DNS changes to fully propagate',
      'If using Cloudflare, ensure the domain is using Cloudflare nameservers'
    ]
  }
];

// Function to analyze error logs
function analyzeErrorLogs(logsPath) {
  try {
    if (!fs.existsSync(logsPath)) {
      console.log(chalk.yellow(`\nLog file not found: ${logsPath}`));
      return [];
    }
    
    const logContent = fs.readFileSync(logsPath, 'utf8');
    const detectedErrors = [];
    
    // Check against known patterns
    errorPatterns.forEach(errorType => {
      if (errorType.pattern.test(logContent)) {
        detectedErrors.push(errorType);
      }
    });
    
    return detectedErrors;
  } catch (error) {
    console.log(chalk.red(`\nError analyzing logs: ${error.message}`));
    return [];
  }
}

// Function to check site status
function checkSiteStatus(domain) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: domain,
      port: 443,
      path: '/',
      method: 'GET',
      timeout: 10000
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          contentSnippet: data.substring(0, 200) // Just a snippet
        });
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
    
    req.end();
  });
}

// Function to display error diagnosis
function displayErrorDiagnosis(errors) {
  if (errors.length === 0) {
    console.log(chalk.yellow('\nNo specific errors detected from the logs.'));
    return;
  }
  
  console.log(chalk.green(`\nDetected ${errors.length} potential issues:`));
  
  errors.forEach((error, index) => {
    console.log(chalk.bold.yellow(`\n${index + 1}. ${error.name}`));
    console.log(chalk.white(error.description));
    
    console.log(chalk.bold('\nPossible Causes:'));
    error.possibleCauses.forEach(cause => {
      console.log(`  • ${cause}`);
    });
    
    console.log(chalk.bold('\nRecommended Solutions:'));
    error.solutions.forEach(solution => {
      console.log(`  • ${solution}`);
    });
  });
}

// Function to check configuration files
function checkConfigurationFiles() {
  const configFiles = [
    { path: 'functions/_middleware.js', expected: true, description: 'Cloudflare Pages middleware' },
    { path: 'functions/_worker.js', expected: true, description: 'Cloudflare Pages worker script' },
    { path: 'public/_headers', expected: true, description: 'HTTP headers configuration' },
    { path: 'public/_redirects', expected: true, description: 'URL redirects configuration' },
    { path: 'public/_routes.json', expected: true, description: 'Routes configuration' },
    { path: 'cloudflare.toml', expected: true, description: 'Cloudflare Pages configuration' },
    { path: 'build.sh', expected: true, description: 'Build script' },
    { path: '.github/workflows/cloudflare-pages.yml', expected: false, description: 'GitHub Actions workflow (optional)' }
  ];
  
  const issues = [];
  
  configFiles.forEach(file => {
    const exists = fs.existsSync(file.path);
    if (file.expected && !exists) {
      issues.push(`Missing required file: ${file.path} (${file.description})`);
    }
  });
  
  return issues;
}

// Main function
function main() {
  console.log(chalk.yellow('Starting error diagnosis...\n'));
  
  // Step 1: Check configuration files
  console.log(chalk.bold('Checking configuration files...'));
  const configIssues = checkConfigurationFiles();
  
  if (configIssues.length > 0) {
    console.log(chalk.red('\nFound configuration issues:'));
    configIssues.forEach(issue => {
      console.log(`  • ${issue}`);
    });
  } else {
    console.log(chalk.green('  ✓ All required configuration files are present.'));
  }
  
  // Step 2: Ask for the domain to check
  rl.question(chalk.green('\nEnter your deployment domain to check (e.g., jawastock.pages.dev): '), (domain) => {
    if (!domain) {
      console.log(chalk.red('No domain provided. Using default diagnostic mode.'));
      finalizeDiagnosis();
      return;
    }
    
    console.log(chalk.bold(`\nChecking site status for ${domain}...`));
    
    // Check site status
    checkSiteStatus(domain)
      .then(status => {
        // Display status
        const statusColor = status.statusCode >= 200 && status.statusCode < 300 
          ? chalk.green 
          : (status.statusCode >= 300 && status.statusCode < 400 
            ? chalk.blue 
            : chalk.red);
            
        console.log(statusColor(`  ✓ Site responded with status code: ${status.statusCode}`));
        console.log(chalk.gray(`  ✓ Content type: ${status.headers['content-type'] || 'unknown'}`));
        
        // If there's an error status code, analyze it
        if (status.statusCode >= 400) {
          const errors = errorPatterns.filter(error => 
            error.pattern.test(`${status.statusCode}`) || 
            (status.contentSnippet && error.pattern.test(status.contentSnippet))
          );
          
          displayErrorDiagnosis(errors);
        } else {
          console.log(chalk.green('\nYour site appears to be functioning correctly.'));
          console.log('If you\'re still experiencing issues, please check:');
          console.log('  • Cloudflare Pages build logs for warnings');
          console.log('  • Client-side console errors in your browser');
          console.log('  • Backend server logs for API issues');
        }
        
        finalizeDiagnosis();
      })
      .catch(error => {
        console.log(chalk.red(`\nError connecting to ${domain}: ${error.message}`));
        
        // Check if it's a common connection error
        if (error.code === 'ENOTFOUND') {
          console.log(chalk.yellow('\nDiagnosis: DNS resolution failure'));
          console.log('This typically indicates one of these issues:');
          console.log('  • The domain does not exist or is not registered');
          console.log('  • DNS records are not properly configured');
          console.log('  • DNS changes have not fully propagated yet');
          console.log('\nRecommended actions:');
          console.log('  • Use our DNS Configuration Wizard: node scripts/dns-wizard.js');
          console.log('  • Verify domain registration and DNS settings');
          console.log('  • Wait 24-48 hours for DNS propagation to complete');
        } else if (error.code === 'ETIMEDOUT' || error.message.includes('timed out')) {
          console.log(chalk.yellow('\nDiagnosis: Connection timeout'));
          console.log('This typically indicates one of these issues:');
          console.log('  • The server is not responding (possibly down)');
          console.log('  • Network connectivity problems');
          console.log('  • Firewall or security settings blocking the connection');
          console.log('\nRecommended actions:');
          console.log('  • Check if your Cloudflare Pages project is deployed');
          console.log('  • Verify network connectivity and firewall settings');
          console.log('  • Try accessing from a different network');
        } else if (error.message.includes('certificate')) {
          console.log(chalk.yellow('\nDiagnosis: SSL/TLS certificate issues'));
          console.log('This typically indicates one of these issues:');
          console.log('  • SSL certificate not yet provisioned');
          console.log('  • Certificate validation problems');
          console.log('  • Mixed content issues');
          console.log('\nRecommended actions:');
          console.log('  • Wait for Cloudflare to provision the certificate (up to 24 hours)');
          console.log('  • Check your domain\'s DNS configuration');
          console.log('  • Ensure your site only serves content over HTTPS');
        }
        
        finalizeDiagnosis();
      });
  });
}

// Function to wrap up the diagnosis
function finalizeDiagnosis() {
  console.log(chalk.bold.blue('\n=== Additional Diagnostic Steps ==='));
  console.log('1. Check your Cloudflare Pages dashboard for build logs');
  console.log('2. Use the Domain Verification Helper: node scripts/domain-helper.js');
  console.log('3. Monitor site health with: node scripts/deployment-health.js');
  console.log('4. Configure DNS with: node scripts/dns-wizard.js');
  console.log('5. View your browser\'s developer console for client-side errors');
  
  rl.close();
}

// Start the diagnosis
main();

// Add exit handler
rl.on('close', () => {
  console.log(chalk.blue('\nThank you for using JawaStock Error Diagnosis Tool!'));
  process.exit(0);
});