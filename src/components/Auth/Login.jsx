// src/components/Auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { formatPhoneNumber } from '../../utils/phoneUtils';
import TermsModal from './TermsModal';

const Login = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalCode, setHospitalCode] = useState('');
  const [wantsAdmin, setWantsAdmin] = useState(false);
  // 병원 코드로 조회한 "이미 관리자가 있는지" 상태. null = 아직 확인 전(입력 비어있거나 조회 중)
  const [hospitalHasAdmin, setHospitalHasAdmin] = useState(null);
  // 그 병원 코드로 이미 등록된 병원명. null이면 새 병원(직접 입력 가능), 값이 있으면 자동입력 + 잠금.
  const [existingHospitalName, setExistingHospitalName] = useState(null);
  const [checkingHospital, setCheckingHospital] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const resetSignupFields = () => {
    setName('');
    setPhone('');
    setHospitalName('');
    setHospitalCode('');
    setWantsAdmin(false);
    setHospitalHasAdmin(null);
    setExistingHospitalName(null);
    setAgreedToTerms(false);
  };

  // 병원 코드를 입력하는 동안(0.5초 멈추면) 그 병원에 이미 관리자가 있는지 + 기존 병원명을 서버에 확인.
  // 이미 등록된 병원이면 병원명을 자동으로 채우고 수정하지 못하게 잠가서, 같은 병원인데
  // 병원명이 사람마다 다르게 저장되는 걸(오타, 띄어쓰기 차이 등) 원천적으로 막는다.
  useEffect(() => {
    if (isLogin || !hospitalCode.trim()) {
      setHospitalHasAdmin(null);
      setExistingHospitalName(null);
      return;
    }
    const timer = setTimeout(async () => {
      setCheckingHospital(true);
      try {
        const res = await fetch(`/api/auth/hospital-status?code=${encodeURIComponent(hospitalCode.trim())}`);
        const data = await res.json();
        if (res.ok) {
          setHospitalHasAdmin(!!data.hasAdmin);
          if (data.hasAdmin) setWantsAdmin(false); // 이미 관리자가 있으면 선택 초기화
          if (data.hospitalName) {
            setExistingHospitalName(data.hospitalName);
            setHospitalName(data.hospitalName); // 자동입력
          } else {
            setExistingHospitalName(null);
          }
        }
      } catch (err) {
        console.error('병원 코드 확인 실패:', err);
      } finally {
        setCheckingHospital(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [hospitalCode, isLogin]);

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
    if (!isLogin && !(password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password))) {
      setError('비밀번호는 영문과 숫자를 포함해 8자 이상이어야 합니다.');
      return;
    }
    if (!isLogin && !agreedToTerms) {
      setError('이용약관 및 개인정보처리방침에 동의해야 회원가입할 수 있습니다.');
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
            phone: phone.trim(),
            hospitalName: hospitalName.trim(),
            hospitalCode: hospitalCode.trim(),
            wantsAdmin: hospitalHasAdmin === false && wantsAdmin === true,
            agreedToTerms: true
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
                  전화번호 (선택)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                  placeholder="010-1234-5678"
                  style={inputStyle}
                />
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                  근무 변경/대타 요청 시 동료가 연락할 수 있도록 등록해두면 좋습니다.
                </p>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                  병원 코드
                </label>
                <input
                  type="text"
                  value={hospitalCode}
                  onChange={(e) => {
                    setHospitalCode(e.target.value);
                    // 코드가 바뀌면 이전 코드에서 자동입력됐던 병원명은 일단 지우고, 새로 확인해서 다시 채운다.
                    setExistingHospitalName(null);
                    setHospitalName('');
                  }}
                  placeholder="같은 병원 동료와 동일하게 입력하세요"
                  style={inputStyle}
                />
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', lineHeight: '1.4' }}>
                  같은 병원 코드로 가입하면 같은 병원 소속으로 데이터가 연동됩니다. 먼저 입력하시면 이미 등록된 병원인지 확인해서 병원명을 자동으로 채워드려요.
                </p>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                  병원명 {existingHospitalName && <span style={{ color: '#3b82f6', fontWeight: '400' }}>(자동 입력됨)</span>}
                </label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder={hospitalCode.trim() ? '병원 코드를 먼저 확인 중...' : '병원 코드를 먼저 입력하세요'}
                  readOnly={!!existingHospitalName}
                  disabled={!hospitalCode.trim()}
                  style={{
                    ...inputStyle,
                    backgroundColor: existingHospitalName ? '#f3f4f6' : (!hospitalCode.trim() ? '#f9fafb' : 'white'),
                    cursor: existingHospitalName ? 'not-allowed' : 'text'
                  }}
                />
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', lineHeight: '1.4' }}>
                  {existingHospitalName
                    ? '이미 등록된 병원이라 기존 병원명으로 자동 입력되며 수정할 수 없습니다.'
                    : hospitalCode.trim()
                      ? '새 병원 코드입니다. 이 병원의 정식 명칭을 입력해주세요. (이후 같은 코드로 가입하는 동료에게 이 이름이 그대로 쓰입니다)'
                      : '병원 코드를 입력하면 여기에 자동으로 채워지거나, 새 병원이면 직접 입력할 수 있습니다.'}
                </p>
              </div>

              {/* 병원 코드에 따라 관리자 선택지를 보여줄지 결정 */}
              {hospitalCode.trim() && !checkingHospital && hospitalHasAdmin === false && (
                <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                    가입 유형
                  </label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                      <input type="radio" name="wantsAdmin" checked={!wantsAdmin} onChange={() => setWantsAdmin(false)} />
                      일반 사용자
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                      <input type="radio" name="wantsAdmin" checked={wantsAdmin} onChange={() => setWantsAdmin(true)} />
                      관리자
                    </label>
                  </div>
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px', lineHeight: '1.4' }}>
                    이 병원 코드로는 아직 아무도 관리자로 가입하지 않았습니다. 이 병원의 실제 담당자라면 "관리자"를 선택하세요. 이후 다른 관리자 지정은 회원 관리에서 관리자만 할 수 있습니다.
                  </p>
                </div>
              )}
              {hospitalCode.trim() && !checkingHospital && hospitalHasAdmin === true && (
                <p style={{ fontSize: '11px', color: '#9ca3af', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 12px', lineHeight: '1.4' }}>
                  이 병원은 이미 관리자가 등록되어 있어 일반 사용자로 가입됩니다. 관리자 권한이 필요하면 가입 후 병원 관리자에게 요청하세요.
                </p>
              )}

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  style={{ marginTop: '2px' }}
                />
                <span>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}
                    style={{ background: 'none', border: 'none', padding: 0, color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px' }}
                  >
                    이용약관 및 개인정보처리방침
                  </button>
                  에 동의합니다. (필수)
                </span>
              </label>
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
              placeholder={isLogin ? '비밀번호' : '영문+숫자 포함 8자 이상'}
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

      {showTermsModal && <TermsModal onClose={() => setShowTermsModal(false)} />}
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
