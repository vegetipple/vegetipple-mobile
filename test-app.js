#!/usr/bin/env node

// Simple test script to verify the app structure and dependencies

const fs = require('fs');
const path = require('path');

console.log('🌱 Vegetipple Mobile App - Setup Verification\n');

// Check if key files exist
const keyFiles = [
    'src/app/home/home.page.html',
    'src/app/home/home.page.ts',
    'src/app/home/home.page.scss',
    'src/app/services/database.service.ts',
    'src/assets/barnivore.db',
    'capacitor.config.ts',
    'package.json'
];

console.log('📁 Checking key files:');
keyFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Check package.json dependencies
console.log('\n📦 Checking dependencies:');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const keyDeps = [
        '@ionic/angular',
        '@capacitor/core',
        '@capacitor-community/sqlite',
        '@capacitor/browser'
    ];
    
    keyDeps.forEach(dep => {
        const hasInDeps = packageJson.dependencies && packageJson.dependencies[dep];
        const hasInDevDeps = packageJson.devDependencies && packageJson.devDependencies[dep];
        const exists = hasInDeps || hasInDevDeps;
        console.log(`${exists ? '✅' : '❌'} ${dep}`);
    });
} catch (error) {
    console.log('❌ Error reading package.json');
}

// Check database file size
console.log('\n💾 Checking database:');
try {
    const dbPath = 'src/assets/barnivore.db';
    const stats = fs.statSync(dbPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`✅ Database size: ${sizeInMB} MB`);
} catch (error) {
    console.log('❌ Database file not found or error reading');
}

// Check if built
console.log('\n🏗️ Checking build:');
const wwwExists = fs.existsSync('www');
console.log(`${wwwExists ? '✅' : '❌'} www/ directory (built assets)`);

console.log('\n📱 Ready for mobile development!');
console.log('Run "ionic serve" to test in browser');
console.log('See MOBILE_SETUP.md for Android setup instructions');