#!/usr/bin/env node
// Accurately extract every t('...') / t("...") first-argument string via AST,
// instead of fragile regex (which mishandles quotes/escapes).
const fs = require('fs');
const parser = require('@babel/parser');
const traverseMod = require('@babel/traverse');
const traverse = traverseMod.default || traverseMod;
const t = require('@babel/types');

const files = process.argv.slice(2);
const keys = new Set();
const perFile = {};

for (const file of files) {
  const isTs = /\.tsx?$/.test(file);
  const source = fs.readFileSync(file, 'utf8');
  let ast;
  try {
    ast = parser.parse(source, {
      sourceType: 'module',
      plugins: ['jsx', isTs ? 'typescript' : null, 'classProperties', 'optionalChaining', 'nullishCoalescingOperator', 'objectRestSpread'].filter(Boolean),
    });
  } catch (e) {
    console.error('PARSE ERROR', file, e.message);
    continue;
  }
  const fileKeys = [];
  traverse(ast, {
    CallExpression(p) {
      if (!t.isIdentifier(p.node.callee) || p.node.callee.name !== 't') return;
      const arg = p.node.arguments[0];
      if (!arg || arg.type !== 'StringLiteral') return;
      keys.add(arg.value);
      fileKeys.push(arg.value);
    },
  });
  perFile[file] = fileKeys;
}

console.log(JSON.stringify({ totalUnique: keys.size, keys: Array.from(keys).sort(), perFile }, null, 2));
