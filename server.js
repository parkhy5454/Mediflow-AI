// server.js
// Mediflow-AI 백엔드 서버 (Express).
// - 병원 단위 회원가입/로그인 처리
// - 같은 병원(hospitalCode 기준)으로 처음 가입하면 자동으로 admin, 이미 있으면 member로 배정
// - 실제 회원 데이터는 Supabase(mediflow_users 테이블)에 저장되어 서버가 재시작돼도 유지됨
//
// 필요한 환경변수 (Render > Environment 탭에서 등록):
//   SUPABASE_URL              - Supabase 프로젝트 URL
//   SUPABASE_SERVICE_ROLE_KEY - Supabase Service Role 키 (절대 프론트엔드에 노출하지 말 것)
//   SENTRY_DSN_BACKEND         - Sentry(에러 모니터링) 백엔드 프로젝트 DSN (선택, 없으면 그냥 콘솔 로그만)
//   PORT                      - Render가 자동으로 지정해줌 (없으면 5000 사용)

const Sentry = require('@sentry/node');

// [추가] 에러 모니터링(Sentry). DSN이 설정되어 있을 때만 활성화된다.
// 다른 코드보다 먼저 초기화해야 이후에 발생하는 에러를 놓치지 않는다.
if (process.env.SENTRY_DSN_BACKEND) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN_BACKEND,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 0.1
  });

  // [핵심] 이 서버 코드 전체에 이미 'xxx error:' 형태의 console.error(err)가 수십 군데 있다.
  // 하나하나 Sentry.captureException()으로 바꾸는 대신, console.error 자체를 가로채서
  // Error 객체가 들어오면 자동으로 Sentry에도 보고하게 만든다. 이렇게 하면 기존 로그들이
  // 전부 그대로 Sentry에서도 보여서, "콘솔에만 조용히 찍히고 아무도 못 보는" 문제가 근본적으로 사라진다.
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError(...args);
    const errorArg = args.find(a => a instanceof Error);
    if (errorArg) {
      Sentry.captureException(errorArg);
    } else {
      // Supabase 에러 객체처럼 Error 인스턴스가 아닌 { code, message, details } 형태도 있어서,
      // 마지막 인자가 객체면 메시지로 감싸서라도 보고한다.
      const last = args[args.length - 1];
      if (last && typeof last === 'object') {
        Sentry.captureException(new Error(`${args[0] || ''} ${JSON.stringify(last)}`));
      }
    }
  };

  // try/catch로 못 잡은(정말 예상 못 한) 에러까지 잡는 최후의 안전망
  process.on('unhandledRejection', (reason) => {
    console.error('unhandled rejection:', reason);
  });
  process.on('uncaughtException', (err) => {
    console.error('uncaught exception:', err);
  });
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[경고] SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다. 회원가입/로그인이 동작하지 않습니다.');
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '');

// 사용자 객체에서 비밀번호를 제외하고 프론트엔드로 안전하게 내려줄 형태로 변환
const toPublicUser = (u) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  phone: u.phone || '',
  hospitalName: u.hospital_name,
  hospitalCode: u.hospital_code,
  role: u.role,
  mustChangePassword: !!u.must_change_password,
  createdAt: u.created_at
});

// 임시 비밀번호 생성기. 헷갈리기 쉬운 문자(0/O, 1/l/I)는 제외해서 전화로 불러줘도 헷갈리지 않게 한다.
const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let pw = '';
  for (let i = 0; i < 10; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
};

// ------------------------------------------------------------------
// 병원 코드 상태 조회 (회원가입 화면에서 "관리자로 가입" 선택지 표시 여부 + 병원명 자동입력용)
// - hasAdmin: 그 병원 코드로 가입된 관리자가 1명이라도 있는지
// - hospitalName: 그 병원 코드로 이미 가입된 사람이 있으면 그 병원명(최초 등록된 이름으로 통일).
//   없으면 null → 새 병원이라는 뜻이므로 가입자가 직접 병원명을 입력해서 정한다.
// ------------------------------------------------------------------
app.get('/api/auth/hospital-status', async (req, res) => {
  try {
    const code = (req.query.code || '').trim().toLowerCase();
    if (!code) {
      return res.status(400).json({ error: '병원 코드가 필요합니다.' });
    }

    const { data: existingMembers, error } = await supabase
      .from('mediflow_users')
      .select('role, hospital_name, created_at')
      .eq('hospital_code', code)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const hasAdmin = (existingMembers || []).some(m => m.role === 'admin');
    const hospitalName = existingMembers && existingMembers.length > 0 ? existingMembers[0].hospital_name : null;

    res.json({ hasAdmin, hospitalName });
  } catch (err) {
    console.error('hospital-status error:', err);
    res.status(500).json({ error: '병원 코드 확인 중 오류가 발생했습니다.' });
  }
});

