// src/hooks/useRosterConfig.js
// [수정] localStorage 대신 서버 API(Supabase)를 통해 병원별로 근무표 설정을 저장/조회한다.
// [수정 2] 인증 방식을 x-user-id → Authorization: Bearer 토큰으로 변경.
// [수정 3] updateRosterConfig가 성공/실패 결과를 반환하도록 변경 — Settings.jsx의 "저장" 버튼에서 사용.
// [수정 4] 근무표 설정도 병원 전체가 아니라 부서(병동)별로 따로 관리하도록 변경.
import { useState, useEffect } from 'react';
import { defaultRosterConfig } from '../constants/rosterConfig';

const mergeWithDefaults = (config) => ({
  ...defaultRosterConfig,
  ...config,
  shifts: {
    ...defaultRosterConfig.shifts,
    ...((config && config.shifts) || {})
  }
});

export const useRosterConfig = (currentUser, department = '') => {
  const [rosterConfig, setRosterConfig] = useState(defaultRosterConfig);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const res = await fetch(`/api/roster-config?department=${encodeURIComponent(department || '')}`, {
          headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        const data = await res.json();
        if (res.ok && data.config) {
          setRosterConfig(mergeWithDefaults(data.config));
        } else {
          setRosterConfig(defaultRosterConfig);
        }
      } catch (err) {
        console.error('근무표 설정 조회 실패:', err);
      }
    })();
  }, [currentUser?.id, department]);

  // [수정] 더 이상 입력할 때마다 자동저장하지 않는다. Settings.jsx에서 "저장" 버튼을 눌렀을 때만
  // 호출되며, 성공하면 { success: true }, 실패하면 { success: false, message } 를 반환한다.
  const updateRosterConfig = async (updates) => {
    const next = { ...rosterConfig, ...updates };
    if (!currentUser) return { success: false, message: '로그인이 필요합니다.' };
    try {
      const res = await fetch(`/api/roster-config?department=${encodeURIComponent(department || '')}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
        body: JSON.stringify({ config: next })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error('근무표 설정 저장 실패:', data);
        return { success: false, message: data.error || '저장에 실패했습니다.' };
      }
      setRosterConfig(next);
      return { success: true };
    } catch (err) {
      console.error('근무표 설정 저장 실패:', err);
      return { success: false, message: '서버와 통신 중 오류가 발생했습니다.' };
    }
  };

  return {
    rosterConfig,
    updateRosterConfig
  };
};
