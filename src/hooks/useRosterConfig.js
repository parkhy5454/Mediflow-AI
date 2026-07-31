// src/hooks/useRosterConfig.js
// [수정] 설정값을 브라우저(localStorage)에 저장해서 새로고침/재로그인해도 유지되게 함.
import { useState, useEffect } from 'react';
import { defaultRosterConfig } from '../constants/rosterConfig';

const STORAGE_KEY = 'mediflow_roster_config';

const loadSavedConfig = () => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultRosterConfig;
    const parsed = JSON.parse(saved);
    // shifts 안에 없는 교대 종류가 있으면 기본값으로 채워서 항상 4개(D/E/N/M) 다 있도록 보정
    return {
      ...defaultRosterConfig,
      ...parsed,
      shifts: {
        ...defaultRosterConfig.shifts,
        ...(parsed.shifts || {})
      }
    };
  } catch (e) {
    return defaultRosterConfig;
  }
};

export const useRosterConfig = () => {
  const [rosterConfig, setRosterConfig] = useState(loadSavedConfig);

  // 값이 바뀔 때마다 자동으로 저장 (별도의 "저장" 버튼 없이 즉시 반영 + 영구 보관)
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rosterConfig));
    } catch (e) {
      console.error('근무표 설정 저장 실패:', e);
    }
  }, [rosterConfig]);

  const updateRosterConfig = (updates) => {
    setRosterConfig(prev => ({ ...prev, ...updates }));
  };

  return {
    rosterConfig,
    updateRosterConfig
  };
};