// ------------------------------------------------------------------
// 회원가입
// [수정] 최초 가입자에게 관리자를 자동 배정하던 방식 → 가입자가 "일반 사용자/관리자"를 직접 선택.
// 단, 그 병원(hospitalCode)에 관리자가 이미 1명이라도 있으면 wantsAdmin 값과 무관하게
// 서버에서 강제로 member로 배정한다. (관리자가 정해진 뒤에는 기존 관리자만 새 관리자를 지정 가능)
// ------------------------------------------------------------------
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, phone, hospitalName, hospitalCode, wantsAdmin } = req.body;

    if (!email || !password || !name || !hospitalName || !hospitalCode) {
      return res.status(400).json({ error: '이메일, 비밀번호, 이름, 병원명, 병원 코드를 모두 입력해주세요.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedHospitalCode = hospitalCode.trim().toLowerCase();

    // 이메일 중복 확인
    const { data: existingByEmail, error: emailCheckError } = await supabase
      .from('mediflow_users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (emailCheckError) throw emailCheckError;
    if (existingByEmail) {
      return res.status(409).json({ error: '이미 가입된 이메일입니다.' });
    }

    // 그 병원(hospitalCode)에 이미 가입된 사람이 있는지 확인.
    // 있으면: 1) 관리자 여부와 무관하게 role을 member로 강제, 2) 병원명도 클라이언트가 뭘 보냈든
    //         무시하고 기존(최초 가입자가 정한) 병원명으로 통일한다. (오타/불일치 방지, 프론트 우회 방지용 서버측 최종 검증)
    const { data: existingHospitalMembers, error: hospitalCheckError } = await supabase
      .from('mediflow_users')
      .select('role, hospital_name')
      .eq('hospital_code', normalizedHospitalCode)
      .order('created_at', { ascending: true });

    if (hospitalCheckError) throw hospitalCheckError;
    const hospitalHasAdmin = (existingHospitalMembers || []).some(m => m.role === 'admin');
    const role = (!hospitalHasAdmin && wantsAdmin === true) ? 'admin' : 'member';
    const resolvedHospitalName = existingHospitalMembers && existingHospitalMembers.length > 0
      ? existingHospitalMembers[0].hospital_name
      : hospitalName.trim();

    const passwordHash = bcrypt.hashSync(password, 10);

    const { data: inserted, error: insertError } = await supabase
      .from('mediflow_users')
      .insert({
        email: normalizedEmail,
        password: passwordHash,
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        hospital_name: resolvedHospitalName,
        hospital_code: normalizedHospitalCode,
        role
      })
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({ user: toPublicUser(inserted) });
  } catch (err) {
    console.error('signup error:', err);
    res.status(500).json({ error: '회원가입 중 오류가 발생했습니다.' });
  }
});

// ------------------------------------------------------------------
// 로그인
// ------------------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data: user, error } = await supabase
      .from('mediflow_users')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (error) throw error;
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    res.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
  }
});

// ------------------------------------------------------------------
// 비밀번호 초기화 (같은 병원 관리자 또는 운영자만)
// 임시 비밀번호를 발급해서 딱 한 번 응답으로 돌려준다 (그 이후엔 해시로만 저장, 평문은 어디에도 안 남음).
// 초기화된 계정은 다음 로그인 시 무조건 새 비밀번호로 바꿔야 앱을 쓸 수 있다.
// ------------------------------------------------------------------
app.put('/api/auth/users/:targetId/reset-password', async (req, res) => {
  try {
    const requester = await getRequesterHospital(req);
    if (!requester) return res.status(401).json({ error: '로그인이 필요합니다.' });

    const { data: target, error: targetError } = await supabase
      .from('mediflow_users')
      .select('*')
      .eq('id', req.params.targetId)
      .maybeSingle();
    if (targetError) throw targetError;
    if (!target) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });

    const isDeveloper = requester.email === ADMIN_EMAIL;
    const isSameHospitalAdmin = requester.role === 'admin' && requester.hospital_code === target.hospital_code;
    if (!isDeveloper && !isSameHospitalAdmin) {
      return res.status(403).json({ error: '같은 병원의 관리자 또는 운영자만 비밀번호를 초기화할 수 있습니다.' });
    }

    const tempPassword = generateTempPassword();
    const passwordHash = bcrypt.hashSync(tempPassword, 10);

    const { error: updateError } = await supabase
      .from('mediflow_users')
      .update({ password: passwordHash, must_change_password: true })
      .eq('id', target.id);
    if (updateError) throw updateError;

    res.json({ tempPassword, userName: target.name, userEmail: target.email });
  } catch (err) {
    console.error('password reset error:', err);
    res.status(500).json({ error: '비밀번호 초기화 중 오류가 발생했습니다.' });
  }
});

// ------------------------------------------------------------------
// 본인 프로필 수정 (이름, 전화번호). 기존 가입자가 나중에 전화번호를 채워 넣을 때도 사용.
// ------------------------------------------------------------------
app.put('/api/auth/profile', async (req, res) => {
  try {
    const requester = await getRequesterHospital(req);
    if (!requester) return res.status(401).json({ error: '로그인이 필요합니다.' });

    const { name, phone } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: '이름을 입력해주세요.' });
    }

    const { data: updated, error } = await supabase
      .from('mediflow_users')
      .update({ name: name.trim(), phone: phone ? phone.trim() : null })
      .eq('id', requester.id)
      .select()
      .single();
    if (error) throw error;

    res.json({ user: toPublicUser(updated) });
  } catch (err) {
    console.error('profile update error:', err);
    res.status(500).json({ error: '내 정보 수정 중 오류가 발생했습니다.' });
  }
});


// ------------------------------------------------------------------
// 본인 비밀번호 변경 (임시 비밀번호로 로그인한 뒤 강제로 새 비밀번호 설정할 때 사용)
// ------------------------------------------------------------------
app.put('/api/auth/change-password', async (req, res) => {
  try {
    const requester = await getRequesterHospital(req);
    if (!requester) return res.status(401).json({ error: '로그인이 필요합니다.' });

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: '새 비밀번호는 6자 이상이어야 합니다.' });
    }

    const passwordHash = bcrypt.hashSync(newPassword, 10);
    const { data: updated, error } = await supabase
      .from('mediflow_users')
      .update({ password: passwordHash, must_change_password: false })
      .eq('id', requester.id)
      .select()
      .single();
    if (error) throw error;

    res.json({ user: toPublicUser(updated) });
  } catch (err) {
    console.error('change password error:', err);
    res.status(500).json({ error: '비밀번호 변경 중 오류가 발생했습니다.' });
  }
});

// ------------------------------------------------------------------
// 같은 병원 소속 회원 목록 조회 (가입 회원 확인 화면에서 사용, x-user-id 헤더로 요청자 식별)
// ------------------------------------------------------------------
app.get('/api/auth/users', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    const { data: requester, error: requesterError } = await supabase
      .from('mediflow_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (requesterError) throw requesterError;
    if (!requester) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    const { data: members, error: membersError } = await supabase
      .from('mediflow_users')
      .select('*')
      .eq('hospital_code', requester.hospital_code);

    if (membersError) throw membersError;

    res.json(members.map(toPublicUser));
  } catch (err) {
    console.error('users list error:', err);
    res.status(500).json({ error: '회원 목록 조회 중 오류가 발생했습니다.' });
  }
});

