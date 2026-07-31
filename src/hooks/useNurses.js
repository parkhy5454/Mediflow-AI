// src/hooks/useNurses.js
// [수정] localStorage 대신 서버 API(Supabase)를 통해 병원별로 간호사 데이터를 저장/조회한다.
import { useState, useEffect } from 'react';

const authHeaders = (currentUser, withBody = false) => {
  const headers = { 'x-user-id': currentUser?.id };
  if (withBody) headers['Content-Type'] = 'application/json';
  return headers;
};

export const useNurses = (currentUser) => {
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchNurses = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await fetch('/api/nurses', { headers: authHeaders(currentUser) });
      const data = await res.json();
      if (res.ok) setNurses(data);
    } catch (err) {
      console.error('간호사 목록 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNurses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const addNurse = async (newNurseData) => {
    if (!newNurseData.name.trim()) return false;
    try {
      const res = await fetch('/api/nurses', {
        method: 'POST',
        headers: authHeaders(currentUser, true),
        body: JSON.stringify(newNurseData)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || '간호사 추가에 실패했습니다.');
        return false;
      }
      setNurses(prev => [...prev, data]);
      return true;
    } catch (err) {
      console.error('간호사 추가 실패:', err);
      alert('간호사 추가 중 오류가 발생했습니다.');
      return false;
    }
  };

  const updateNurseStatus = async (id, status) => {
    // 화면은 즉시 반영(낙관적 업데이트), 서버 저장은 뒤에서 진행
    setNurses(prev => prev.map(nurse => (nurse.id === id ? { ...nurse, status } : nurse)));
    try {
      await fetch(`/api/nurses/${id}`, {
        method: 'PUT',
        headers: authHeaders(currentUser, true),
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.error('간호사 상태 변경 실패:', err);
    }
  };

  const deleteNurse = async (id) => {
    if (!window.confirm('정말 이 간호사를 삭제하시겠습니까?')) return false;
    setNurses(prev => prev.filter(nurse => nurse.id !== id));
    try {
      await fetch(`/api/nurses/${id}`, { method: 'DELETE', headers: authHeaders(currentUser) });
    } catch (err) {
      console.error('간호사 삭제 실패:', err);
    }
    return true;
  };

  // 근무표 생성 후 여러 간호사의 상태(lastShiftType 등)를 한 번에 갱신할 때 사용
  const updateNurses = async (updatedNurses) => {
    setNurses(updatedNurses);
    try {
      await fetch('/api/nurses/bulk', {
        method: 'PUT',
        headers: authHeaders(currentUser, true),
        body: JSON.stringify({ nurses: updatedNurses })
      });
    } catch (err) {
      console.error('간호사 일괄 저장 실패:', err);
    }
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
    loading,
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
