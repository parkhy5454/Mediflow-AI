// src/components/Auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { formatPhoneNumber } from '../../utils/phoneUtils';
import TermsModal from './TermsModal';

import { useTranslation } from 'react-i18next';

const Login = ({ onLoginSuccess }) => {
  const { t } = useTranslation();
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
  // [추가] 비밀번호 찾기
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  // [추가] 초대 리워드용 추천인 병원 코드. 앱 소개 공유 링크(?ref=XXXX)로 들어왔을 때만 채워지며,
  // 완전히 새로운 병원으로 가입할 때만 서버에 함께 전달되어 추천인에게 보상을 지급하는 데 쓰인다.
  const [referredByHospitalCode, setReferredByHospitalCode] = useState('');
  // [추가] 관리자 계정 2단계 인증(이메일 OTP). 비밀번호까지 맞으면 서버가 requiresOtp:true를 주고,
  // 그때부터는 로그인 폼 대신 이 화면(인증코드 입력)을 보여준다.
  const [otpPending, setOtpPending] = useState(null); // { userId, maskedEmail } | null
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);
  const [otpResendMessage, setOtpResendMessage] = useState('');

  useEffect(() => {
    if (otpResendCooldown <= 0) return;
    const timer = setTimeout(() => setOtpResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [otpResendCooldown]);

  // [추가] 동료 초대 공유 링크(?hospitalCode=XXXX)로 들어온 경우, 회원가입 화면으로 전환하고
  // 병원 코드를 미리 채워준다. (공유/초대 기능과 연동)
  // 앱 소개 공유 링크(?ref=XXXX)로 들어온 경우에는 병원 코드를 채우지 않고, 추천인 코드만
  // 기억해뒀다가 회원가입 시 서버로 전달한다(초대 리워드).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invitedCode = params.get('hospitalCode');
    const refCode = params.get('ref');
    if (invitedCode) {
      setIsLogin(false);
      setHospitalCode(invitedCode);
      window.history.replaceState({}, '', window.location.pathname);
    } else if (refCode) {
      setIsLogin(false);
      setReferredByHospitalCode(refCode);
      window.history.replaceState({}, '', window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMessage('');
    if (!forgotEmail.trim()) return;
    setForgotSending(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      const data = await res.json();
      setForgotMessage(data.message || t('요청을 처리했습니다.'));
    } catch (err) {
      setForgotMessage(t('요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'));
    } finally {
      setForgotSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError(t('이메일과 비밀번호를 입력해주세요.'));
      return;
    }
    if (!isLogin && (!name.trim() || !hospitalName.trim() || !hospitalCode.trim())) {
      setError(t('이름, 병원명, 병원 코드를 모두 입력해주세요.'));
      return;
    }
    if (!isLogin && !(password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password))) {
      setError(t('비밀번호는 영문과 숫자를 포함해 8자 이상이어야 합니다.'));
      return;
    }
    if (!isLogin && !agreedToTerms) {
      setError(t('이용약관 및 개인정보처리방침에 동의해야 회원가입할 수 있습니다.'));
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
            agreedToTerms: true,
            referredByHospitalCode: referredByHospitalCode ? referredByHospitalCode.trim() : undefined
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('요청 처리 중 오류가 발생했습니다.'));
        return;
      }

      // [추가] 관리자 계정은 비밀번호만으로는 로그인이 끝나지 않고, 이메일 인증코드 입력 화면으로 넘어간다.
      if (data.requiresOtp) {
        setOtpPending({ userId: data.userId, maskedEmail: data.maskedEmail });
        setOtpCode('');
        setOtpError('');
        setOtpResendCooldown(30);
        return;
      }

      // [수정] 서버가 발급한 서명된 토큰(token)을 user 정보와 함께 저장한다.
      // 이후 모든 API 요청은 이 토큰으로 인증하며, uuid만으로는 더 이상 인증되지 않는다.
      onLoginSuccess({ ...data.user, token: data.token });
    } catch (err) {
      console.error(err);
      setError(t('서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    if (!otpCode.trim()) {
      setOtpError(t('인증코드를 입력해주세요.'));
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/verify-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: otpPending.userId, code: otpCode.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || t('요청 처리 중 오류가 발생했습니다.'));
        return;
      }
      onLoginSuccess({ ...data.user, token: data.token });
    } catch (err) {
      console.error(err);
      setOtpError(t('서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpResendCooldown > 0 || !otpPending) return;
    setOtpResendMessage('');
    setOtpError('');
    try {
      const res = await fetch('/api/auth/resend-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: otpPending.userId })
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || t('요청 처리 중 오류가 발생했습니다.'));
        return;
      }
      setOtpResendCooldown(30);
      setOtpResendMessage(t('인증코드를 다시 보냈습니다.'));
    } catch (err) {
      setOtpError(t('서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'));
    }
  };

  // [추가] 관리자 계정 2단계 인증: 인증코드 입력 화면. 로그인/회원가입 폼 대신 이걸 보여준다.
  if (otpPending) {
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
            {t('로그인 인증코드')}
          </h1>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '24px', fontSize: '13px', lineHeight: '1.5' }}>
            {t('{{email}}(으)로 보낸 6자리 인증코드를 입력해주세요.', { email: otpPending.maskedEmail })}
          </p>

          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="000000"
              style={{ ...inputStyle, textAlign: 'center', fontSize: '22px', letterSpacing: '0.3em', fontWeight: '700' }}
            />

            {otpError && (
              <p style={{ color: '#dc2626', fontSize: '13px', backgroundColor: '#fef2f2', padding: '8px 12px', borderRadius: '6px' }}>
                {otpError}
              </p>
            )}
            {otpResendMessage && !otpError && (
              <p style={{ color: '#166534', fontSize: '12px', margin: 0 }}>{otpResendMessage}</p>
            )}

            <button
              type="submit"
              disabled={otpLoading}
              style={{
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#3b82f6',
                color: 'white',
                fontWeight: '600',
                fontSize: '14px',
                cursor: otpLoading ? 'not-allowed' : 'pointer',
                opacity: otpLoading ? 0.7 : 1
              }}
            >
              {otpLoading ? t('확인 중...') : t('확인')}
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => { setOtpPending(null); setPassword(''); setOtpResendMessage(''); }}
              style={{ background: 'none', border: 'none', padding: 0, color: '#6b7280', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer' }}
            >
              {t('뒤로가기')}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={otpResendCooldown > 0}
              style={{ background: 'none', border: 'none', padding: 0, color: otpResendCooldown > 0 ? '#9ca3af' : '#3b82f6', fontSize: '12px', textDecoration: 'underline', cursor: otpResendCooldown > 0 ? 'not-allowed' : 'pointer' }}
            >
              {otpResendCooldown > 0 ? t('재전송 ({{seconds}}초)', { seconds: otpResendCooldown }) : t('인증코드 재전송')}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          {t('병원 간호사 근무 관리 시스템')}
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
            {t('로그인')}
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
            {t('회원가입')}
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!isLogin && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                  {t('이름')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('홍길동')}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                  {t('전화번호 (선택)')}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                  placeholder="010-1234-5678"
                  style={inputStyle}
                />
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                  {t('근무 변경/대타 요청 시 동료가 연락할 수 있도록 등록해두면 좋습니다.')}
                </p>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                  {t('병원 코드')}
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
                  placeholder={t('같은 병원 동료와 동일하게 입력하세요')}
                  style={inputStyle}
                />
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', lineHeight: '1.4' }}>
                  {t(
                    "같은 병원 코드로 가입하면 같은 병원 소속으로 데이터가 연동됩니다. 먼저 입력하시면 이미 등록된 병원인지 확인해서 병원명을 자동으로 채워드려요."
                  )}
                </p>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                  {t('병원명')} {existingHospitalName && <span style={{ color: '#3b82f6', fontWeight: '400' }}>{t('(자동 입력됨)')}</span>}
                </label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder={hospitalCode.trim() ? t('병원 코드를 먼저 확인 중...') : t('병원 코드를 먼저 입력하세요')}
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
                    ? t('이미 등록된 병원이라 기존 병원명으로 자동 입력되며 수정할 수 없습니다.')
                    : hospitalCode.trim()
                      ? t('새 병원 코드입니다. 이 병원의 정식 명칭을 입력해주세요. (이후 같은 코드로 가입하는 동료에게 이 이름이 그대로 쓰입니다)')
                      : t('병원 코드를 입력하면 여기에 자동으로 채워지거나, 새 병원이면 직접 입력할 수 있습니다.')}
                </p>
              </div>

              {/* 병원 코드에 따라 관리자 선택지를 보여줄지 결정 */}
              {hospitalCode.trim() && !checkingHospital && hospitalHasAdmin === false && (
                <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                    {t('가입 유형')}
                  </label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                      <input type="radio" name="wantsAdmin" checked={!wantsAdmin} onChange={() => setWantsAdmin(false)} />
                      {t('일반 사용자')}
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                      <input type="radio" name="wantsAdmin" checked={wantsAdmin} onChange={() => setWantsAdmin(true)} />
                      {t('관리자')}
                    </label>
                  </div>
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px', lineHeight: '1.4' }}>
                    {t(
                      "이 병원 코드로는 아직 아무도 관리자로 가입하지 않았습니다. 이 병원의 실제 담당자라면 \"관리자\"를 선택하세요. 이후 다른 관리자 지정은 회원 관리에서 관리자만 할 수 있습니다."
                    )}
                  </p>
                </div>
              )}
              {hospitalCode.trim() && !checkingHospital && hospitalHasAdmin === true && (
                <p style={{ fontSize: '11px', color: '#9ca3af', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 12px', lineHeight: '1.4' }}>
                  {t('이 병원은 이미 관리자가 등록되어 있어 일반 사용자로 가입됩니다. 관리자 권한이 필요하면 가입 후 병원 관리자에게 요청하세요.')}
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
                    {t('이용약관 및 개인정보처리방침')}
                  </button>
                  {t('에 동의합니다. (필수)')}
                </span>
              </label>
            </>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
              {t('이메일')}
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
              {t('비밀번호')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isLogin ? t('비밀번호') : t('영문+숫자 포함 8자 이상')}
              style={inputStyle}
            />
            {isLogin && (
              <button
                type="button"
                onClick={() => { setShowForgotPassword(v => !v); setForgotMessage(''); }}
                style={{ background: 'none', border: 'none', padding: 0, marginTop: '6px', color: '#6b7280', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer' }}
              >
                {t('비밀번호를 잊으셨나요?')}
              </button>
            )}
          </div>

          {isLogin && showForgotPassword && (
            <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px' }}>
                {t('가입하신 이메일로 임시 비밀번호를 보내드립니다.')}
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder={t('가입한 이메일')}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={forgotSending}
                  style={{ padding: '0 16px', borderRadius: '6px', border: 'none', backgroundColor: '#374151', color: 'white', fontSize: '13px', fontWeight: '600', cursor: forgotSending ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                >
                  {forgotSending ? t('전송 중...') : t('전송')}
                </button>
              </div>
              {forgotMessage && (
                <p style={{ fontSize: '12px', color: '#166534', marginTop: '8px', marginBottom: 0 }}>{forgotMessage}</p>
              )}
            </div>
          )}

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
            {loading ? t('처리 중...') : isLogin ? t('로그인') : t('회원가입')}
          </button>
        </form>

        <p
          style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#6b7280', cursor: 'pointer' }}
          onClick={() => { setIsLogin(!isLogin); setError(''); resetSignupFields(); }}
        >
          {isLogin ? t('계정이 없으신가요? 회원가입') : t('이미 계정이 있으신가요? 로그인')}
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
