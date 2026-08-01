// src/components/Admin/AdminDashboard.jsx
// 개발자(운영자) 전용: 모든 병원의 가입/사용 현황을 한눈에 보는 대시보드.
import React, { useState, useEffect } from 'react';
import { Building2, Users, UserCheck, Calendar, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const AdminDashboard = ({ currentUser }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedHospital, setExpandedHospital] = useState(null);

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

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={22} style={{ color: '#7c3aed' }} />
            운영자 대시보드
          </h2>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '4px 0 0 0' }}>
            등록된 모든 병원의 가입/사용 현황을 한눈에 확인합니다. (개발자 전용)
          </p>
        </div>
        <button
          onClick={fetchStats}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db',
            borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#374151'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          새로고침
        </button>
      </div>

      {loading ? (
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
                              fontSize: '13px', padding: '6px 10px', backgroundColor: '#f9fafb', borderRadius: '6px'
                            }}>
                              <span>{m.name} <span style={{ color: '#9ca3af', fontSize: '11px' }}>({m.email})</span></span>
                              <span style={{
                                fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px',
                                backgroundColor: m.role === 'admin' ? '#fef3c7' : '#f3f4f6',
                                color: m.role === 'admin' ? '#92400e' : '#4b5563'
                              }}>
                                {m.role === 'admin' ? '관리자' : '일반 사용자'}
                              </span>
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
      )}
    </div>
  );
};

export default AdminDashboard;
