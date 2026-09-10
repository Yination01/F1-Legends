const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, '..', 'game');
const dest = path.join(__dirname, 'www');
if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
function copyRecursive(s, d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  for (const f of fs.readdirSync(s)) {
    const sp = path.join(s, f);
    const dp = path.join(d, f);
    if (fs.statSync(sp).isDirectory()) copyRecursive(sp, dp);
    else fs.copyFileSync(sp, dp);
  }
}
copyRecursive(src, dest);
console.log(`Copied ${src} -> ${dest}`);
