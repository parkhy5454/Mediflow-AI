// src/components/Subscription/SubscriptionView.jsx
import React, { useState } from 'react';
import { CreditCard, CheckCircle2, AlertTriangle, Clock, Loader2, History } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';

const TOSS_CLIENT_KEY = process.env.REACT_APP_TOSS_CLIENT_KEY;

const STATUS_INFO = {
  trial: { label: '무료 체험 중', bg: '#eff6ff', color: '#1d4ed8', icon: Clock },
  active: { label: '구독 중', bg: '#f0fdf4', color: '#166534', icon: CheckCircle2 },
  past_due: { label: '결제 실패', bg: '#fef2f2', color: '#991b1b', icon: AlertTriangle },
  cancelled: { label: '해지됨', bg: '#f3f4f6', color: '#6b7280', icon: AlertTriangle }
};

const formatWon = (n) => `${(n || 0).toLocaleString()}원`;
const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '-');

const daysLeft = (dateStr) => {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const SubscriptionView = ({ currentUser }) => {
  const { subscription, billingHistory, loading, error, registerCard } = useSubscription(currentUser);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const isAdmin = currentUser.role === 'admin';

  const handleRegisterCard = async () => {
    setRegisterError('');
    if (!TOSS_CLIENT_KEY) {
      setRegisterError('결제 서비스가 아직 설정되지 않았습니다. 관리자에게 문의해주세요.');
      return;
    }
    if (!window.TossPayments) {
      setRegisterError('결제 모듈을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.');
      return;
    }
    setRegistering(true);
    try {
      const customerKey = `hospital-${currentUser.hospitalCode}`;
      const tossPayments = window.TossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey });
      const redirectBase = `${window.location.origin}${window.location.pathname}`;
      await payment.requestBillingAuth({
        method: 'CARD',
        successUrl: `${redirectBase}?billingAuth=success`,
        failUrl: `${redirectBase}?billingAuth=fail`
      });
      // 성공/실패 시 위 successUrl/failUrl로 페이지가 이동하므로, 이후 흐름은 App.jsx가 처리한다.
    } catch (err) {
      // 사용자가 결제창을 직접 닫은 경우 등은 에러로 안 보여줘도 됨
      if (err?.code !== 'USER_CANCEL') {
        setRegisterError(err?.message || '카드 등록 창을 여는 중 오류가 발생했습니다.');
      }
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
        <Loader2 size={18} className="animate-spin" /> 불러오는 중...
      </div>
    );
  }
  if (error) {
    return <div style={{ padding: '20px', color: '#dc2626' }}>{error}</div>;
  }

  const statusInfo = STATUS_INFO[subscription?.status] || STATUS_INFO.trial;
  const StatusIcon = statusInfo.icon;
  const trialDaysLeft = subscription?.status === 'trial' ? daysLeft(subscription.trialEndsAt) : null;

  return (
    <div style={{ padding: '20px', maxWidth: '640px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <CreditCard size={22} style={{ color: '#3b82f6' }} />
        <h2 style={{ color: '#1f2937', margin: 0 }}>구독 관리</h2>
      </div>

      {/* 상태 카드 */}
      <div style={{
        backgroundColor: statusInfo.bg, border: `1px solid ${statusInfo.color}33`,
        borderRadius: '12px', padding: '20px', marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <StatusIcon size={20} style={{ color: statusInfo.color }} />
          <span style={{ fontWeight: '700', color: statusInfo.color, fontSize: '15px' }}>{statusInfo.label}</span>
        </div>
        {subscription?.status === 'trial' && (
          <p style={{ margin: 0, fontSize: '13px', color: statusInfo.color }}>
            {trialDaysLeft > 0 ? `무료 체험이 ${trialDaysLeft}일 남았습니다.` : '무료 체험이 곧 종료됩니다.'} 체험 종료일: {formatDate(subscription.trialEndsAt)}
          </p>
        )}
        {subscription?.status === 'active' && (
          <p style={{ margin: 0, fontSize: '13px', color: statusInfo.color }}>
            다음 결제일: {formatDate(subscription.nextBillingDate)}
          </p>
        )}
        {subscription?.status === 'past_due' && (
          <p style={{ margin: 0, fontSize: '13px', color: statusInfo.color }}>
            최근 결제가 실패했습니다. 카드 정보를 확인하고 다시 등록해주세요.
          </p>
        )}
      </div>

      {/* 요금 안내 */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>
          <span>요금제</span><span>활성 간호사 1명당 월 {formatWon(subscription?.pricePerNurse || 3000)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>
          <span>현재 활성 간호사</span><span>{subscription?.activeNurseCount ?? 0}명</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700', color: '#1f2937', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #e5e7eb' }}>
          <span>예상 월 결제 금액</span><span>{formatWon(subscription?.estimatedMonthlyAmount)}</span>
        </div>
      </div>

      {/* 카드 정보 */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>결제 카드</div>
        {subscription?.hasBillingKey ? (
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 12px' }}>
            등록됨: {subscription.cardCompany} ****-****-****-{subscription.cardLast4}
          </p>
        ) : (
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 12px' }}>등록된 카드가 없습니다.</p>
        )}
        {isAdmin ? (
          <button
            onClick={handleRegisterCard}
            disabled={registering}
            style={{
              padding: '9px 16px', borderRadius: '6px', border: 'none',
              backgroundColor: '#3b82f6', color: 'white', fontSize: '13px', fontWeight: '600',
              cursor: registering ? 'not-allowed' : 'pointer'
            }}
          >
            {registering ? '이동 중...' : subscription?.hasBillingKey ? '카드 변경' : '카드 등록'}
          </button>
        ) : (
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>카드 등록/변경은 관리자만 할 수 있습니다.</p>
        )}
        {registerError && (
          <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '10px' }}>{registerError}</p>
        )}
      </div>

      {/* 결제 내역 */}
      <div>
        <h3 style={{ fontSize: '14px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <History size={16} /> 결제 내역
        </h3>
        {billingHistory.length === 0 ? (
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>아직 결제 내역이 없습니다.</p>
        ) : (
          <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
            {billingHistory.map((h, idx) => (
              <div
                key={h.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 16px',
                  borderBottom: idx === billingHistory.length - 1 ? 'none' : '1px solid #f3f4f6'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', color: '#1f2937', fontWeight: '500' }}>
                    {formatWon(h.amount)} <span style={{ color: '#9ca3af', fontWeight: '400' }}>({h.nurseCount}명 기준)</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>{formatDate(h.billedAt)}</div>
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px',
                  backgroundColor: h.status === 'success' ? '#dcfce7' : '#fee2e2',
                  color: h.status === 'success' ? '#166534' : '#991b1b'
                }}>
                  {h.status === 'success' ? '성공' : '실패'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionView;
