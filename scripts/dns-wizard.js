#!/usr/bin/env node

/**
 * JawaStock Visual DNS Configuration Wizard
 * - Helps create DNS configuration for different providers
 * - Generates visual DNS record instructions
 * - Provides verification steps
 */

const readline = require('readline');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Available DNS providers
const dnsProviders = [
  'Cloudflare',
  'GoDaddy',
  'Namecheap',
  'Google Domains',
  'AWS Route 53',
  'DigitalOcean',
  'Other'
];

// Cloudflare Pages DNS records (example)
const cloudflarePagesDnsRecords = [
  { type: 'CNAME', name: '@', value: '{username}.pages.dev', ttl: 'Auto' },
  { type: 'CNAME', name: 'www', value: '@', ttl: 'Auto' },
  { type: 'TXT', name: '_cloudflare', value: 'verify={verification-code}', ttl: 'Auto' }
];

console.log(chalk.bold.blue('=== JawaStock Visual DNS Configuration Wizard ==='));
console.log('This wizard will help you set up DNS records for your domain.\n');

// Ask for domain
rl.question(chalk.green('Enter your domain (e.g., jawastock.com): '), (domain) => {
  if (!domain) {
    console.log(chalk.red('Please provide a valid domain.'));
    rl.close();
    return;
  }

  // Ask for Cloudflare Pages project name
  rl.question(chalk.green('Enter your Cloudflare Pages project name (e.g., jawastock): '), (projectName) => {
    // Ask for DNS provider
    console.log(chalk.yellow('\nSupported DNS providers:'));
    dnsProviders.forEach((provider, index) => {
      console.log(`${index + 1}. ${provider}`);
    });

    rl.question(chalk.green('\nSelect your DNS provider (enter number): '), (providerIndex) => {
      const selectedProvider = dnsProviders[parseInt(providerIndex) - 1] || 'Other';
      
      console.log(chalk.blue(`\nGenerating DNS configuration for ${domain} with ${selectedProvider}...\n`));
      
      // Generate instructions based on provider
      console.log(chalk.bold.yellow('=== DNS Records ==='));
      console.log(chalk.bold('Required Records:'));
      
      // Instructions vary by provider
      if (selectedProvider === 'Cloudflare') {
        console.log(`
  1. Login to your Cloudflare dashboard
  2. Select your domain: ${domain}
  3. Go to DNS > Records
  4. Add these records:
  
     | Type  | Name | Content               | TTL  |
     |-------|------|------------------------|------|
     | CNAME | @    | ${projectName}.pages.dev | Auto |
     | CNAME | www  | ${projectName}.pages.dev | Auto |
        `);
      } else {
        console.log(`
  Add these records to your ${selectedProvider} DNS configuration:
  
     | Type  | Host/Name | Points to/Value       | TTL    |
     |-------|-----------|------------------------|--------|
     | CNAME | @         | ${projectName}.pages.dev | 3600   |
     | CNAME | www       | ${projectName}.pages.dev | 3600   |
        `);
      }
      
      console.log(chalk.bold('\nVerification Records (if required):'));
      console.log(`
     | Type | Host/Name   | Points to/Value       | TTL    |
     |------|-------------|------------------------|--------|
     | TXT  | _cloudflare | provided by Cloudflare | 3600   |
      `);
      
      console.log(chalk.bold.yellow('\n=== Next Steps ==='));
      console.log(`
  1. Add the DNS records above to your ${selectedProvider} account
  2. Wait for DNS propagation (can take up to 48 hours)
  3. Run the domain-helper.js script to verify your setup:
     
     $ node scripts/domain-helper.js
  
  4. In your Cloudflare Pages project, add your custom domain:
     - Go to your project > Custom domains
     - Click "Set up a custom domain"
     - Enter: ${domain}
     - Follow the verification steps
      `);

      // Ask if the user wants to save these instructions
      rl.question(chalk.green('\nDo you want to save these instructions to a file? (y/n): '), (saveAnswer) => {
        if (saveAnswer.toLowerCase() === 'y') {
          const instructionsDir = path.join(process.cwd(), 'dns-instructions');
          
          // Create directory if it doesn't exist
          if (!fs.existsSync(instructionsDir)){
            fs.mkdirSync(instructionsDir, { recursive: true });
          }
          
          const fileName = `${domain.replace(/[^a-z0-9]/gi, '-')}-dns-config.md`;
          const filePath = path.join(instructionsDir, fileName);
          
          // Generate Markdown content
          const markdownContent = `# DNS Configuration for ${domain}

## Provider: ${selectedProvider}
## Cloudflare Pages Project: ${projectName}

## Required DNS Records

| Type  | Host/Name | Points to/Value       | TTL    |
|-------|-----------|------------------------|--------|
| CNAME | @         | ${projectName}.pages.dev | 3600   |
| CNAME | www       | ${projectName}.pages.dev | 3600   |

## Verification Records (if required)

| Type | Host/Name   | Points to/Value       | TTL    |
|------|-------------|------------------------|--------|
| TXT  | _cloudflare | provided by Cloudflare | 3600   |

## Next Steps

1. Add the DNS records above to your ${selectedProvider} account
2. Wait for DNS propagation (can take up to 48 hours)
3. Run the domain-helper.js script to verify your setup:
   
   \`\`\`bash
   node scripts/domain-helper.js
   \`\`\`

4. In your Cloudflare Pages project, add your custom domain:
   - Go to your project > Custom domains
   - Click "Set up a custom domain"
   - Enter: ${domain}
   - Follow the verification steps

## Notes

- DNS propagation can take 24-48 hours
- SSL certificate provisioning is automatic with Cloudflare Pages
- For issues, check your Cloudflare Pages project's custom domains section
`;
          
          // Write to file
          fs.writeFileSync(filePath, markdownContent);
          console.log(chalk.green(`\nInstructions saved to: ${filePath}`));
        }
        
        console.log(chalk.bold.blue('\n=== Configuration Complete ==='));
        console.log('Follow the instructions above to configure your DNS records.');
        rl.close();
      });
    });
  });
});

// Add exit handler
rl.on('close', () => {
  console.log(chalk.blue('\nThank you for using JawaStock Visual DNS Configuration Wizard!'));
  process.exit(0);
});