// ------------------------------------------------------------------
// 관리자 전용: 같은 병원 소속 동료의 역할(admin/member) 변경
// [수정] 예외: 그 병원에 관리자가 한 명도 없는 경우, 일반 사용자가 "본인만" 관리자로
// 셀프 승격할 수 있다 (관리자가 없어져서 아무도 권한을 못 바꾸는 상황을 막기 위한 안전장치).
// 관리자가 1명이라도 있으면 이 예외는 적용되지 않고, 기존처럼 관리자만 역할을 바꿀 수 있다.
// ------------------------------------------------------------------
app.put('/api/auth/users/:targetId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { role } = req.body;

    if (role !== 'admin' && role !== 'member') {
      return res.status(400).json({ error: '올바르지 않은 역할입니다.' });
    }

    const { data: requester, error: requesterError } = await supabase
      .from('mediflow_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (requesterError) throw requesterError;
    if (!requester) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    let authorized = requester.role === 'admin';

    // 셀프 승격 예외: 본인을 관리자로 바꾸려는 요청 + 그 병원에 관리자가 0명일 때만 허용
    if (!authorized && role === 'admin' && req.params.targetId === requester.id) {
      const { data: existingAdmins, error: adminCheckError } = await supabase
        .from('mediflow_users')
        .select('id')
        .eq('hospital_code', requester.hospital_code)
        .eq('role', 'admin')
        .limit(1);
      if (adminCheckError) throw adminCheckError;
      if (!existingAdmins || existingAdmins.length === 0) {
        authorized = true;
      }
    }

    if (!authorized) {
      return res.status(403).json({ error: '관리자만 역할을 변경할 수 있습니다.' });
    }

    const { data: target, error: targetError } = await supabase
      .from('mediflow_users')
      .select('*')
      .eq('id', req.params.targetId)
      .maybeSingle();

    if (targetError) throw targetError;
    if (!target || target.hospital_code !== requester.hospital_code) {
      return res.status(403).json({ error: '같은 병원 소속 회원만 변경할 수 있습니다.' });
    }

    const { data: updated, error: updateError } = await supabase
      .from('mediflow_users')
      .update({ role })
      .eq('id', target.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({ user: toPublicUser(updated) });
  } catch (err) {
    console.error('role update error:', err);
    res.status(500).json({ error: '역할 변경 중 오류가 발생했습니다.' });
  }
});


// ------------------------------------------------------------------
// 공용 헬퍼: x-user-id 헤더로 요청자를 찾고, 그 사람의 병원 코드(hospital_code)를 반환한다.
// 모든 병원 데이터(간호사/근무표/설정) API는 이 병원 코드로 완전히 분리된다.
// ------------------------------------------------------------------
const getRequesterHospital = async (req) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return null;
  const { data: requester, error } = await supabase
    .from('mediflow_users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error || !requester) return null;
  return requester;
};

const toPublicNurse = (n) => ({
  id: n.id,
  name: n.name,
  qualification: n.qualification,
  experience: n.experience,
  department: n.department,
  status: n.status,
  lastShiftType: n.last_shift_type,
  lastShiftCycleDay: n.last_shift_cycle_day,
  lastOffDutyRemaining: n.last_off_duty_remaining,
  lastShiftPreference: n.last_shift_preference,
  historicalDaysByShift: n.historical_days_by_shift || {}
});

// ------------------------------------------------------------------
// 간호사 목록 조회 (같은 병원 소속만)
// ------------------------------------------------------------------
app.get('/api/nurses', async (req, res) => {
  try {
    const requester = await getRequesterHospital(req);
    if (!requester) return res.status(401).json({ error: '로그인이 필요합니다.' });

    const { data, error } = await supabase
      .from('mediflow_nurses')
      .select('*')
      .eq('hospital_code', requester.hospital_code)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data.map(toPublicNurse));
  } catch (err) {
    console.error('nurses list error:', err);
    res.status(500).json({ error: '간호사 목록 조회 중 오류가 발생했습니다.' });
  }
});

// 간호사 추가
app.post('/api/nurses', async (req, res) => {
  try {
    const requester = await getRequesterHospital(req);
    if (!requester) return res.status(401).json({ error: '로그인이 필요합니다.' });

    const { name, qualification, experience, department } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: '간호사 이름을 입력해주세요.' });
    }

    const { data, error } = await supabase
      .from('mediflow_nurses')
      .insert({
        id: crypto.randomUUID(),
        hospital_code: requester.hospital_code,
        name: name.trim(),
        qualification: qualification || 'RN',
        experience: experience || '주니어',
        department: department || '',
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(toPublicNurse(data));
  } catch (err) {
    console.error('nurse create error:', err);
    res.status(500).json({ error: '간호사 추가 중 오류가 발생했습니다.' });
  }
});

