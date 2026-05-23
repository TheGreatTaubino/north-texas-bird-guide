import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const source = join(process.cwd(), 'dist', 'index.html');
const candidates = [
  process.env.ONEDRIVE && join(process.env.ONEDRIVE, 'north-texas-bird-guide.html'),
  'C:\\Users\\alexa\\OneDrive\\north-texas-bird-guide.html',
  '/mnt/c/Users/alexa/OneDrive/north-texas-bird-guide.html',
].filter(Boolean);

const target = candidates.find(path => existsSync(dirname(path)));

if (!target) {
  console.warn('OneDrive folder not found; leaving build in dist/index.html.');
  process.exit(0);
}

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
console.log(`Copied build to ${target}`);

