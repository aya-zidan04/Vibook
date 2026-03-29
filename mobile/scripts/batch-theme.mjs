import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, '..', 'app');

function walk(d, out = []) {
  for (const n of fs.readdirSync(d)) {
    const p = path.join(d, n);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (n.endsWith('.tsx')) out.push(p);
  }
  return out;
}

for (const file of walk(appRoot)) {
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('useThemeColors(')) continue;
  if (!s.includes("from '@/theme'") || !s.includes('colors')) continue;
  if (s.includes('fadePlum')) {
    console.log('skip fadePlum', path.relative(appRoot, file));
    continue;
  }
  const nStyles = (s.match(/const styles = StyleSheet\.create/g) || []).length;
  if (nStyles !== 1) {
    console.log('skip styles count', nStyles, path.relative(appRoot, file));
    continue;
  }

  if (!s.includes("from 'react'") && !s.includes('from "react"')) {
    s = "import { useMemo } from 'react';\n" + s;
  } else if (!s.includes('useMemo')) {
    s = s.replace(/import \{([^}]+)\} from 'react';/, (_, inner) => {
      const p = inner.split(',').map((x) => x.trim()).filter(Boolean);
      if (!p.includes('useMemo')) p.unshift('useMemo');
      return `import { ${p.join(', ')} } from 'react';`;
    });
  }

  s = s.replace(/import \{([^}]+)\} from '@\/theme';/, (_, inner) => {
    const parts = inner
      .split(',')
      .map((x) => x.trim())
      .filter((x) => x && x !== 'colors');
    if (!parts.includes('useThemeColors')) parts.push('useThemeColors');
    return `import { ${parts.join(', ')} } from '@/theme';\nimport type { ThemeColors } from '@/theme/palettes';`;
  });

  s = s.replace(
    /export default function (\w+)\([^)]*\) \{/,
    (m) => `${m}\n  const colors = useThemeColors();\n  const styles = useMemo(() => createStyles(colors), [colors]);`,
  );

  s = s.replace(
    /const styles = StyleSheet\.create\(\{/,
    'function createStyles(colors: ThemeColors) {\n  return StyleSheet.create({',
  );

  const trim = s.trimEnd();
  if (trim.endsWith('});')) {
    s = trim.slice(0, -2) + '  });\n}\n';
  }

  fs.writeFileSync(file, s.endsWith('\n') ? s : s + '\n');
  console.log('ok', path.relative(path.join(__dirname, '..'), file));
}