// [수정] /api/nurses/bulk 를 /api/nurses/:id 보다 먼저 등록해야 한다.
// Express는 라우트를 등록 순서대로 검사하므로, :id 같은 와일드카드가 먼저 있으면
// "bulk"라는 경로까지 id="bulk"인 것으로 착각해서 가로채버린다.
// (이 순서 문제 때문에 /api/nurses/bulk 요청이 지금까지 한 번도 제대로 실행된 적이 없었음 —
//  근무표 생성 후 간호사 누적 통계가 계속 저장 안 되던 문제의 진짜 원인)
// 간호사 여러 명을 한 번에 upsert (근무표 생성 후 lastShiftType, historicalDaysByShift 등을 일괄 갱신할 때 사용)
app.put('/api/nurses/bulk', async (req, res) => {
  try {
    const requester = await getRequesterHospital(req);
    if (!requester) return res.status(401).json({ error: '로그인이 필요합니다.' });

    const nurses = req.body.nurses;
    if (!Array.isArray(nurses)) {
      return res.status(400).json({ error: 'nurses 배열이 필요합니다.' });
    }

    const rows = nurses.map(n => ({
      id: n.id,
      hospital_code: requester.hospital_code,
      name: n.name,
      qualification: n.qualification,
      experience: n.experience,
      department: n.department,
      status: n.status,
      last_shift_type: n.lastShiftType ?? null,
      last_shift_cycle_day: n.lastShiftCycleDay ?? 0,
      last_off_duty_remaining: n.lastOffDutyRemaining ?? 0,
      last_shift_preference: n.lastShiftPreference ?? null,
      historical_days_by_shift: n.historicalDaysByShift || {},
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('mediflow_nurses')
      .upsert(rows, { onConflict: 'id' })
      .select();

    if (error) throw error;
    res.json((data || []).map(toPublicNurse));
  } catch (err) {
    console.error('nurse bulk update error:', err);
    res.status(500).json({ error: '간호사 일괄 수정 중 오류가 발생했습니다.' });
  }
});

// 간호사 정보/상태 수정 (같은 병원 소속만)
app.put('/api/nurses/:id', async (req, res) => {
  try {
    const requester = await getRequesterHospital(req);
    if (!requester) return res.status(401).json({ error: '로그인이 필요합니다.' });

    const updates = {};
    const body = req.body;
    if (body.status !== undefined) updates.status = body.status;
    if (body.name !== undefined) updates.name = body.name;
    if (body.qualification !== undefined) updates.qualification = body.qualification;
    if (body.experience !== undefined) updates.experience = body.experience;
    if (body.department !== undefined) updates.department = body.department;
    if (body.lastShiftType !== undefined) updates.last_shift_type = body.lastShiftType;
    if (body.lastShiftCycleDay !== undefined) updates.last_shift_cycle_day = body.lastShiftCycleDay;
    if (body.lastOffDutyRemaining !== undefined) updates.last_off_duty_remaining = body.lastOffDutyRemaining;
    if (body.lastShiftPreference !== undefined) updates.last_shift_preference = body.lastShiftPreference;
    if (body.historicalDaysByShift !== undefined) updates.historical_days_by_shift = body.historicalDaysByShift;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('mediflow_nurses')
      .update(updates)
      .eq('id', req.params.id)
      .eq('hospital_code', requester.hospital_code)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: '간호사를 찾을 수 없습니다.' });
    res.json(toPublicNurse(data));
  } catch (err) {
    console.error('nurse update error:', err);
    res.status(500).json({ error: '간호사 정보 수정 중 오류가 발생했습니다.' });
  }
});

// 간호사 삭제 (같은 병원 소속만)
app.delete('/api/nurses/:id', async (req, res) => {
  try {
    const requester = await getRequesterHospital(req);
    if (!requester) return res.status(401).json({ error: '로그인이 필요합니다.' });

    const { error } = await supabase
      .from('mediflow_nurses')
      .delete()
      .eq('id', req.params.id)
      .eq('hospital_code', requester.hospital_code);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('nurse delete error:', err);
    res.status(500).json({ error: '간호사 삭제 중 오류가 발생했습니다.' });
  }
});

// ------------------------------------------------------------------
// 근무표 설정 (병원 하나당 한 줄, 없으면 null 반환 → 프론트에서 기본값 사용)
// ------------------------------------------------------------------
app.get('/api/roster-config', async (req, res) => {
  try {
    const requester = await getRequesterHospital(req);
    if (!requester) return res.status(401).json({ error: '로그인이 필요합니다.' });

    const { data, error } = await supabase
      .from('mediflow_roster_config')
      .select('config')
      .eq('hospital_code', requester.hospital_code)
      .maybeSingle();

    if (error) throw error;
    res.json({ config: data ? data.config : null });
  } catch (err) {
    console.error('roster-config get error:', err);
    res.status(500).json({ error: '근무표 설정 조회 중 오류가 발생했습니다.' });
  }
});

app.put('/api/roster-config', async (req, res) => {
  try {
    const requester = await getRequesterHospital(req);
    if (!requester) return res.status(401).json({ error: '로그인이 필요합니다.' });

    const { config } = req.body;
    if (!config) return res.status(400).json({ error: 'config가 필요합니다.' });

    const { error } = await supabase
      .from('mediflow_roster_config')
      .upsert({
        hospital_code: requester.hospital_code,
        config,
        updated_at: new Date().toISOString()
      }, { onConflict: 'hospital_code' });

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('roster-config update error:', err);
    res.status(500).json({ error: '근무표 설정 저장 중 오류가 발생했습니다.' });
  }
});

// ------------------------------------------------------------------
// 월별 근무표 데이터
// ------------------------------------------------------------------
app.get('/api/roster/:monthKey', async (req, res) => {
  try {
    const requester = await getRequesterHospital(req);
    if (!requester) return res.status(401).json({ error: '로그인이 필요합니다.' });

    const { data, error } = await supabase
      .from('mediflow_roster')
      .select('roster_data')
      .eq('hospital_code', requester.hospital_code)
      .eq('month_key', req.params.monthKey)
      .maybeSingle();

    if (error) throw error;
    res.json({ roster: data ? data.roster_data : {} });
  } catch (err) {
    console.error('roster get error:', err);
    res.status(500).json({ error: '근무표 조회 중 오류가 발생했습니다.' });
  }
});

app.put('/api/roster/:monthKey', async (req, res) => {
  try {
    const requester = await getRequesterHospital(req);
    if (!requester) return res.status(401).json({ error: '로그인이 필요합니다.' });

    const { roster } = req.body;
    if (!roster) return res.status(400).json({ error: 'roster 데이터가 필요합니다.' });

    const { error } = await supabase
      .from('mediflow_roster')
      .upsert({
        hospital_code: requester.hospital_code,
        month_key: req.params.monthKey,
        roster_data: roster,
        updated_at: new Date().toISOString()
      }, { onConflict: 'hospital_code,month_key' });

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('roster save error:', err);
    res.status(500).json({ error: '근무표 저장 중 오류가 발생했습니다.' });
  }
});

app.delete('/api/roster/:monthKey', async (req, res) => {
  try {
    const requester = await getRequesterHospital(req);
    if (!requester) return res.status(401).json({ error: '로그인이 필요합니다.' });

    const { error } = await supabase
      .from('mediflow_roster')
      .delete()
      .eq('hospital_code', requester.hospital_code)
      .eq('month_key', req.params.monthKey);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('roster delete error:', err);
    res.status(500).json({ error: '근무표 삭제 중 오류가 발생했습니다.' });
  }
});

// ------------------------------------------------------------------
// 🔧 운영자(개발자) 전용 대시보드 — 모든 병원의 현황을 한눈에 보기 위한 통계 API.
// 병원별 회원/간호사 규모까지 노출되는 민감한 정보라, 개발자 계정에서만 접근 가능하도록 제한한다.
// ------------------------------------------------------------------
const ADMIN_EMAIL = 'parkhy5454@gmail.com';

app.get('/api/admin/platform-stats', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { data: requester } = await supabase
      .from('mediflow_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!requester || requester.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    const [{ data: allUsers, error: usersError }, { data: allNurses, error: nursesError }, { data: allRosters, error: rosterError }] = await Promise.all([
      supabase.from('mediflow_users').select('*'),
      supabase.from('mediflow_nurses').select('hospital_code, status'),
      supabase.from('mediflow_roster').select('hospital_code, month_key, updated_at')
    ]);

    if (usersError) throw usersError;
    if (nursesError) throw nursesError;
    if (rosterError) throw rosterError;

    // 병원 코드별로 집계
    const hospitalMap = new Map();
    const ensureHospital = (code, name) => {
      if (!hospitalMap.has(code)) {
        hospitalMap.set(code, {
          hospitalCode: code,
          hospitalName: name || code,
          totalMembers: 0,
          adminCount: 0,
          memberCount: 0,
          members: [],
          totalNurses: 0,
          activeNurses: 0,
          rosterMonths: []
        });
      }
      return hospitalMap.get(code);
    };

    allUsers.forEach(u => {
      const h = ensureHospital(u.hospital_code, u.hospital_name);
      h.totalMembers++;
      if (u.role === 'admin') h.adminCount++; else h.memberCount++;
      h.members.push({ id: u.id, name: u.name, email: u.email, phone: u.phone || '', role: u.role, createdAt: u.created_at });
    });

    (allNurses || []).forEach(n => {
      const h = ensureHospital(n.hospital_code);
      h.totalNurses++;
      if (n.status === 'active') h.activeNurses++;
    });

    (allRosters || []).forEach(r => {
      const h = ensureHospital(r.hospital_code);
      h.rosterMonths.push({ monthKey: r.month_key, updatedAt: r.updated_at });
    });

    const hospitals = Array.from(hospitalMap.values())
      .sort((a, b) => (b.members[0]?.createdAt || '').localeCompare(a.members[0]?.createdAt || ''));

    res.json({
      totalHospitals: hospitals.length,
      totalUsers: allUsers.length,
      totalNurses: (allNurses || []).length,
      hospitals
    });
  } catch (err) {
    console.error('platform-stats 조회 오류:', err);
    res.status(500).json({ error: '통계 조회 중 오류가 발생했습니다.' });
  }
});

