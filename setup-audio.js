#!/usr/bin/env node

/**
 * Audio Setup Script for Meditation App
 * 
 * This script helps you set up the audio files for your meditation app.
 * Run this script after downloading your audio files.
 */

const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, 'public', 'audio');
const requiredFiles = [
  'mindfulness-music.mp3',
  'breathing-music.mp3', 
  'body-scan-music.mp3',
  'loving-kindness-music.mp3'
];

console.log('🎵 Meditation Audio Setup');
console.log('========================\n');

// Check if audio directory exists
if (!fs.existsSync(audioDir)) {
  console.log('❌ Audio directory not found. Creating...');
  fs.mkdirSync(audioDir, { recursive: true });
  console.log('✅ Audio directory created at:', audioDir);
}

console.log('📁 Checking for required audio files...\n');

let missingFiles = [];
let existingFiles = [];

requiredFiles.forEach(file => {
  const filePath = path.join(audioDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`✅ ${file} (${sizeInMB} MB)`);
    existingFiles.push(file);
  } else {
    console.log(`❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
});

console.log('\n📊 Summary:');
console.log(`✅ Found: ${existingFiles.length}/${requiredFiles.length} files`);
console.log(`❌ Missing: ${missingFiles.length} files`);

if (missingFiles.length > 0) {
  console.log('\n📝 To complete setup:');
  console.log('1. Download your preferred meditation music');
  console.log('2. Rename the files according to the list below:');
  missingFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
  console.log('3. Place them in the public/audio/ folder');
  console.log('4. Run this script again to verify');
} else {
  console.log('\n🎉 All audio files are ready!');
  console.log('Your meditation app is ready to use with custom audio.');
}

console.log('\n📖 For more information, see: public/audio/README.md');




