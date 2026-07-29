// src/hooks/useNurses.js
import { useState } from 'react';
import { initialNurses } from '../constants/nurseData';

export const useNurses = () => {
  const [nurses, setNurses] = useState(initialNurses);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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
    if (window.confirm('Are you sure you want to delete this nurse?')) {
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