// ------------------------------------------------------------------
// 📮 사용자 문의(버그신고/기능제안/기타) — 누구나 접수 가능, 개발자만 전체 열람/처리
// ------------------------------------------------------------------
app.post('/api/feedback', async (req, res) => {
  try {
    const requester = await getRequesterHospital(req);
    if (!requester) return res.status(401).json({ error: '로그인이 필요합니다.' });

    const { type, title, message, phone } = req.body;
    if (!title || !title.trim() || !message || !message.trim()) {
      return res.status(400).json({ error: '제목과 내용을 입력해주세요.' });
    }
    if (!['bug', 'feature', 'other'].includes(type)) {
      return res.status(400).json({ error: '올바르지 않은 문의 유형입니다.' });
    }

    const { data, error } = await supabase
      .from('mediflow_feedback')
      .insert({
        hospital_code: requester.hospital_code,
        hospital_name: requester.hospital_name,
        user_id: requester.id,
        user_name: requester.name,
        user_email: requester.email,
        user_phone: phone || null,
        type,
        title: title.trim(),
        message: message.trim(),
        status: 'new'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, feedback: data });
  } catch (err) {
    console.error('feedback submit error:', err);
    res.status(500).json({ error: '문의 접수 중 오류가 발생했습니다.' });
  }
});

// 개발자 전용: 전체 병원의 문의 목록 조회
app.get('/api/feedback', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { data: requester } = await supabase
      .from('mediflow_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!requester || requester.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    const { data, error } = await supabase
      .from('mediflow_feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('feedback list error:', err);
    res.status(500).json({ error: '문의 목록 조회 중 오류가 발생했습니다.' });
  }
});

// 개발자 전용: 문의 상태/답변 업데이트
app.put('/api/feedback/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { data: requester } = await supabase
      .from('mediflow_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!requester || requester.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    const { status, resolutionNote } = req.body;
    const updates = {};
    if (status !== undefined) {
      if (!['new', 'in_progress', 'resolved'].includes(status)) {
        return res.status(400).json({ error: '올바르지 않은 상태입니다.' });
      }
      updates.status = status;
      if (status === 'resolved') updates.resolved_at = new Date().toISOString();
    }
    if (resolutionNote !== undefined) updates.resolution_note = resolutionNote;

    const { data, error } = await supabase
      .from('mediflow_feedback')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, feedback: data });
  } catch (err) {
    console.error('feedback update error:', err);
    res.status(500).json({ error: '문의 상태 변경 중 오류가 발생했습니다.' });
  }
});

