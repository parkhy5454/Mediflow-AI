#!/usr/bin/env node
// Wraps user-facing `error:`/`message:` string values (and the two constants
// PASSWORD_RULE_MESSAGE / genericMessage used in that position) in server.js
// with a call to t(req, ...), so responses are localized per-request.
//
// Conservative by design: only touches ObjectProperty nodes whose key is
// exactly `error` or `message`, whose value is a Korean string literal (or
// one of the two known identifier constants), and which sit inside a
// function that has a `req` parameter in scope. Uses recast so untouched
// code keeps its original formatting.

const fs = require('fs');
const recast = require('recast');
const babelParser = require('@babel/parser');
const t = require('@babel/types');

const file = 'server.js';
const source = fs.readFileSync(file, 'utf8');

const parserAdapter = {
  parse(src) {
    return babelParser.parse(src, {
      sourceType: 'module',
      plugins: ['classProperties', 'optionalChaining', 'nullishCoalescingOperator', 'objectRestSpread'],
    });
  },
};

const ast = recast.parse(source, { parser: parserAdapter });

const koreanRegex = /[가-힣]/;
const KNOWN_MESSAGE_IDENTIFIERS = new Set(['PASSWORD_RULE_MESSAGE', 'genericMessage']);

let wrapCount = 0;
const skipped = [];

function hasReqParam(path) {
  let p = path;
  while (p) {
    const node = p.node;
    if (
      t.isFunctionExpression(node) ||
      t.isArrowFunctionExpression(node) ||
      t.isFunctionDeclaration(node)
    ) {
      const hasReq = node.params.some((param) => t.isIdentifier(param) && param.name === 'req');
      if (hasReq) return true;
    }
    p = p.parentPath;
  }
  return false;
}

function makeTCall(valueNode) {
  return t.callExpression(t.identifier('t'), [t.identifier('req'), valueNode]);
}

recast.types.visit(ast, {
  visitObjectProperty(path) {
    const node = path.node;
    const keyName = t.isIdentifier(node.key)
      ? node.key.name
      : t.isStringLiteral(node.key)
      ? node.key.value
      : null;

    if (keyName === 'error' || keyName === 'message') {
      const value = node.value;
      const isKoreanLiteral = t.isStringLiteral(value) && koreanRegex.test(value.value);
      const isKnownIdentifier = t.isIdentifier(value) && KNOWN_MESSAGE_IDENTIFIERS.has(value.name);

      if (isKoreanLiteral || isKnownIdentifier) {
        if (hasReqParam(path)) {
          node.value = makeTCall(value);
          wrapCount++;
        } else {
          skipped.push({ key: keyName, value: isKoreanLiteral ? value.value : value.name, reason: 'no req in scope' });
        }
      }
    }
    this.traverse(path);
  },
});

const output = recast.print(ast).code;
fs.writeFileSync(file, output, 'utf8');

console.log(JSON.stringify({ wrapCount, skipped }, null, 2));
