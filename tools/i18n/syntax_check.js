const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(jsx?|tsx?)$/.test(entry.name)) out.push(full);
  }
}

const files = [];
walk('src', files);

let failures = 0;
for (const file of files) {
  const isTs = /\.tsx?$/.test(file);
  const source = fs.readFileSync(file, 'utf8');
  try {
    parser.parse(source, {
      sourceType: 'module',
      plugins: ['jsx', isTs ? 'typescript' : null, 'classProperties', 'optionalChaining', 'nullishCoalescingOperator', 'objectRestSpread'].filter(Boolean),
    });
  } catch (e) {
    failures++;
    console.error('PARSE ERROR:', file, '-', e.message);
  }
}
console.log(`Checked ${files.length} files, ${failures} failures.`);