// ------------------------------------------------------------------
// 🔁 근무 변경 요청 (1:1 맞교환 / 공개 대타)
// - 누구나(로그인한 회원) 요청을 만들 수 있다.
// - 'swap'(1:1 맞교환)은 상대방을 처음부터 지정하므로 바로 'ready_for_review'(승인대기) 상태로 시작.
// - 'cover'(공개 대타)는 상대방 없이 'pending'(모집중)으로 시작, 누군가 지원하면 'ready_for_review'로 전환.
// - 최종 반영(실제 근무표 수정)은 반드시 관리자의 승인(decision)을 거쳐야만 이루어진다.
// ------------------------------------------------------------------

const toPublicSwapRequest = (r) => ({
  id: r.id,
  requestType: r.request_type,
  selectedYear: r.selected_year,
  selectedMonth: r.selected_month,
  fromDay: r.from_day,
  fromShiftType: r.from_shift_type,
  fromNurseId: r.from_nurse_id,
  fromNurseName: r.from_nurse_name,
  toDay: r.to_day,
  toShiftType: r.to_shift_type,
  toNurseId: r.to_nurse_id,
  toNurseName: r.to_nurse_name,
  reason: r.reason,
  status: r.status,
  createdByUserId: r.created_by_user_id,
  createdByUserName: r.created_by_user_name,
  volunteeredByUserId: r.volunteered_by_user_id,
  reviewedByUserId: r.reviewed_by_user_id,
  reviewNote: r.review_note,
  createdAt: r.created_at,
  reviewedAt: r.reviewed_at
});

// 근무표(mediflow_roster.roster_data) JSON 안에서 특정 날짜/교대 배열에 있는 간호사를
// id 기준으로 찾아 제거하고, 그 자리에 새 간호사를 넣어주는 헬퍼.
// 원래 있어야 할 간호사가 그 자리에 없으면(그 사이 근무표가 재생성/변경된 경우) null을 반환해 실패를 알린다.
const replaceNurseInShift = (roster, day, shiftType, outNurseId, inNurseRecord) => {
  const dayData = roster[day];
  if (!dayData || !Array.isArray(dayData[shiftType])) return null;
  const idx = dayData[shiftType].findIndex(n => n.id === outNurseId);
  if (idx === -1) return null;
  const removed = dayData[shiftType][idx];
  dayData[shiftType].splice(idx, 1, {
    id: inNurseRecord.id,
    name: inNurseRecord.name,
    qualification: inNurseRecord.qualification,
    experience: inNurseRecord.experience
  });
  return removed;
};

// 요청 생성
app.post('/api/swap-requests', async (req, res) => {
  try {
    const requester = await getRequesterHospital(req);
    if (!requester) return res.status(401).json({ error: '로그인이 필요합니다.' });

    const { requestType, selectedYear, selectedMonth, fromDay, fromShiftType, fromNurseId, toDay, toShiftType, toNurseId, reason } = req.body;

    if (!['swap', 'cover'].includes(requestType)) {
      return res.status(400).json({ error: '올바르지 않은 요청 유형입니다.' });
    }
    if (selectedYear === undefined || selectedMonth === undefined || !fromDay || !fromShiftType || !fromNurseId) {
      return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
    }
    if (requestType === 'swap' && (!toDay || !toShiftType || !toNurseId)) {
      return res.status(400).json({ error: '1:1 맞교환은 상대방의 날짜/교대/간호사를 모두 선택해야 합니다.' });
    }
    if (requestType === 'swap' && toNurseId === fromNurseId) {
      return res.status(400).json({ error: '같은 간호사끼리는 맞교환할 수 없습니다.' });
    }

    const { data: fromNurse, error: fromNurseError } = await supabase
      .from('mediflow_nurses')
      .select('id, name')
      .eq('id', fromNurseId)
      .eq('hospital_code', requester.hospital_code)
      .maybeSingle();
    if (fromNurseError) throw fromNurseError;
    if (!fromNurse) return res.status(404).json({ error: '요청자 간호사를 찾을 수 없습니다.' });

    let toNurse = null;
    if (requestType === 'swap') {
      const { data, error } = await supabase
        .from('mediflow_nurses')
        .select('id, name')
        .eq('id', toNurseId)
        .eq('hospital_code', requester.hospital_code)
        .maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: '상대방 간호사를 찾을 수 없습니다.' });
      toNurse = data;
    }

    const { data: inserted, error: insertError } = await supabase
      .from('swap_requests')
      .insert({
        hospital_code: requester.hospital_code,
        request_type: requestType,
        selected_year: selectedYear,
        selected_month: selectedMonth,
        from_day: fromDay,
        from_shift_type: fromShiftType,
        from_nurse_id: fromNurse.id,
        from_nurse_name: fromNurse.name,
        to_day: requestType === 'swap' ? toDay : null,
        to_shift_type: requestType === 'swap' ? toShiftType : null,
        to_nurse_id: toNurse?.id || null,
        to_nurse_name: toNurse?.name || null,
        reason: reason || null,
        status: requestType === 'swap' ? 'ready_for_review' : 'pending',
        created_by_user_id: requester.id,
        created_by_user_name: requester.name
      })
      .select()
      .single();

    if (insertError) throw insertError;
    res.status(201).json(toPublicSwapRequest(inserted));
  } catch (err) {
    console.error('swap request create error:', err);
    res.status(500).json({ error: '근무 변경 요청 등록 중 오류가 발생했습니다.' });
  }
});

// 같은 병원의 요청 목록 조회 (전체 회원이 볼 수 있음 — 대타 모집 현황 등)
app.get('/api/swap-requests', async (req, res) => {
  try {
    const requester = await getRequesterHospital(req);
    if (!requester) return res.status(401).json({ error: '로그인이 필요합니다.' });

    let query = supabase
      .from('swap_requests')
      .select('*')
      .eq('hospital_code', requester.hospital_code)
      .order('created_at', { ascending: false });

    if (req.query.year !== undefined && req.query.month !== undefined) {
      query = query.eq('selected_year', Number(req.query.year)).eq('selected_month', Number(req.query.month));
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data.map(toPublicSwapRequest));
  } catch (err) {
    console.error('swap request list error:', err);
    res.status(500).json({ error: '근무 변경 요청 목록 조회 중 오류가 발생했습니다.' });
  }
});

