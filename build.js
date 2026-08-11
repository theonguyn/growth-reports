/* Inline build-assets/*.jpg vào template thành 1 file index.html tự chứa.
   Dùng: node build.js 2026-08-11
   Template: src/<date>/index.template.html  →  r/<date>/index.html          */
const fs = require('fs');
const path = require('path');

const date = process.argv[2];
if (!date) { console.error('Thiếu tham số ngày. Ví dụ: node build.js 2026-08-11'); process.exit(1); }

const root = __dirname;
const tplPath = path.join(root, 'src', date, 'index.template.html');
const outDir = path.join(root, 'r', date);
const outPath = path.join(outDir, 'index.html');
const assetDir = path.join(root, 'build-assets');

let html = fs.readFileSync(tplPath, 'utf8');

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' };
let inlined = 0;
const missing = [];

html = html.replace(/\{\{IMG_([A-Za-z0-9_]+)\}\}/g, (_, key) => {
  const hit = fs.readdirSync(assetDir).find(f => path.parse(f).name === 'shot' + key);
  if (!hit) { missing.push(key); return ''; }
  const buf = fs.readFileSync(path.join(assetDir, hit));
  inlined++;
  return `data:${MIME[path.extname(hit).toLowerCase()]};base64,${buf.toString('base64')}`;
});

// Token không khớp file nào sẽ thành src rỗng và hiện ảnh vỡ — báo to, đừng để lọt im lặng.
if (missing.length) {
  console.error('LỖI: không tìm thấy asset cho token: ' + missing.join(', '));
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, html);
console.log(`✓ ${path.relative(root, outPath)} — ${inlined} ảnh, ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB`);
