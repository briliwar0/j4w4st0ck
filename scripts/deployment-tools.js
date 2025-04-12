#!/usr/bin/env node

/**
 * JawaStock Deployment Tools Manager
 * - One-stop access to all deployment tools
 * - Interactive menu
 */

const readline = require('readline');
const chalk = require('chalk');
const { spawn } = require('child_process');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Tools configuration
const tools = [
  {
    id: 'domain-helper',
    name: 'Domain Verification Helper',
    description: 'Verify domain and SSL configuration',
    script: 'domain-helper.js'
  },
  {
    id: 'dns-wizard',
    name: 'Visual DNS Configuration Wizard',
    description: 'Create DNS configuration for your domain',
    script: 'dns-wizard.js'
  },
  {
    id: 'deployment-health',
    name: 'Deployment Health Monitoring',
    description: 'Monitor deployment health and receive notifications',
    script: 'deployment-health.js'
  },
  {
    id: 'error-diagnosis',
    name: 'One-click Error Diagnosis',
    description: 'Analyze and fix deployment errors',
    script: 'error-diagnosis.js'
  },
  {
    id: 'deployment-dashboard',
    name: 'Interactive Deployment Dashboard',
    description: 'Visualize deployment status and metrics',
    script: 'deployment-dashboard.js'
  }
];

// Display header
function displayHeader() {
  console.clear();
  console.log(chalk.bold.blue('================================================================='));
  console.log(chalk.bold.blue('                JawaStock Deployment Tools Manager               '));
  console.log(chalk.bold.blue('================================================================='));
  console.log('');
}

// Display tools menu
function displayMenu() {
  displayHeader();
  
  console.log(chalk.bold('Available Tools:'));
  console.log('');
  
  tools.forEach((tool, index) => {
    console.log(chalk.green(`  ${index + 1}. ${tool.name}`));
    console.log(chalk.gray(`     ${tool.description}`));
    console.log('');
  });
  
  console.log(chalk.yellow('  0. Exit'));
  console.log('');
}

// Run a tool
function runTool(toolId) {
  const tool = tools.find(t => t.id === toolId);
  if (!tool) {
    console.log(chalk.red('Tool not found!'));
    return showMainMenu();
  }
  
  console.log(chalk.yellow(`\nLaunching ${tool.name}...`));
  
  const scriptPath = path.join(__dirname, tool.script);
  const child = spawn('node', [scriptPath], {
    stdio: 'inherit',
    shell: true
  });
  
  child.on('exit', (code) => {
    console.log(chalk.yellow(`\n${tool.name} exited with code ${code}`));
    console.log(chalk.gray('Press Enter to return to the main menu...'));
    
    // Wait for user to press Enter
    process.stdin.once('data', () => {
      showMainMenu();
    });
  });
}

// Show main menu and handle selection
function showMainMenu() {
  displayMenu();
  
  rl.question(chalk.bold('Select a tool (0-5): '), (answer) => {
    const selection = parseInt(answer);
    
    if (selection === 0) {
      rl.close();
      console.log(chalk.blue('\nThank you for using JawaStock Deployment Tools!'));
      return;
    }
    
    if (isNaN(selection) || selection < 1 || selection > tools.length) {
      console.log(chalk.red('\nInvalid selection! Please enter a number between 0 and 5.'));
      // Wait for user acknowledgment
      console.log(chalk.gray('Press Enter to continue...'));
      process.stdin.once('data', () => {
        showMainMenu();
      });
      return;
    }
    
    const selectedTool = tools[selection - 1];
    runTool(selectedTool.id);
  });
}

// Display welcome message
displayHeader();
console.log(chalk.bold('Welcome to the JawaStock Deployment Tools Manager!'));
console.log('');
console.log('This suite of tools will help you:');
console.log('  - Verify and configure your domain');
console.log('  - Monitor your deployment health');
console.log('  - Diagnose and fix deployment issues');
console.log('  - Track deployment metrics');
console.log('');
console.log(chalk.yellow('Press Enter to continue...'));

// Wait for user to press Enter
process.stdin.once('data', () => {
  showMainMenu();
});

// Handle exit
rl.on('close', () => {
  console.log(chalk.blue('\nThank you for using JawaStock Deployment Tools!'));
  process.exit(0);
});