// 공개 대타 요청에 지원(자원)하기
app.put('/api/swap-requests/:id/volunteer', async (req, res) => {
  try {
    const requester = await getRequesterHospital(req);
    if (!requester) return res.status(401).json({ error: '로그인이 필요합니다.' });

    const { nurseId } = req.body;
    if (!nurseId) return res.status(400).json({ error: '지원할 간호사를 선택해주세요.' });

    const { data: existing, error: fetchError } = await supabase
      .from('swap_requests')
      .select('*')
      .eq('id', req.params.id)
      .eq('hospital_code', requester.hospital_code)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!existing) return res.status(404).json({ error: '요청을 찾을 수 없습니다.' });
    if (existing.request_type !== 'cover') return res.status(400).json({ error: '공개 대타 요청에만 지원할 수 있습니다.' });
    if (existing.status !== 'pending') return res.status(409).json({ error: '이미 다른 사람이 지원했거나 처리된 요청입니다.' });
    if (nurseId === existing.from_nurse_id) return res.status(400).json({ error: '본인이 요청한 근무에는 지원할 수 없습니다.' });

    const { data: volunteerNurse, error: nurseError } = await supabase
      .from('mediflow_nurses')
      .select('id, name')
      .eq('id', nurseId)
      .eq('hospital_code', requester.hospital_code)
      .maybeSingle();
    if (nurseError) throw nurseError;
    if (!volunteerNurse) return res.status(404).json({ error: '간호사를 찾을 수 없습니다.' });

    const { data: updated, error: updateError } = await supabase
      .from('swap_requests')
      .update({
        to_nurse_id: volunteerNurse.id,
        to_nurse_name: volunteerNurse.name,
        volunteered_by_user_id: requester.id,
        status: 'ready_for_review'
      })
      .eq('id', req.params.id)
      .select()
      .single();
    if (updateError) throw updateError;

    res.json(toPublicSwapRequest(updated));
  } catch (err) {
    console.error('swap request volunteer error:', err);
    res.status(500).json({ error: '지원 처리 중 오류가 발생했습니다.' });
  }
});

// 요청 취소 (작성자 본인 또는 관리자만, 아직 승인되지 않은 요청만)
app.put('/api/swap-requests/:id/cancel', async (req, res) => {
  try {
    const requester = await getRequesterHospital(req);
    if (!requester) return res.status(401).json({ error: '로그인이 필요합니다.' });

    const { data: existing, error: fetchError } = await supabase
      .from('swap_requests')
      .select('*')
      .eq('id', req.params.id)
      .eq('hospital_code', requester.hospital_code)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!existing) return res.status(404).json({ error: '요청을 찾을 수 없습니다.' });
    if (existing.created_by_user_id !== requester.id && requester.role !== 'admin') {
      return res.status(403).json({ error: '본인이 등록한 요청만 취소할 수 있습니다.' });
    }
    if (!['pending', 'ready_for_review'].includes(existing.status)) {
      return res.status(409).json({ error: '이미 처리된 요청은 취소할 수 없습니다.' });
    }

    const { data: updated, error: updateError } = await supabase
      .from('swap_requests')
      .update({ status: 'cancelled' })
      .eq('id', req.params.id)
      .select()
      .single();
    if (updateError) throw updateError;

    res.json(toPublicSwapRequest(updated));
  } catch (err) {
    console.error('swap request cancel error:', err);
    res.status(500).json({ error: '요청 취소 중 오류가 발생했습니다.' });
  }
});

