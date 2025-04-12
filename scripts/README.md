# JawaStock Deployment Tools

A suite of interactive tools to help with deployment, monitoring, and troubleshooting of the JawaStock application on Cloudflare Pages.

## Getting Started

First, install the required dependencies:

```bash
npm install chalk readline-sync
```

Then run the main tools manager:

```bash
node scripts/deployment-tools.js
```

## Available Tools

### 1. Domain Verification Helper

Verifies your domain and SSL configuration for Cloudflare Pages.

- Checks DNS records
- Verifies SSL certificate
- Tests connectivity
- Provides troubleshooting steps

```bash
node scripts/domain-helper.js
```

### 2. Visual DNS Configuration Wizard

Helps you create and configure DNS records for different providers.

- Generates DNS configuration instructions
- Supports multiple DNS providers
- Creates visual tables of required records
- Saves configuration to a file for reference

```bash
node scripts/dns-wizard.js
```

### 3. Deployment Health Monitoring

Monitors the health of your deployment and sends notifications on issues.

- Checks endpoint health at regular intervals
- Records health metrics and logs
- Provides notification options (console, logs, optional Slack and email)
- Configurable check intervals and endpoints

```bash
node scripts/deployment-health.js
```

### 4. One-click Error Diagnosis

Analyzes deployment errors and provides solutions.

- Checks site connectivity
- Identifies common error patterns
- Provides suggestions for fixing issues
- Verifies configuration files

```bash
node scripts/error-diagnosis.js
```

### 5. Interactive Deployment Dashboard

Visualizes deployment status and health metrics.

- Real-time status of multiple endpoints
- Historical data visualization
- Interactive console-based dashboard
- Configurable refresh interval and endpoints

```bash
node scripts/deployment-dashboard.js
```

## Integration with CI/CD

These tools can be integrated with your CI/CD pipeline:

1. Add the relevant scripts to your GitHub Actions workflow
2. Run health checks after deployment
3. Set up notifications for deployment issues

Example GitHub Actions step:

```yaml
- name: Verify deployment health
  run: node scripts/deployment-health.js
  env:
    DOMAIN: jawastock.pages.dev
    SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
```

## Troubleshooting

If you're experiencing issues with the deployment tools:

1. Ensure Node.js is installed (version 14+)
2. Check that you have the required dependencies installed
3. Verify you're running the scripts from the project root directory
4. Check permissions (`chmod +x scripts/*.js` may be needed on Linux/Mac)

## Contributing

Feel free to extend these tools with additional features:

1. Add more diagnostic capabilities
2. Implement additional notification channels
3. Create visualizations for deployment metrics
4. Add support for more DNS providers

## License

These tools are part of the JawaStock project and are subject to its licensing.