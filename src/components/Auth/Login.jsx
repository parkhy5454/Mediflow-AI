// src/components/Auth/Login.jsx
import React, { useState } from 'react';

const Login = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalCode, setHospitalCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetSignupFields = () => {
    setName('');
    setHospitalName('');
    setHospitalCode('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    if (!isLogin && (!name.trim() || !hospitalName.trim() || !hospitalCode.trim())) {
      setError('이름, 병원명, 병원 코드를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const payload = isLogin
        ? { email: email.trim(), password }
        : {
            email: email.trim(),
            password,
            name: name.trim(),
            hospitalName: hospitalName.trim(),
            hospitalCode: hospitalCode.trim()
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '요청 처리 중 오류가 발생했습니다.');
        return;
      }

      onLoginSuccess(data.user);
    } catch (err) {
      console.error(err);
      setError('서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <h1 style={{ textAlign: 'center', color: '#1f2937', marginBottom: '4px', fontSize: '22px' }}>
          Mediflow-AI
        </h1>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '24px', fontSize: '13px' }}>
          병원 간호사 근무 관리 시스템
        </p>

        {/* 로그인 / 회원가입 전환 탭 */}
        <div style={{ display: 'flex', marginBottom: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '4px' }}>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: isLogin ? 'white' : 'transparent',
              color: isLogin ? '#1f2937' : '#6b7280',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: isLogin ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: !isLogin ? 'white' : 'transparent',
              color: !isLogin ? '#1f2937' : '#6b7280',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: !isLogin ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!isLogin && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                  이름
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                  병원명
                </label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="예: 서울중앙병원"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                  병원 코드
                </label>
                <input
                  type="text"
                  value={hospitalCode}
                  onChange={(e) => setHospitalCode(e.target.value)}
                  placeholder="같은 병원 동료와 동일하게 입력하세요"
                  style={inputStyle}
                />
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', lineHeight: '1.4' }}>
                  같은 병원 코드로 가입하면 같은 병원 소속으로 데이터가 연동됩니다. 처음 가입하는 분은 자동으로 관리자가 됩니다.
                </p>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@hospital.com"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상 입력해주세요"
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ color: '#dc2626', fontSize: '13px', backgroundColor: '#fef2f2', padding: '8px 12px', borderRadius: '6px' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontWeight: '600',
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
          </button>
        </form>

        <p
          style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#6b7280', cursor: 'pointer' }}
          onClick={() => { setIsLogin(!isLogin); setError(''); resetSignupFields(); }}
        >
          {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
        </p>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  boxSizing: 'border-box'
};

export default Login;
