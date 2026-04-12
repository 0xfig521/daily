const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const htmlPath = path.resolve(__dirname, 'hero_gen.html');
const outPath = path.resolve(__dirname, 'public', 'hero.jpg');

const cmd = [
  'google-chrome',
  '--headless=new',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--window-size=1200,630',
  '--screenshot=' + outPath,
  '--screenshot-format=jpeg',
  '--quality=92',
  '--default-background-color=0',
  'file://' + htmlPath
].join(' ');

console.log('Running:', cmd);
execSync(cmd, { stdio: 'inherit' });

const stat = fs.statSync(outPath);
console.log('Screenshot saved:', outPath, '-', stat.size, 'bytes');
