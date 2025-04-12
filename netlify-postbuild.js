// netlify-postbuild.js
// Script yang dijalankan setelah build untuk memastikan file redirects berada di tempat yang benar

const fs = require('fs');
const path = require('path');

console.log('Running post-build script for Netlify...');

// Pastikan file _redirects ada di direktori publish
const redirectsContent = '/*    /index.html   200';
const redirectsPath = path.join(__dirname, 'dist', 'public', '_redirects');

// Tulis file _redirects
fs.writeFileSync(redirectsPath, redirectsContent);
console.log(`Created _redirects file at ${redirectsPath}`);

// Salin fungsi API jika diperlukan
const functionsSrcDir = path.join(__dirname, 'functions-build');
if (fs.existsSync(functionsSrcDir)) {
  console.log('Functions directory exists, skipping copy operation');
} else {
  console.log('Creating functions directory...');
  fs.mkdirSync(functionsSrcDir, { recursive: true });
}

console.log('Post-build script completed successfully!');