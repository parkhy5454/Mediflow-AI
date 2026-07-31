// src/hooks/useNurses.js
// [수정] 간호사 목록을 브라우저(localStorage)에 저장해서 새로고침/재로그인해도 유지되게 함.
import { useState, useEffect } from 'react';
import { initialNurses } from '../constants/nurseData';

const STORAGE_KEY = 'mediflow_nurses';

const loadSavedNurses = () => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialNurses;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialNurses;
  } catch (e) {
    return initialNurses;
  }
};

export const useNurses = () => {
  const [nurses, setNurses] = useState(loadSavedNurses);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // 간호사 목록이 바뀔 때마다 자동 저장 (추가/수정/삭제/근무표 생성 후 상태 갱신 전부 포함)
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nurses));
    } catch (e) {
      console.error('간호사 목록 저장 실패:', e);
    }
  }, [nurses]);

  const addNurse = (newNurseData) => {
    if (!newNurseData.name.trim()) return false;
    
    const nurse = {
      id: Date.now(),
      ...newNurseData,
      status: 'active',
      lastShiftType: null
    };
    
    setNurses(prev => [...prev, nurse]);
    return true;
  };

  const updateNurseStatus = (id, status) => {
    setNurses(prev => prev.map(nurse => 
      nurse.id === id ? { ...nurse, status } : nurse
    ));
  };

  const deleteNurse = (id) => {
    if (window.confirm('정말 이 간호사를 삭제하시겠습니까?')) {
      setNurses(prev => prev.filter(nurse => nurse.id !== id));
      return true;
    }
    return false;
  };

  const updateNurses = (updatedNurses) => {
    setNurses(updatedNurses);
  };

  const getActiveNurses = () => {
    return nurses.filter(nurse => nurse.status === 'active');
  };

  const getFilteredNurses = () => {
    return nurses.filter(nurse => {
      const matchesSearch = nurse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           nurse.qualification.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           nurse.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || nurse.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  };

  return {
    nurses,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    addNurse,
    updateNurseStatus,
    deleteNurse,
    updateNurses,
    getActiveNurses,
    getFilteredNurses
  };
};
