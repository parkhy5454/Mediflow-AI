// src/components/Admin/AdminDashboard.jsx
// 개발자(운영자) 전용: 모든 병원의 가입/사용 현황 + 사용자 문의함을 보는 대시보드.
import React, { useState, useEffect } from 'react';
import { formatPhoneNumber } from '../../utils/phoneUtils';
import {
  Building2, Users, UserCheck, Calendar, Loader2, RefreshCw, ChevronDown, ChevronUp,
  Inbox, Bug, Lightbulb, HelpCircle, Mail, Phone, Clock, CheckCircle2, KeyRound, Copy, X
} from 'lucide-react';

const TYPE_INFO = {
  bug: { label: '버그 신고', icon: Bug, color: '#dc2626' },
  feature: { label: '기능 제안', icon: Lightbulb, color: '#d97706' },
  other: { label: '기타 문의', icon: HelpCircle, color: '#3b82f6' }
};

const STATUS_INFO = {
  new: { label: '신규', color: '#dc2626', bg: '#fef2f2' },
  in_progress: { label: '처리중', color: '#d97706', bg: '#fffbeb' },
  resolved: { label: '완료', color: '#059669', bg: '#f0fdf4' }
};

const AdminDashboard = ({ currentUser }) => {
  const [view, setView] = useState('hospitals'); // 'hospitals' | 'feedback'

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedHospital, setExpandedHospital] = useState(null);
  const [resettingId, setResettingId] = useState(null);
  // 방금 발급한 임시 비밀번호. 딱 한 번만 화면에 보여주고, 닫으면 다시는 어디서도 볼 수 없다.
  const [resetResult, setResetResult] = useState(null);

  const resetPassword = async (targetId) => {
    if (!window.confirm('운영자 권한으로 이 회원의 비밀번호를 초기화하시겠습니까?')) return;
    setResettingId(targetId);
    try {
      const res = await fetch(`/api/auth/users/${targetId}/reset-password`, {
        method: 'PUT',
        headers: { 'x-user-id': currentUser.id }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '비밀번호 초기화에 실패했습니다.');
      setResetResult(data);
    } catch (err) {
      alert(err.message || '비밀번호 초기화 중 오류가 발생했습니다.');
    } finally {
      setResettingId(null);
    }
  };

  const [feedbackItems, setFeedbackItems] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackFilter, setFeedbackFilter] = useState('all');
  const [noteDrafts, setNoteDrafts] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/platform-stats', {
        headers: { 'x-user-id': currentUser.id }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '통계를 불러오지 못했습니다.');
      setStats(data);
    } catch (err) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const res = await fetch('/api/feedback', { headers: { 'x-user-id': currentUser.id } });
      const data = await res.json();
      if (res.ok) setFeedbackItems(data);
    } catch (err) {
      console.error('문의 목록 조회 실패:', err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFeedback = async (id, updates) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackItems(prev => prev.map(f => (f.id === id ? data.feedback : f)));
      }
    } catch (err) {
      console.error('문의 상태 변경 실패:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredFeedback = feedbackItems.filter(f => feedbackFilter === 'all' || f.status === feedbackFilter);
  const newCount = feedbackItems.filter(f => f.status === 'new').length;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={22} style={{ color: '#7c3aed' }} />
            운영자 대시보드
          </h2>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '4px 0 0 0' }}>
            모든 병원의 현황과 사용자 문의를 확인합니다. (개발자 전용)
          </p>
        </div>
        <button
          onClick={() => { fetchStats(); fetchFeedback(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db',
            borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#374151'
          }}
        >
          <RefreshCw size={14} className={(loading || feedbackLoading) ? 'animate-spin' : ''} />
          새로고침
        </button>
      </div>

      {/* 뷰 전환 탭 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => setView('hospitals')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px',
            border: view === 'hospitals' ? '1px solid #7c3aed' : '1px solid #e5e7eb',
            backgroundColor: view === 'hospitals' ? '#f5f3ff' : 'white',
            color: view === 'hospitals' ? '#6d28d9' : '#6b7280',
            cursor: 'pointer', fontSize: '13px', fontWeight: '600'
          }}
        >
          <Building2 size={14} /> 병원 현황
        </button>
        <button
          onClick={() => setView('feedback')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px',
            border: view === 'feedback' ? '1px solid #7c3aed' : '1px solid #e5e7eb',
            backgroundColor: view === 'feedback' ? '#f5f3ff' : 'white',
            color: view === 'feedback' ? '#6d28d9' : '#6b7280',
            cursor: 'pointer', fontSize: '13px', fontWeight: '600', position: 'relative'
          }}
        >
          <Inbox size={14} /> 문의함
          {newCount > 0 && (
            <span style={{
              backgroundColor: '#dc2626', color: 'white', fontSize: '10px', fontWeight: '700',
              borderRadius: '10px', padding: '1px 6px', marginLeft: '2px'
            }}>
              {newCount}
            </span>
          )}
        </button>
      </div>

      {view === 'hospitals' ? (
        loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', padding: '40px 0', justifyContent: 'center' }}>
            <Loader2 size={20} className="animate-spin" />
            통계 불러오는 중...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#dc2626', padding: '40px 0' }}>
            <p>{error}</p>
          </div>
        ) : (
        <>
          {/* 전체 요약 카드 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '15px',
            marginBottom: '25px'
          }}>
            <div style={{ backgroundColor: '#7c3aed', color: 'white', padding: '20px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={24} />
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalHospitals}</div>
                  <div>가입 병원</div>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: '#3b82f6', color: 'white', padding: '20px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={24} />
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalUsers}</div>
                  <div>전체 가입자</div>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: '#10b981', color: 'white', padding: '20px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserCheck size={24} />
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalNurses}</div>
                  <div>등록된 간호사 수</div>
                </div>
              </div>
            </div>
          </div>

          {/* 병원별 상세 */}
          <h3 style={{ marginBottom: '14px', color: '#1f2937', fontSize: '16px' }}>병원별 현황</h3>
          {stats.hospitals.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '30px 0' }}>
              아직 가입한 병원이 없습니다.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stats.hospitals.map(h => {
                const isExpanded = expandedHospital === h.hospitalCode;
                return (
                  <div key={h.hospitalCode} style={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <div
                      onClick={() => setExpandedHospital(isExpanded ? null : h.hospitalCode)}
                      style={{
                        padding: '14px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#f9fafb'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', color: '#1f2937', fontSize: '14px' }}>
                          {h.hospitalName}
                          <span style={{ fontWeight: '400', color: '#9ca3af', fontSize: '12px', marginLeft: '8px' }}>
                            (코드: {h.hospitalCode})
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                          가입자 {h.totalMembers}명 (관리자 {h.adminCount} · 일반 {h.memberCount}) &nbsp;·&nbsp;
                          간호사 {h.totalNurses}명 (근무 가능 {h.activeNurses}) &nbsp;·&nbsp;
                          근무표 생성 {h.rosterMonths.length}개월치
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp size={18} style={{ color: '#9ca3af' }} /> : <ChevronDown size={18} style={{ color: '#9ca3af' }} />}
                    </div>

                    {isExpanded && (
                      <div style={{ padding: '14px 16px', borderTop: '1px solid #f3f4f6' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                          가입 회원 목록
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                          {h.members.map((m, idx) => (
                            <div key={idx} style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              fontSize: '13px', padding: '6px 10px', backgroundColor: '#f9fafb', borderRadius: '6px', gap: '8px'
                            }}>
                              <span>
                                {m.name} <span style={{ color: '#9ca3af', fontSize: '11px' }}>({m.email})</span>
                                {m.phone && <span style={{ color: '#9ca3af', fontSize: '11px' }}> · {formatPhoneNumber(m.phone)}</span>}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                <span style={{
                                  fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px',
                                  backgroundColor: m.role === 'admin' ? '#fef3c7' : '#f3f4f6',
                                  color: m.role === 'admin' ? '#92400e' : '#4b5563'
                                }}>
                                  {m.role === 'admin' ? '관리자' : '일반 사용자'}
                                </span>
                                <button
                                  disabled={resettingId === m.id}
                                  onClick={() => resetPassword(m.id)}
                                  title="비밀번호 초기화 (운영자 최후 수단)"
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '3px',
                                    fontSize: '10px', padding: '3px 8px', borderRadius: '6px',
                                    border: '1px solid #fca5a5', backgroundColor: '#fef2f2', color: '#b91c1c',
                                    cursor: resettingId === m.id ? 'not-allowed' : 'pointer',
                                    opacity: resettingId === m.id ? 0.5 : 1
                                  }}
                                >
                                  <KeyRound size={11} /> {resettingId === m.id ? '처리중' : '초기화'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {h.rosterMonths.length > 0 && (
                          <>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} /> 근무표 생성 이력
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {h.rosterMonths.map((r, idx) => (
                                <span key={idx} style={{
                                  fontSize: '11px', padding: '4px 8px', backgroundColor: '#eef2ff',
                                  color: '#4338ca', borderRadius: '6px'
                                }}>
                                  {r.monthKey}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
        )
      ) : (
        <div>
          {/* 문의함 필터 */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[
              { value: 'all', label: '전체' },
              { value: 'new', label: '신규' },
              { value: 'in_progress', label: '처리중' },
              { value: 'resolved', label: '완료' }
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFeedbackFilter(f.value)}
                style={{
                  padding: '6px 14px', borderRadius: '16px', fontSize: '12px', fontWeight: '600',
                  border: feedbackFilter === f.value ? '1px solid #4f46e5' : '1px solid #e5e7eb',
                  backgroundColor: feedbackFilter === f.value ? '#eef2ff' : 'white',
                  color: feedbackFilter === f.value ? '#4338ca' : '#6b7280',
                  cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {feedbackLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', padding: '40px 0', justifyContent: 'center' }}>
              <Loader2 size={20} className="animate-spin" />
              문의 목록 불러오는 중...
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0' }}>
              해당하는 문의가 없습니다.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredFeedback.map(f => {
                const typeInfo = TYPE_INFO[f.type] || TYPE_INFO.other;
                const statusInfo = STATUS_INFO[f.status] || STATUS_INFO.new;
                const TypeIcon = typeInfo.icon;
                return (
                  <div key={f.id} style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <span style={{
                            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700',
                            color: typeInfo.color, backgroundColor: `${typeInfo.color}15`, padding: '3px 8px', borderRadius: '10px'
                          }}>
                            <TypeIcon size={12} /> {typeInfo.label}
                          </span>
                          <span style={{
                            fontSize: '11px', fontWeight: '700', color: statusInfo.color,
                            backgroundColor: statusInfo.bg, padding: '3px 8px', borderRadius: '10px'
                          }}>
                            {statusInfo.label}
                          </span>
                          <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                            {f.hospital_name} · {new Date(f.created_at).toLocaleString('ko-KR')}
                          </span>
                        </div>
                        <div style={{ fontWeight: '700', color: '#1f2937', fontSize: '14px', marginBottom: '4px' }}>{f.title}</div>
                        <div style={{ fontSize: '13px', color: '#4b5563', whiteSpace: 'pre-wrap', marginBottom: '8px' }}>{f.message}</div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '12px' }}>
                          <span style={{ color: '#6b7280' }}>{f.user_name}</span>
                          <a href={`mailto:${f.user_email}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4f46e5', textDecoration: 'none' }}>
                            <Mail size={12} /> {f.user_email}
                          </a>
                          {f.user_phone && (
                            <a href={`tel:${f.user_phone}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4f46e5', textDecoration: 'none' }}>
                              <Phone size={12} /> {formatPhoneNumber(f.user_phone)}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        disabled={updatingId === f.id || f.status === 'in_progress'}
                        onClick={() => updateFeedback(f.id, { status: 'in_progress' })}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px',
                          borderRadius: '6px', border: '1px solid #fcd34d', backgroundColor: '#fffbeb', color: '#92400e',
                          cursor: 'pointer', opacity: (updatingId === f.id || f.status === 'in_progress') ? 0.5 : 1
                        }}
                      >
                        <Clock size={12} /> 처리중으로 표시
                      </button>
                      <button
                        disabled={updatingId === f.id || f.status === 'resolved'}
                        onClick={() => updateFeedback(f.id, { status: 'resolved', resolutionNote: noteDrafts[f.id] })}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '5px 10px',
                          borderRadius: '6px', border: '1px solid #6ee7b7', backgroundColor: '#f0fdf4', color: '#065f46',
                          cursor: 'pointer', opacity: (updatingId === f.id || f.status === 'resolved') ? 0.5 : 1
                        }}
                      >
                        <CheckCircle2 size={12} /> 완료로 표시
                      </button>
                      <input
                        type="text"
                        placeholder="답변/메모 (선택)"
                        value={noteDrafts[f.id] ?? f.resolution_note ?? ''}
                        onChange={(e) => setNoteDrafts(prev => ({ ...prev, [f.id]: e.target.value }))}
                        style={{ flex: 1, minWidth: '160px', padding: '5px 10px', fontSize: '12px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                      />
                    </div>

                    {f.resolution_note && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#065f46', backgroundColor: '#f0fdf4', padding: '8px 10px', borderRadius: '6px' }}>
                        📝 {f.resolution_note}
                      </div>
                    )}
                  </div>
                );
              })}
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
              <strong>{resetResult.userName}</strong>님({resetResult.userEmail})에게 아래 임시 비밀번호를 직접 전달해주세요.
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

export default AdminDashboard;
