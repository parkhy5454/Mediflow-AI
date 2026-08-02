// src/components/Members/MemberManagement.jsx
import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, Loader2, KeyRound, Copy, X, History } from 'lucide-react';
import { formatPhoneNumber } from '../../utils/phoneUtils';

const AUDIT_ACTION_LABEL = {
  role_change: '권한 변경',
  password_reset: '비밀번호 초기화',
  roster_delete: '근무표 삭제',
  swap_approved: '근무 변경 승인',
  swap_rejected: '근무 변경 거절',
  leave_approved: '휴가 승인',
  leave_rejected: '휴가 거절'
};

const MemberManagement = ({ currentUser, onUserUpdate }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [resettingId, setResettingId] = useState(null);
  // 방금 발급한 임시 비밀번호. 딱 한 번만 화면에 보여주고, 닫으면 다시는 어디서도 볼 수 없다.
  const [resetResult, setResetResult] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/users', {
        headers: { 'x-user-id': currentUser.id }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '회원 목록을 가져오지 못했습니다.');
      setMembers(data);
    } catch (err) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLog = async () => {
    setAuditLoading(true);
    try {
      const res = await fetch('/api/audit-log', { headers: { 'x-user-id': currentUser.id } });
      const data = await res.json();
      if (res.ok) setAuditLog(data);
    } catch (err) {
      console.error('감사 로그 조회 실패:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    if (currentUser.role === 'admin') fetchAuditLog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAdmin = currentUser.role === 'admin';
  const adminCount = members.filter(m => m.role === 'admin').length;
  const hospitalHasNoAdmin = !loading && !error && adminCount === 0;

  const changeRole = async (targetId, newRole) => {
    setActionError('');
    setUpdatingId(targetId);
    try {
      const res = await fetch(`/api/auth/users/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '역할 변경에 실패했습니다.');
      setMembers(prev => prev.map(m => (m.id === targetId ? { ...m, role: newRole } : m)));
      // 본인의 역할이 바뀐 경우, 앱 전역 currentUser도 함께 갱신해야
      // 새로고침 없이 바로 관리자 화면들이 보인다.
      if (targetId === currentUser.id && onUserUpdate) {
        onUserUpdate({ role: newRole });
      }
      fetchAuditLog();
    } catch (err) {
      setActionError(err.message || '역할 변경 중 오류가 발생했습니다.');
    } finally {
      setUpdatingId(null);
    }
  };

  const resetPassword = async (targetId) => {
    if (!window.confirm('이 회원의 비밀번호를 초기화하시겠습니까? 기존 비밀번호는 더 이상 쓸 수 없게 됩니다.')) return;
    setActionError('');
    setResettingId(targetId);
    try {
      const res = await fetch(`/api/auth/users/${targetId}/reset-password`, {
        method: 'PUT',
        headers: { 'x-user-id': currentUser.id }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '비밀번호 초기화에 실패했습니다.');
      setResetResult(data);
      fetchAuditLog();
    } catch (err) {
      setActionError(err.message || '비밀번호 초기화 중 오류가 발생했습니다.');
    } finally {
      setResettingId(null);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <ShieldCheck size={22} style={{ color: '#3b82f6' }} />
        <h2 style={{ color: '#1f2937', margin: 0 }}>회원 관리</h2>
      </div>
      <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>
        {currentUser.hospitalName} 소속 회원 목록입니다.
        {isAdmin ? ' 관리자는 동료의 권한을 관리자/일반 사용자로 지정할 수 있습니다.' : ''}
      </p>

      {actionError && (
        <p style={{ color: '#dc2626', fontSize: '13px', backgroundColor: '#fef2f2', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px' }}>
          {actionError}
        </p>
      )}

      {hospitalHasNoAdmin && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: '#fffbeb',
          border: '1px solid #fcd34d',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '13px', color: '#92400e' }}>
            ⚠️ 이 병원에는 아직 관리자가 없습니다. 근무표 설정 등 관리 기능을 쓰려면 관리자가 1명 필요합니다.
          </div>
          {!isAdmin && (
            <button
              disabled={updatingId === currentUser.id}
              onClick={() => changeRole(currentUser.id, 'admin')}
              style={{
                flexShrink: 0,
                fontSize: '12px',
                fontWeight: '600',
                padding: '7px 14px',
                borderRadius: '6px',
                border: '1px solid #f59e0b',
                backgroundColor: '#f59e0b',
                color: 'white',
                cursor: updatingId === currentUser.id ? 'not-allowed' : 'pointer',
                opacity: updatingId === currentUser.id ? 0.6 : 1
              }}
            >
              {updatingId === currentUser.id ? '처리 중...' : '내가 관리자 되기'}
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', padding: '30px 0', justifyContent: 'center' }}>
          <Loader2 size={18} className="animate-spin" />
          회원 목록 불러오는 중...
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', color: '#dc2626', padding: '30px 0' }}>
          <p>{error}</p>
          <button
            onClick={fetchMembers}
            style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{
            display: 'flex',
            padding: '10px 16px',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            fontSize: '12px',
            fontWeight: '600',
            color: '#6b7280'
          }}>
            <div style={{ flex: 2 }}>이름 / 이메일</div>
            <div style={{ flex: 1 }}>역할</div>
            {isAdmin && <div style={{ flex: 2, textAlign: 'right' }}>권한 지정</div>}
          </div>

          {members.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
              표시할 회원이 없습니다.
            </div>
          ) : (
            [...members].sort((a, b) => (a.role === 'admin' ? 0 : 1) - (b.role === 'admin' ? 0 : 1)).map((m) => {
              const isMe = m.id === currentUser.id;
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: '1px solid #f3f4f6',
                    backgroundColor: isMe ? '#eff6ff' : 'white'
                  }}
                >
                  <div style={{ flex: 2 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {m.name}
                      {isMe && (
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '700',
                          color: '#1d4ed8',
                          backgroundColor: '#dbeafe',
                          padding: '2px 6px',
                          borderRadius: '10px'
                        }}>
                          나
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{m.email}</div>
                    {m.phone && <div style={{ fontSize: '12px', color: '#9ca3af' }}>{formatPhoneNumber(m.phone)}</div>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '10px',
                      backgroundColor: m.role === 'admin' ? '#fef3c7' : '#f3f4f6',
                      color: m.role === 'admin' ? '#92400e' : '#4b5563'
                    }}>
                      {m.role === 'admin' ? '관리자' : '일반 사용자'}
                    </span>
                  </div>
                  {isAdmin && (
                    <div style={{ flex: 2, display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                      {!isMe ? (
                        <>
                          <button
                            disabled={updatingId === m.id || m.role === 'admin'}
                            onClick={() => changeRole(m.id, 'admin')}
                            style={{
                              fontSize: '11px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #fcd34d',
                              backgroundColor: '#fffbeb',
                              color: '#92400e',
                              cursor: (updatingId === m.id || m.role === 'admin') ? 'not-allowed' : 'pointer',
                              opacity: (updatingId === m.id || m.role === 'admin') ? 0.5 : 1
                            }}
                          >
                            관리자로 지정
                          </button>
                          <button
                            disabled={updatingId === m.id || m.role === 'member'}
                            onClick={() => changeRole(m.id, 'member')}
                            style={{
                              fontSize: '11px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #d1d5db',
                              backgroundColor: '#f9fafb',
                              color: '#374151',
                              cursor: (updatingId === m.id || m.role === 'member') ? 'not-allowed' : 'pointer',
                              opacity: (updatingId === m.id || m.role === 'member') ? 0.5 : 1
                            }}
                          >
                            일반 사용자로 지정
                          </button>
                          <button
                            disabled={resettingId === m.id}
                            onClick={() => resetPassword(m.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '4px',
                              fontSize: '11px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #fca5a5',
                              backgroundColor: '#fef2f2',
                              color: '#b91c1c',
                              cursor: resettingId === m.id ? 'not-allowed' : 'pointer',
                              opacity: resettingId === m.id ? 0.5 : 1
                            }}
                          >
                            <KeyRound size={12} /> {resettingId === m.id ? '초기화 중...' : '비밀번호 초기화'}
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>본인은 변경 불가</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      <p style={{ marginTop: '16px', fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <UserCheck size={14} />
        총 {members.length}명의 회원이 {currentUser.hospitalName}에 소속되어 있습니다.
      </p>

      {isAdmin && (
        <div style={{ marginTop: '28px' }}>
          <h3 style={{ fontSize: '14px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <History size={16} /> 최근 관리자 활동
          </h3>
          {auditLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '12px', padding: '10px 0' }}>
              <Loader2 size={14} className="animate-spin" /> 불러오는 중...
            </div>
          ) : auditLog.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>아직 기록된 활동이 없습니다.</p>
          ) : (
            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
              {auditLog.map((l, idx) => (
                <div
                  key={l.id}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px',
                    padding: '10px 16px',
                    borderBottom: idx === auditLog.length - 1 ? 'none' : '1px solid #f3f4f6'
                  }}
                >
                  <div style={{ fontSize: '13px', color: '#374151' }}>
                    <span style={{
                      fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '10px',
                      backgroundColor: '#eff6ff', color: '#1d4ed8', marginRight: '8px'
                    }}>
                      {AUDIT_ACTION_LABEL[l.action] || l.action}
                    </span>
                    {l.targetDescription}
                    <span style={{ color: '#9ca3af' }}> — {l.actorName}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', flexShrink: 0 }}>
                    {new Date(l.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {resetResult && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '380px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={18} style={{ color: '#3b82f6' }} />
                <h3 style={{ margin: 0, fontSize: '16px', color: '#1f2937' }}>임시 비밀번호 발급됨</h3>
              </div>
              <button onClick={() => setResetResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '8px 0 16px' }}>
              <strong>{resetResult.userName}</strong>님({resetResult.userEmail})에게 아래 임시 비밀번호를 전화나 메시지로 직접 전달해주세요.
              이 창을 닫으면 다시는 확인할 수 없습니다.
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px',
              padding: '12px 14px', marginBottom: '16px'
            }}>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', letterSpacing: '1px', fontFamily: 'monospace' }}>
                {resetResult.tempPassword}
              </span>
              <button
                onClick={() => navigator.clipboard?.writeText(resetResult.tempPassword)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', fontSize: '11px', cursor: 'pointer' }}
              >
                <Copy size={12} /> 복사
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '16px' }}>
              이 사용자는 다음 로그인 시 이 임시 비밀번호로 들어온 뒤, 반드시 본인만 아는 새 비밀번호로 바꿔야 계속 사용할 수 있습니다.
            </p>
            <button
              onClick={() => setResetResult(null)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              확인, 전달했습니다
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
