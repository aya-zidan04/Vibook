/**
 * Ensures en/ar translation trees expose the same leaf keys.
 * Run: node scripts/check-i18n-keys.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dictPath = path.join(__dirname, '../src/i18n/dictionary.ts');
const src = fs.readFileSync(dictPath, 'utf8');

function extractLocaleObject(locale) {
  const re = new RegExp(`^  ${locale}: \\{`, 'm');
  const match = re.exec(src);
  if (!match) throw new Error(`Missing locale block: ${locale}`);
  const open = match.index + match[0].length - 1;
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return src.slice(open, i + 1);
    }
  }
  throw new Error(`Unclosed locale block: ${locale}`);
}

function leafKeys(objectBody) {
  const keys = [];
  const stack = [];
  const lines = objectBody.split('\n');
  for (const line of lines) {
    const m = line.match(/^(\s*)([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    const indent = m[1].length;
    const key = m[2];
    const rest = m[3].trim();
    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
    if (rest === '{') {
      stack.push({ indent, key });
      continue;
    }
    const isLeaf =
      rest.startsWith("'") ||
      rest.startsWith('"') ||
      rest === '' ||
      rest.startsWith('`');
    if (isLeaf) {
      keys.push([...stack.map((s) => s.key), key].join('.'));
    }
  }
  return keys;
}

const enKeys = new Set(leafKeys(extractLocaleObject('en')));
const arKeys = new Set(leafKeys(extractLocaleObject('ar')));
const missingAr = [...enKeys].filter((k) => !arKeys.has(k)).sort();
const missingEn = [...arKeys].filter((k) => !enKeys.has(k)).sort();

console.log(`en: ${enKeys.size} keys, ar: ${arKeys.size} keys`);
if (missingAr.length) {
  console.error('Missing in ar:', missingAr.slice(0, 20).join(', '));
  process.exit(1);
}
if (missingEn.length) {
  console.error('Missing in en:', missingEn.slice(0, 20).join(', '));
  process.exit(1);
}
console.log('i18n parity OK');
