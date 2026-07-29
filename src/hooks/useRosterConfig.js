// src/hooks/useRosterConfig.js
import { useState } from 'react';
import { defaultRosterConfig } from '../constants/rosterConfig';

export const useRosterConfig = () => {
  const [rosterConfig, setRosterConfig] = useState(defaultRosterConfig);

  const updateRosterConfig = (updates) => {
    setRosterConfig(prev => ({ ...prev, ...updates }));
  };

  return {
    rosterConfig,
    updateRosterConfig
  };
};

