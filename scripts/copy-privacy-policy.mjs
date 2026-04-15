import { mkdirSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const sourcePath = resolve('docs/privacy-policy.html');
const targetDir = resolve('web-build/privacy-policy');
const targetPath = resolve(targetDir, 'index.html');

mkdirSync(targetDir, { recursive: true });
copyFileSync(sourcePath, targetPath);

console.log('Privacy policy copied to web-build/privacy-policy/index.html');
