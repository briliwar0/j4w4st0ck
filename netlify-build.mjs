#!/usr/bin/env node

/**
 * Netlify Build Script untuk JawaStock
 * Script ini menangani proses build untuk deployment Netlify.
 */

import { execSync } from 'child_process';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// Fungsi untuk menjalankan command shell
function runCommand(command) {
  console.log(`Menjalankan: ${command}`);
  try {
    const output = execSync(command, { encoding: 'utf-8' });
    console.log(output);
    return output;
  } catch (error) {
    console.error(`Error menjalankan "${command}":`, error.message);
    throw error;
  }
}

// Fungsi utama build
async function main() {
  try {
    console.log('🚀 Memulai proses build untuk Netlify...');
    
    // Pastikan dependencies terpasang (termasuk devDependencies)
    console.log('📦 Menginstall dependencies...');
    runCommand('npm install --include=dev');
    
    // Build aplikasi
    console.log('🔨 Building aplikasi...');
    runCommand('npm run build');
    
    // Buat folder functions jika belum ada
    if (!existsSync('functions-build')) {
      console.log('📁 Membuat folder functions-build...');
      await mkdir('functions-build', { recursive: true });
    }
    
    // Pastikan _redirects ada di folder dist
    const redirectsContent = '/* /index.html 200\n/api/* /.netlify/functions/api/:splat 200';
    await writeFile('dist/_redirects', redirectsContent);
    console.log('✅ _redirects file dibuat');
    
    console.log('🎉 Build selesai!');
  } catch (error) {
    console.error('❌ Build gagal:', error);
    process.exit(1);
  }
}

// Jalankan fungsi utama
main();