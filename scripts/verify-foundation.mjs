import fs from 'node:fs';
import path from 'node:path';

const required = [
  'package.json',
  '.env.example',
  'src/app/page.tsx',
  'src/app/(app)/home/page.tsx',
  'src/app/(app)/discover/page.tsx',
  'src/app/(app)/me/page.tsx',
  'src/lib/supabase/client.ts',
  'src/lib/supabase/server.ts',
  'src/lib/supabase/proxy.ts',
  'src/proxy.ts',
  'docs/V6_PRODUCT_SPEC.md',
  'docs/ARCHITECTURE.md',
  'docs/ROADMAP.md',
];

const missing = required.filter((file) => !fs.existsSync(path.resolve(file)));
if (missing.length) {
  console.error('Missing foundation files:', missing);
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const expected = { next: '16.3.3', react: '19.2.8', '@supabase/ssr': '0.12.5', '@supabase/supabase-js': '2.112.4' };
for (const [name, version] of Object.entries(expected)) {
  if (pkg.dependencies[name] !== version) {
    console.error(`${name} must be pinned to ${version}; found ${pkg.dependencies[name]}`);
    process.exit(1);
  }
}

console.log('Mechi V6 foundation verification passed.');