// 관리자 승인/거절 — 승인 시 실제 근무표(mediflow_roster)에 반영
app.put('/api/swap-requests/:id/decision', async (req, res) => {
  try {
    const requester = await getRequesterHospital(req);
    if (!requester) return res.status(401).json({ error: '로그인이 필요합니다.' });
    if (requester.role !== 'admin') return res.status(403).json({ error: '관리자만 승인/거절할 수 있습니다.' });

    const { decision, note } = req.body;
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ error: '올바르지 않은 처리 결과입니다.' });
    }

    const { data: swapReq, error: fetchError } = await supabase
      .from('swap_requests')
      .select('*')
      .eq('id', req.params.id)
      .eq('hospital_code', requester.hospital_code)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!swapReq) return res.status(404).json({ error: '요청을 찾을 수 없습니다.' });
    if (swapReq.status !== 'ready_for_review') {
      return res.status(409).json({ error: '승인 대기 상태인 요청만 처리할 수 있습니다. (대타 모집이 아직 안 됐거나 이미 처리됨)' });
    }

    if (decision === 'rejected') {
      const { data: updated, error: updateError } = await supabase
        .from('swap_requests')
        .update({ status: 'rejected', reviewed_by_user_id: requester.id, review_note: note || null, reviewed_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .select()
        .single();
      if (updateError) throw updateError;
      return res.json(toPublicSwapRequest(updated));
    }

    // decision === 'approved' → 실제 근무표에 반영
    const monthKey = `${swapReq.selected_year}-${swapReq.selected_month}`;
    const { data: rosterRow, error: rosterFetchError } = await supabase
      .from('mediflow_roster')
      .select('roster_data')
      .eq('hospital_code', requester.hospital_code)
      .eq('month_key', monthKey)
      .maybeSingle();
    if (rosterFetchError) throw rosterFetchError;
    if (!rosterRow || !rosterRow.roster_data) {
      return res.status(409).json({ error: '해당 월의 근무표를 찾을 수 없습니다. 근무표가 삭제되었을 수 있습니다.' });
    }

    const roster = rosterRow.roster_data;

    const [{ data: fromNurseFull }, { data: toNurseFull }] = await Promise.all([
      supabase.from('mediflow_nurses').select('id, name, qualification, experience, historical_days_by_shift').eq('id', swapReq.from_nurse_id).maybeSingle(),
      supabase.from('mediflow_nurses').select('id, name, qualification, experience, historical_days_by_shift').eq('id', swapReq.to_nurse_id).maybeSingle()
    ]);
    if (!fromNurseFull || !toNurseFull) {
      return res.status(409).json({ error: '간호사 정보를 찾을 수 없습니다. (삭제되었을 수 있음)' });
    }

    // from자리에 to간호사를 채워넣는다.
    const removedFrom = replaceNurseInShift(roster, swapReq.from_day, swapReq.from_shift_type, swapReq.from_nurse_id, toNurseFull);
    if (!removedFrom) {
      return res.status(409).json({
        error: `요청 시점과 현재 근무표가 달라져서 적용할 수 없습니다. (${swapReq.from_day}일 ${swapReq.from_shift_type} 근무에 ${swapReq.from_nurse_name}이(가) 더 이상 없습니다. 근무표가 그 사이 재생성/변경되었을 수 있습니다.)`
      });
    }

    if (swapReq.request_type === 'swap') {
      // 반대쪽 자리에도 from간호사를 채워넣는다 (진짜 맞교환).
      const removedTo = replaceNurseInShift(roster, swapReq.to_day, swapReq.to_shift_type, swapReq.to_nurse_id, fromNurseFull);
      if (!removedTo) {
        // 되돌리기: 방금 바꾼 from자리를 원상복구
        replaceNurseInShift(roster, swapReq.from_day, swapReq.from_shift_type, toNurseFull.id, fromNurseFull);
        return res.status(409).json({
          error: `요청 시점과 현재 근무표가 달라져서 적용할 수 없습니다. (${swapReq.to_day}일 ${swapReq.to_shift_type} 근무에 ${swapReq.to_nurse_name}이(가) 더 이상 없습니다.)`
        });
      }
    } else {
      // 'cover'(대타): 원래 근무자는 그 날 휴무로 이동시켜 비번 목록에서 보이게 한다.
      const day = roster[swapReq.from_day];
      if (!Array.isArray(day.offDuty)) day.offDuty = [];
      day.offDuty.push({
        id: fromNurseFull.id,
        name: fromNurseFull.name,
        qualification: fromNurseFull.qualification,
        experience: fromNurseFull.experience,
        daysRemaining: 0,
        status: 'Swapped',
        cycleInfo: `대타 승인 (${toNurseFull.name}(으)로 교체)`
      });
    }

    // [추가] 실제로 일한 근무가 바뀌었으니, 대시보드 통계(누적 교대 분포)에 쓰이는
    // historical_days_by_shift도 스왑 결과에 맞게 같이 조정한다.
    // 안 맞춰주면 다음 달 근무표 자동 생성 때 "덜 일한 줄 알고" 잘못 배정하게 됨.
    const clampNonNegative = (n) => Math.max(0, n || 0);
    const fromHist = { ...(fromNurseFull.historical_days_by_shift || {}) };
    const toHist = { ...(toNurseFull.historical_days_by_shift || {}) };

    if (swapReq.request_type === 'swap') {
      // from간호사: 원래 근무(from_shift_type) -1, 새로 맡은 근무(to_shift_type) +1
      fromHist[swapReq.from_shift_type] = clampNonNegative((fromHist[swapReq.from_shift_type] || 0) - 1);
      fromHist[swapReq.to_shift_type] = (fromHist[swapReq.to_shift_type] || 0) + 1;
      // to간호사: 반대로
      toHist[swapReq.to_shift_type] = clampNonNegative((toHist[swapReq.to_shift_type] || 0) - 1);
      toHist[swapReq.from_shift_type] = (toHist[swapReq.from_shift_type] || 0) + 1;
    } else {
      // cover: 같은 교대(from_shift_type)를 from간호사 대신 to간호사가 하루 더 한 것
      fromHist[swapReq.from_shift_type] = clampNonNegative((fromHist[swapReq.from_shift_type] || 0) - 1);
      toHist[swapReq.from_shift_type] = (toHist[swapReq.from_shift_type] || 0) + 1;
    }

    const { error: histUpdateError } = await supabase.from('mediflow_nurses').upsert([
      { id: fromNurseFull.id, historical_days_by_shift: fromHist },
      { id: toNurseFull.id, historical_days_by_shift: toHist }
    ], { onConflict: 'id' });
    if (histUpdateError) {
      // 통계 보정이 실패해도 근무표 자체는 이미 정상 반영됐으니 요청을 실패로 처리하진 않고 로그만 남긴다.
      console.error('swap request historical stats update error:', histUpdateError);
    }

    const { error: rosterSaveError } = await supabase
      .from('mediflow_roster')
      .upsert({
        hospital_code: requester.hospital_code,
        month_key: monthKey,
        roster_data: roster,
        updated_at: new Date().toISOString()
      }, { onConflict: 'hospital_code,month_key' });
    if (rosterSaveError) throw rosterSaveError;

    const { data: updatedReq, error: updateReqError } = await supabase
      .from('swap_requests')
      .update({ status: 'approved', reviewed_by_user_id: requester.id, review_note: note || null, reviewed_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (updateReqError) throw updateReqError;

    res.json(toPublicSwapRequest(updatedReq));
  } catch (err) {
    console.error('swap request decision error:', err);
    res.status(500).json({ error: '요청 처리 중 오류가 발생했습니다.' });
  }
});

// [추가] 위의 API 라우트들에서 try/catch로 못 잡고 그대로 터진(정말 예상 못한) 에러를
// 마지막으로 한 번 더 Sentry에 보고하는 안전망. DSN이 없으면 아무 동작 안 함.
if (process.env.SENTRY_DSN_BACKEND) {
  Sentry.setupExpressErrorHandler(app);
}

// ------------------------------------------------------------------
// 프로덕션 배포 시: React 빌드 결과물(build 폴더)을 정적으로 서빙
// (Render Web Service에서 "npm run build" 후 "node server.js"로 실행)
// ------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Mediflow-AI 서버가 포트 ${PORT}에서 실행 중입니다.`);
});
