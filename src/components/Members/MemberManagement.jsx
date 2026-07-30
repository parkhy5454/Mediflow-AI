// src/components/Members/MemberManagement.jsx
import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, Loader2 } from 'lucide-react';

const MemberManagement = ({ currentUser }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [actionError, setActionError] = useState('');

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

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAdmin = currentUser.role === 'admin';

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
    } catch (err) {
      setActionError(err.message || '역할 변경 중 오류가 발생했습니다.');
    } finally {
      setUpdatingId(null);
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
            members.map((m) => {
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
                    <div style={{ flex: 2, display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
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
    </div>
  );
};

export default MemberManagement;
