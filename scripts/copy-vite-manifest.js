import fs from 'fs';
import path from 'path';

const root = process.cwd();
const source = path.join(root, 'public_html', 'build', '.vite', 'manifest.json');
const destination = path.join(root, 'public_html', 'build', 'manifest.json');

if (!fs.existsSync(source)) {
    console.error(`Missing Vite manifest at ${source}`);
    process.exit(1);
}

fs.copyFileSync(source, destination);
console.log(`Copied manifest to ${destination}`);
