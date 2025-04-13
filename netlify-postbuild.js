// netlify-postbuild.js
// Script yang dijalankan setelah build untuk memastikan file redirects berada di tempat yang benar

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Running post-build script for Netlify...');

// Pastikan file _redirects ada di direktori publish
const redirectsContent = `
# Redirect all routes to index.html for SPA
/*    /index.html   200

# Special handling for error paths
/error-info    /index.html   200
`;
const redirectsPath = path.join(__dirname, 'dist', 'public', '_redirects');

// Tulis file _redirects
fs.writeFileSync(redirectsPath, redirectsContent);
console.log(`Created _redirects file at ${redirectsPath}`);

// Perbaiki index.html untuk deployment
const indexPath = path.join(__dirname, 'dist', 'public', 'index.html');
if (fs.existsSync(indexPath)) {
  console.log('Fixing asset paths in index.html...');
  let indexHtml = fs.readFileSync(indexPath, 'utf8');
  
  // Perbaiki asset paths agar dimulai dari root
  indexHtml = indexHtml.replace(/src="\/assets\//g, 'src="./assets/');
  indexHtml = indexHtml.replace(/href="\/assets\//g, 'href="./assets/');
  
  // Perbaiki script import path
  indexHtml = indexHtml.replace(/src="[^"]*\/main\.[^"]*"/g, (match) => {
    const scriptPath = match.match(/src="([^"]*)"/)[1];
    const fileName = scriptPath.split('/').pop();
    return `src="./assets/${fileName}"`;
  });
  
  // Pastikan base href tersedia
  if (!indexHtml.includes('<base href="/">')) {
    indexHtml = indexHtml.replace('<head>', '<head>\n    <base href="/">');
  }
  
  // Tambahkan fallback script untuk menangani error loading
  if (!indexHtml.includes('window.onerror')) {
    const fallbackScript = `
    <script>
      window.addEventListener('DOMContentLoaded', function() {
        if (document.getElementById('root') && !document.getElementById('root').childNodes.length) {
          setTimeout(function() {
            if (!document.getElementById('root').childNodes.length) {
              console.error('App failed to mount in time. Showing fallback message.');
              const fallbackElement = document.createElement('div');
              fallbackElement.style.padding = '20px';
              fallbackElement.style.margin = '20px';
              fallbackElement.style.textAlign = 'center';
              fallbackElement.innerHTML = '<h2>JawaStock</h2><p>Loading application...</p>';
              document.getElementById('root').appendChild(fallbackElement);
            }
          }, 5000);
        }
      });
    </script>`;
    indexHtml = indexHtml.replace('</head>', fallbackScript + '</head>');
  }
  
  fs.writeFileSync(indexPath, indexHtml);
  console.log('Fixed index.html asset paths');
}

// Salin fungsi API jika diperlukan
const functionsSrcDir = path.join(__dirname, 'functions-build');
if (fs.existsSync(functionsSrcDir)) {
  console.log('Functions directory exists, skipping copy operation');
} else {
  console.log('Creating functions directory...');
  fs.mkdirSync(functionsSrcDir, { recursive: true });
}

// Salin file db-migrate.js jika sudah ada
const dbMigrateSrc = path.join(__dirname, 'functions', 'db-migrate.js');
const dbMigrateDest = path.join(__dirname, 'functions-build', 'db-migrate.js');
if (fs.existsSync(dbMigrateSrc)) {
  console.log('Copying db-migrate.js to functions-build...');
  try {
    const content = fs.readFileSync(dbMigrateSrc, 'utf8')
      .replace('exports.handler', 'export async function handler');
    fs.writeFileSync(dbMigrateDest, content);
    console.log('Successfully copied and updated db-migrate.js');
  } catch (e) {
    console.error('Error copying db-migrate.js:', e);
  }
}

// Pastikan file error-handler.js disalin ke direktori public
const errorHandlerSrc = path.join(__dirname, 'public', 'error-handler.js');
const errorHandlerDest = path.join(__dirname, 'dist', 'public', 'error-handler.js');
if (fs.existsSync(errorHandlerSrc)) {
  console.log('Copying error-handler.js to public directory...');
  try {
    const content = fs.readFileSync(errorHandlerSrc, 'utf8');
    fs.writeFileSync(errorHandlerDest, content);
    console.log('Successfully copied error-handler.js');
  } catch (e) {
    console.error('Error copying error-handler.js:', e);
  }
}

console.log('Post-build script completed successfully!');