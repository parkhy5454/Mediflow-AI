#!/usr/bin/env node
/**
 * Codemod: wrap hardcoded Korean UI strings in t('...') for react-i18next.
 * Uses recast (not @babel/generator) so untouched code keeps its original
 * formatting — only the lines that actually change show up in a diff.
 *
 * Deliberately conservative — only touches patterns that are unambiguously
 * *display* text, never data/logic:
 *   1. Runs of JSX children (JSXText + "plain value" JSXExpressionContainers,
 *      e.g. {count}, {r.reviewNote}) within a single parent that contain at
 *      least one Korean JSXText are merged into ONE t('...', {var1, ...})
 *      call with {{var1}} interpolation — instead of chopping the sentence
 *      into fragments around each {expr}.
 *      A JSXExpressionContainer is only pulled into a run if its expression
 *      cannot itself render JSX (no nested <Element/>, no arrow functions),
 *      so real child components are never swallowed into a translation key.
 *   2. JSX attributes: placeholder / title / alt / aria-label (string literal, Korean)
 *   3. First-argument string literals to alert(...) / window.confirm(...) / confirm(...)
 *      when the literal itself contains Korean (skips variables like alert(result.message))
 *
 * Does NOT touch: object property values, plain variable string literals,
 * comparisons (=== '나이트' etc), non-JSX string concatenation — those need
 * manual review since this codebase uses Korean literals as both UI text
 * AND internal data/enum values (shift types, status codes, etc).
 *
 * Usage: node codemod-i18n.js <file1> <file2> ...
 * Prints a JSON summary per file: { file, wrapped: N, strings: [...] }
 * and rewrites the file in place.
 */
const fs = require('fs');
const path = require('path');
const recast = require('recast');
const babelParserForRecast = require('recast/parsers/babel');
const babelTsParserForRecast = require('recast/parsers/babel-ts');
const traverseMod = require('@babel/traverse');
const traverse = traverseMod.default || traverseMod;
const t = require('@babel/types');

const KOREAN_RE = /[가-힣]/;
const SAFE_ATTRS = new Set(['placeholder', 'title', 'alt', 'aria-label']);

function hasKorean(str) {
  return typeof str === 'string' && KOREAN_RE.test(str);
}

// Force single-quoted output for a brand-new string literal, matching this
// codebase's convention, unless the text itself contains a single quote.
function strLit(text) {
  const node = t.stringLiteral(text);
  if (!text.includes("'")) {
    node.extra = { raw: "'" + text.replace(/\\/g, '\\\\') + "'", rawValue: text };
  }
  return node;
}

function normalizeText(raw) {
  return raw.replace(/\s+/g, ' ');
}

// Can this expression's *value* be safely interpolated as text into a
// translation string? (i.e. it can never itself be a React element)
function isPlainValueExpr(node) {
  if (!node) return false;
  switch (node.type) {
    case 'Identifier':
    case 'MemberExpression':
    case 'OptionalMemberExpression':
    case 'CallExpression':
    case 'OptionalCallExpression':
    case 'TemplateLiteral':
    case 'NumericLiteral':
    case 'StringLiteral':
    case 'BooleanLiteral':
    case 'NullLiteral':
    case 'UnaryExpression':
    case 'BinaryExpression':
      return true;
    case 'ConditionalExpression':
      return isPlainValueExpr(node.consequent) && isPlainValueExpr(node.alternate);
    default:
      return false;
  }
}

// Best-effort short variable name for an interpolation placeholder.
function nameForExpr(node, usedNames) {
  let base = 'value';
  if (t.isIdentifier(node)) {
    base = node.name;
  } else if (t.isMemberExpression(node) && t.isIdentifier(node.property)) {
    base = node.property.name;
  } else if (t.isCallExpression(node) && t.isIdentifier(node.callee)) {
    base = node.callee.name;
  }
  base = base.replace(/[^a-zA-Z0-9_]/g, '') || 'value';
  let name = base;
  let i = 2;
  while (usedNames.has(name)) {
    name = base + i;
    i++;
  }
  usedNames.add(name);
  return name;
}

function processFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const isTs = /\.tsx?$/.test(filePath);
  let ast;
  try {
    ast = recast.parse(source, {
      parser: isTs ? babelTsParserForRecast : babelParserForRecast,
    });
  } catch (e) {
    return { file: filePath, error: 'parse error: ' + e.message };
  }

  const wrappedStrings = new Set();
  let wrappedCount = 0;

  function buildTCallForRun(children) {
    // children: array of JSXText | JSXExpressionContainer nodes (already
    // decided to be a mergeable run). Returns { node, key } or null.
    let keyParts = [];
    const callArgs = {}; // name -> expression node
    const usedNames = new Set();
    let anyKorean = false;

    children.forEach((child) => {
      if (t.isJSXText(child)) {
        keyParts.push(child.value);
        if (hasKorean(child.value)) anyKorean = true;
      } else if (t.isJSXExpressionContainer(child)) {
        const name = nameForExpr(child.expression, usedNames);
        keyParts.push('{{' + name + '}}');
        callArgs[name] = child.expression;
      }
    });

    if (!anyKorean) return null;

    let joined = keyParts.join('');
    const leadingWs = joined.match(/^\s*/)[0];
    const trailingWs = joined.match(/\s*$/)[0];
    let core = joined.slice(leadingWs.length, joined.length - trailingWs.length || undefined);
    if (!core) return null;
    core = normalizeText(core);

    const hasArgs = Object.keys(callArgs).length > 0;
    const callExpr = t.callExpression(
      t.identifier('t'),
      hasArgs
        ? [
            strLit(core),
            t.objectExpression(
              Object.entries(callArgs).map(([name, expr]) =>
                t.objectProperty(t.identifier(name), expr)
              )
            ),
          ]
        : [strLit(core)]
    );

    const replacementNodes = [];
    if (leadingWs) replacementNodes.push(t.jsxText(leadingWs));
    replacementNodes.push(t.jsxExpressionContainer(callExpr));
    if (trailingWs) replacementNodes.push(t.jsxText(trailingWs));

    return { nodes: replacementNodes, key: core };
  }

  traverse(ast, {
    'JSXElement|JSXFragment'(nodePath) {
      const children = nodePath.node.children;
      if (!children || children.length === 0) return;

      const newChildren = [];
      let run = [];

      function flushRun() {
        if (run.length === 0) return;
        const result = buildTCallForRun(run);
        if (result) {
          newChildren.push(...result.nodes);
          wrappedStrings.add(result.key);
          wrappedCount++;
        } else {
          newChildren.push(...run);
        }
        run = [];
      }

      children.forEach((child) => {
        if (t.isJSXText(child)) {
          run.push(child);
        } else if (t.isJSXExpressionContainer(child) && isPlainValueExpr(child.expression)) {
          run.push(child);
        } else {
          // Boundary: nested element, spread, or an expression that can
          // itself render JSX (conditional/&&) — never merge across this.
          flushRun();
          newChildren.push(child);
        }
      });
      flushRun();

      nodePath.node.children = newChildren;
    },
    JSXAttribute(nodePath) {
      const { node } = nodePath;
      if (!node.name || typeof node.name.name !== 'string') return;
      if (!SAFE_ATTRS.has(node.name.name)) return;
      if (!node.value || node.value.type !== 'StringLiteral') return;
      if (!hasKorean(node.value.value)) return;
      const text = node.value.value;
      const callExpr = t.callExpression(t.identifier('t'), [strLit(text)]);
      node.value = t.jsxExpressionContainer(callExpr);
      wrappedStrings.add(text);
      wrappedCount++;
    },
    CallExpression(nodePath) {
      const { node } = nodePath;
      const calleeName =
        (t.isIdentifier(node.callee) && node.callee.name) ||
        (t.isMemberExpression(node.callee) &&
          t.isIdentifier(node.callee.object) &&
          node.callee.object.name === 'window' &&
          t.isIdentifier(node.callee.property) &&
          node.callee.property.name) ||
        null;
      if (calleeName !== 'alert' && calleeName !== 'confirm') return;
      const arg = node.arguments[0];
      if (!arg || arg.type !== 'StringLiteral' || !hasKorean(arg.value)) return;
      const text = arg.value;
      node.arguments[0] = t.callExpression(t.identifier('t'), [strLit(text)]);
      wrappedStrings.add(text);
      wrappedCount++;
    },
  });

  if (wrappedCount === 0) {
    return { file: filePath, wrapped: 0, strings: [] };
  }

  // ---- Ensure `import { useTranslation } from 'react-i18next'` exists ----
  let hasI18nImport = false;
  let lastImportIndex = -1;
  ast.program.body.forEach((node, idx) => {
    if (t.isImportDeclaration(node)) {
      lastImportIndex = idx;
      if (node.source.value === 'react-i18next') hasI18nImport = true;
    }
  });
  if (!hasI18nImport) {
    // Build via a tiny recast.parse so the printed form is exactly this
    // hand-written single line (single quotes), not the AST pretty-printer's
    // default guess for a brand-new node.
    const importDecl = recast.parse("import { useTranslation } from 'react-i18next';", {
      parser: babelParserForRecast,
    }).program.body[0];
    ast.program.body.splice(lastImportIndex + 1, 0, importDecl);
  }

  // ---- Ensure the component function has `const { t } = useTranslation();` ----
  const basename = path.basename(filePath).replace(/\.(jsx?|tsx?)$/, '');
  let injected = false;

  function bodyAlreadyHasTHook(blockStatement) {
    return blockStatement.body.some((stmt) => {
      if (!t.isVariableDeclaration(stmt)) return false;
      return stmt.declarations.some((d) => {
        if (!t.isCallExpression(d.init)) return false;
        const callee = d.init.callee;
        return t.isIdentifier(callee) && callee.name === 'useTranslation';
      });
    });
  }

  function injectHook(fnNode) {
    const hookDecl = recast.parse('const { t } = useTranslation();', {
      parser: babelParserForRecast,
    }).program.body[0];

    if (t.isBlockStatement(fnNode.body)) {
      if (bodyAlreadyHasTHook(fnNode.body)) return true;
      fnNode.body.body.unshift(hookDecl);
      return true;
    }

    // Concise-body arrow function, e.g. `const X = () => (<div>...</div>)`.
    // Convert to a block body so we have somewhere to put the hook call.
    if (t.isExpression(fnNode.body)) {
      const returnStmt = t.returnStatement(fnNode.body);
      fnNode.body = t.blockStatement([hookDecl, returnStmt]);
      return true;
    }

    return false;
  }

  traverse(ast, {
    FunctionDeclaration(nodePath) {
      if (injected) return;
      if (nodePath.node.id && nodePath.node.id.name === basename) {
        injected = injectHook(nodePath.node);
      }
    },
    VariableDeclarator(nodePath) {
      if (injected) return;
      if (
        t.isIdentifier(nodePath.node.id) &&
        nodePath.node.id.name === basename &&
        (t.isArrowFunctionExpression(nodePath.node.init) || t.isFunctionExpression(nodePath.node.init))
      ) {
        injected = injectHook(nodePath.node.init);
      }
    },
  });

  if (!injected) {
    traverse(ast, {
      FunctionDeclaration(nodePath) {
        if (injected) return;
        if (nodePath.node.id && /^[A-Z]/.test(nodePath.node.id.name)) {
          injected = injectHook(nodePath.node);
        }
      },
      VariableDeclarator(nodePath) {
        if (injected) return;
        if (
          t.isIdentifier(nodePath.node.id) &&
          /^[A-Z]/.test(nodePath.node.id.name) &&
          (t.isArrowFunctionExpression(nodePath.node.init) || t.isFunctionExpression(nodePath.node.init))
        ) {
          injected = injectHook(nodePath.node.init);
        }
      },
    });
  }

  const output = recast.print(ast);

  // recast doesn't honor `.extra.raw` for wholly-synthetic nodes, so the
  // t('...') calls we just inserted always print with double quotes.
  // Normalize those specific call sites to single quotes to match this
  // codebase's convention (skip any that contain a literal single quote).
  const finalCode = output.code.replace(/\bt\("([^"\\]*)"([,)])/g, (m, inner, punct) =>
    inner.includes("'") ? m : `t('${inner}'${punct}`
  );

  fs.writeFileSync(filePath, finalCode, 'utf8');
  return {
    file: filePath,
    wrapped: wrappedCount,
    hookInjected: injected,
    strings: Array.from(wrappedStrings),
  };
}

const files = process.argv.slice(2);
const results = files.map((f) => {
  try {
    return processFile(f);
  } catch (e) {
    return { file: f, error: e.message, stack: e.stack };
  }
});
console.log(JSON.stringify(results, null, 2));
