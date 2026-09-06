// src/components/Common/ShareInviteButton.jsx
// 모든 로그인 사용자가 쓸 수 있는 공유/초대 플로팅 버튼.
// - "동료 초대하기": 병원 코드가 미리 채워진 회원가입 링크를 공유 (같은 병원 동료를 바로 데려올 수 있음)
// - "앱 소개 공유하기": Mediflow-AI 자체를 소개하는 링크를 공유
// 각 항목은 카카오톡 공유(SDK 키가 설정된 경우) → 기기 기본 공유 시트(Web Share API) → 링크 복사 순으로 대체된다.
import React, { useState } from 'react';
import { Share2, X, Users, Sparkles, Copy, Check } from 'lucide-react';
import { isKakaoShareAvailable, shareToKakao } from '../../utils/kakaoShare';

import { useTranslation } from 'react-i18next';

const ShareInviteButton = ({ currentUser }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  if (!currentUser) return null;

  const origin = window.location.origin + window.location.pathname.replace(/\/$/, '');
  const appIconUrl = `${window.location.origin}/icons/icon-512.png`;

  const inviteLink = `${origin}?hospitalCode=${encodeURIComponent(currentUser.hospitalCode || '')}`;
  const introLink = origin;

  const items = [
    {
      key: 'invite',
      icon: Users,
      color: '#0ea5e9',
      title: t('동료 초대하기'),
      description: t('{{hospitalName}} 동료에게 병원 코드로 바로 가입할 수 있는 링크를 보내세요.', {
        hospitalName: currentUser.hospitalName || ''
      }),
      link: inviteLink,
      shareTitle: t('{{hospitalName}}에서 Mediflow-AI를 함께 써요', { hospitalName: currentUser.hospitalName || '' }),
      shareDescription: t('아래 링크로 가입하면 병원 코드가 자동으로 입력돼요. 근무표를 함께 관리해보세요.'),
      buttonTitle: t('가입하러 가기')
    },
    {
      key: 'intro',
      icon: Sparkles,
      color: '#8b5cf6',
      title: t('앱 소개 공유하기'),
      description: t('Mediflow-AI를 다른 병원 동료나 지인에게 소개해보세요.'),
      link: introLink,
      shareTitle: t('Mediflow-AI - 병원 간호사 근무표 관리 시스템'),
      shareDescription: t('근무 주기, 휴가, 근무 변경까지 한 번에 관리하는 간호사 근무표 서비스예요.'),
      buttonTitle: t('앱 열어보기')
    }
  ];

  const handleCopy = async (item) => {
    try {
      await navigator.clipboard.writeText(item.link);
      setCopiedKey(item.key);
      setTimeout(() => setCopiedKey(''), 1500);
    } catch (err) {
      console.error('링크 복사 실패:', err);
    }
  };

  const handleKakao = (item) => {
    try {
      shareToKakao({
        title: item.shareTitle,
        description: item.shareDescription,
        link: item.link,
        imageUrl: appIconUrl,
        buttonTitle: item.buttonTitle
      });
    } catch (err) {
      handleNativeShare(item);
    }
  };

  const handleNativeShare = async (item) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: item.shareTitle, text: item.shareDescription, url: item.link });
        return;
      } catch (err) {
        // 사용자가 공유를 취소한 경우 등은 별도 처리 없이 무시
        if (err?.name === 'AbortError') return;
      }
    }
    handleCopy(item);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: '#0ea5e9',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 40
        }}
        title={t('공유 / 초대')}
      >
        <Share2 size={22} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px'
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '440px',
              maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#1f2937' }}>{t('공유하기')}</h3>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.key} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '8px', backgroundColor: `${item.color}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <Icon size={15} style={{ color: item.color }} />
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#1f2937' }}>{item.title}</div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 12px', lineHeight: '1.5' }}>
                      {item.description}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {isKakaoShareAvailable() && (
                        <button
                          onClick={() => handleKakao(item)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 12px', borderRadius: '8px', border: 'none',
                            backgroundColor: '#fee500', color: '#3c1e1e', fontSize: '12px', fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#3c1e1e',
                            color: '#fee500', fontSize: '9px', fontWeight: '900'
                          }}>K</span>
                          {t('카카오톡으로 공유')}
                        </button>
                      )}
                      {typeof navigator.share === 'function' && (
                        <button
                          onClick={() => handleNativeShare(item)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db',
                            backgroundColor: 'white', color: '#374151', fontSize: '12px', fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          <Share2 size={13} />
                          {t('다른 앱으로 공유')}
                        </button>
                      )}
                      <button
                        onClick={() => handleCopy(item)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db',
                          backgroundColor: 'white', color: '#374151', fontSize: '12px', fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {copiedKey === item.key ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
                        {copiedKey === item.key ? t('복사되었습니다') : t('링크 복사')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareInviteButton;
