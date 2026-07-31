// src/hooks/useRosterConfig.js
// [수정] localStorage 대신 서버 API(Supabase)를 통해 병원별로 근무표 설정을 저장/조회한다.
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

export const useRosterConfig = (currentUser) => {
  const [rosterConfig, setRosterConfig] = useState(defaultRosterConfig);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const res = await fetch('/api/roster-config', { headers: { 'x-user-id': currentUser.id } });
        const data = await res.json();
        if (res.ok && data.config) {
          setRosterConfig(mergeWithDefaults(data.config));
        }
      } catch (err) {
        console.error('근무표 설정 조회 실패:', err);
      }
    })();
  }, [currentUser?.id]);

  const updateRosterConfig = (updates) => {
    setRosterConfig(prev => {
      const next = { ...prev, ...updates };
      if (currentUser) {
        fetch('/api/roster-config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
          body: JSON.stringify({ config: next })
        }).catch(err => console.error('근무표 설정 저장 실패:', err));
      }
      return next;
    });
  };

  return {
    rosterConfig,
    updateRosterConfig
  };
};
