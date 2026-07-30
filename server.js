// server.js
// Mediflow-AI 백엔드 서버 (Express).
// - 병원 단위 회원가입/로그인 처리
// - 같은 병원(hospitalCode 기준)으로 처음 가입하면 자동으로 admin, 이미 있으면 member로 배정
// - 실제 회원 데이터는 Supabase(mediflow_users 테이블)에 저장되어 서버가 재시작돼도 유지됨
//
// 필요한 환경변수 (Render > Environment 탭에서 등록):
//   SUPABASE_URL              - Supabase 프로젝트 URL
//   SUPABASE_SERVICE_ROLE_KEY - Supabase Service Role 키 (절대 프론트엔드에 노출하지 말 것)
//   PORT                      - Render가 자동으로 지정해줌 (없으면 5000 사용)

const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

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
  hospitalName: u.hospital_name,
  hospitalCode: u.hospital_code,
  role: u.role,
  createdAt: u.created_at
});

// ------------------------------------------------------------------
// 회원가입
// 같은 병원(hospitalCode, 대소문자/공백 무시하고 비교)으로 가입된 사람이 없으면 자동으로 admin,
// 이미 있으면 자동으로 member로 배정한다. (역할을 직접 선택하지 않음)
// ------------------------------------------------------------------
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, hospitalName, hospitalCode } = req.body;

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

    // 같은 병원(hospitalCode) 소속 가입자가 있는지 확인 → 있으면 member, 없으면 admin
    const { data: hospitalMembers, error: hospitalCheckError } = await supabase
      .from('mediflow_users')
      .select('id')
      .eq('hospital_code', normalizedHospitalCode)
      .limit(1);

    if (hospitalCheckError) throw hospitalCheckError;
    const role = (hospitalMembers && hospitalMembers.length > 0) ? 'member' : 'admin';

    const passwordHash = bcrypt.hashSync(password, 10);

    const { data: inserted, error: insertError } = await supabase
      .from('mediflow_users')
      .insert({
        email: normalizedEmail,
        password: passwordHash,
        name: name.trim(),
        hospital_name: hospitalName.trim(),
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
    if (!requester || requester.role !== 'admin') {
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
