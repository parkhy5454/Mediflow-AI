// i18n-backend/index.js
//
// 백엔드(server.js)가 사용자에게 돌려주는 메시지(에러/성공 메시지, 이메일)를
// 요청 언어에 맞게 한국어/영어/중국어로 응답하기 위한 아주 작은 헬퍼.
//
// 프론트엔드(src/i18n)와 동일한 전략을 씁니다: 한국어 원문 문자열 자체를 키로 쓰고,
// en.json / zh.json 에만 번역문을 채워둡니다. 번역이 없으면(혹은 언어가 'ko'면)
// 키(=한국어 원문)를 그대로 반환하므로 별도의 ko.json이 필요 없습니다.
//
// 언어 판별: 프론트엔드가 모든 API 요청에 `X-App-Language` 헤더를 실어 보냅니다
// (src/i18n/index.js에서 전역 fetch를 감싸 자동으로 추가함). 이 헤더가 없으면
// Accept-Language 헤더를, 그것도 없으면 'ko'를 기본값으로 사용합니다.
//
// 사용법:
//   const { languageMiddleware, t } = require('./i18n-backend');
//   app.use(languageMiddleware);
//   ...
//   res.status(400).json({ error: t(req, '이메일을 입력해주세요.') });
//   res.status(400).json({ error: t(req, '{{userName}}님, ...', { userName }) });

const en = require('./en.json');
const zh = require('./zh.json');

const SUPPORTED_LANGUAGES = ['ko', 'en', 'zh'];
const RESOURCES = { en, zh };

// 'en', 'en-US', 'ko-KR' 같은 값에서 지원 언어 하나를 뽑아낸다.
function normalizeLang(raw) {
  if (!raw) return null;
  const primary = String(raw).split(',')[0].trim().slice(0, 2).toLowerCase();
  return SUPPORTED_LANGUAGES.includes(primary) ? primary : null;
}

function detectLanguage(req) {
  return (
    normalizeLang(req.headers['x-app-language']) ||
    normalizeLang(req.headers['accept-language']) ||
    'ko'
  );
}

// req.lang을 설정하는 Express 미들웨어. app.use(express.json()) 다음에 등록한다.
function languageMiddleware(req, res, next) {
  req.lang = detectLanguage(req);
  next();
}

// {{var}} 형태의 플레이스홀더를 치환한다 (i18next 보간 방식과 동일한 문법).
function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match;
  });
}

// req(Express request) 또는 언어 코드 문자열('ko'|'en'|'zh')을 둘 다 받을 수 있게 한다.
function resolveLang(reqOrLang) {
  if (typeof reqOrLang === 'string') return reqOrLang;
  if (reqOrLang && reqOrLang.lang) return reqOrLang.lang;
  return 'ko';
}

// t(req, '한국어 원문', { 변수: 값 })
function t(reqOrLang, koreanText, vars) {
  const lang = resolveLang(reqOrLang);
  const table = RESOURCES[lang];
  const translated = table && Object.prototype.hasOwnProperty.call(table, koreanText)
    ? table[koreanText]
    : koreanText; // 번역이 없거나 lang === 'ko'면 원문(=키) 그대로 사용
  return interpolate(translated, vars);
}

module.exports = {
  SUPPORTED_LANGUAGES,
  detectLanguage,
  languageMiddleware,
  t,
};
