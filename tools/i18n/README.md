# i18n tooling (dev-only, not used at runtime)

These scripts were used to add Korean/English/Chinese support to the app. They're kept here
in case more Korean UI text is added later and needs to go through the same pipeline again.
None of them run in production — the app only needs `src/i18n/locales/*.json` (frontend) and
`i18n-backend/*.json` (backend), which are already committed.

Run everything from the **project root** (not from inside `tools/i18n/`), e.g.:

```
node tools/i18n/extract-keys.js $(find src -name '*.js' -o -name '*.jsx' -o -name '*.tsx') > /tmp/keys.json
python3 tools/i18n/build_translations.py
```

- `codemod-i18n.js` — AST codemod (uses `recast`) that finds Korean text in JSX/JS across
  `src/` and wraps it in `t('...')`, auto-adding the `useTranslation` import/hook where missing.
  Conservative on purpose: only touches unambiguous UI-text patterns (JSX children, a safe set
  of JSX attributes, `alert`/`confirm` string arguments) so it never touches Korean strings used
  as data/logic values (shift codes, status enums, etc). Re-run it after adding new Korean UI
  text to `src/`, then review the diff before committing.
- `extract-keys.js` — AST-based extractor that finds every `t('...')` call across a set of files
  and lists the unique Korean keys used. Use this to get the authoritative list of keys that
  need a translation.
- `build_translations.py` — contains the actual EN/ZH translations for the frontend's Korean
  keys and writes `src/i18n/locales/en.json` / `zh.json`. If `extract-keys.js` finds new keys,
  add them to the `EN`/`ZH` dicts in this file and re-run it.
- `codemod-backend-i18n.js` — the same idea as `codemod-i18n.js` but for `server.js`: wraps
  `error:`/`message:` string values (the ones actually returned to the frontend) in `t(req, ...)`.
- `build_backend_translations.py` — EN/ZH translations for the backend's Korean keys; writes
  `i18n-backend/en.json` / `zh.json`.
- `syntax_check.js` — quick Babel-parser syntax check across every file under `src/`. Useful as
  a fast sanity check after running the codemod or hand-editing many files.

## Adding a new language

1. Add the language code to `SUPPORTED_LANGUAGES` in `src/i18n/index.js` and `i18n-backend/index.js`.
2. Add a new resource file (e.g. `src/i18n/locales/ja.json`, `i18n-backend/ja.json`) with the
   same Korean keys as `en.json`, translated.
3. Register the new resource in the `resources: {...}` object in `src/i18n/index.js`.
4. Add a button for it in `src/components/Common/LanguageSwitcher.jsx`.

## Known limitation (scope of the current pass)

The codemod only automates *unambiguous* display-text patterns. Some Korean text was
intentionally left untouched because it's harder to tell apart from business-logic values without
a human reading the surrounding code — for example, object literals like
`{ text: '승인 대기', color: '...' }` used as status-label maps, array literals of option strings,
and ternaries that return a bare Korean string assigned to a variable rather than used directly in
JSX. If you want closer to 100% coverage, search `src/` for remaining Korean text (a quick way:
`grep -rlP '[가-힣]' src --include='*.js' --include='*.jsx'` and look for lines *not* already
wrapped in `t(...)`) and wrap those by hand the same way.
