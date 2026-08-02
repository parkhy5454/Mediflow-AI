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

  // [추가] 이름/자격/경력/부서 등 여러 필드를 한 번에 수정할 때 사용 (입력 실수 정정용)
  const updateNurse = async (id, updates) => {
    setNurses(prev => prev.map(nurse => (nurse.id === id ? { ...nurse, ...updates } : nurse)));
    try {
      const res = await fetch(`/api/nurses/${id}`, {
        method: 'PUT',
        headers: authHeaders(currentUser, true),
        body: JSON.stringify(updates)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || '간호사 정보 수정에 실패했습니다.');
        return false;
      }
      return true;
    } catch (err) {
      console.error('간호사 정보 수정 실패:', err);
      alert('간호사 정보 수정 중 오류가 발생했습니다.');
      return false;
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

  // 근무표 생성 후 여러 간호사의 상태(lastShiftType, historicalDaysByShift 등)를 한 번에 갱신할 때 사용
  // [수정] 예전엔 서버 응답의 성공/실패를 전혀 확인하지 않아서, 저장이 실패해도 콘솔에만 조용히
  // 로그가 찍히고 화면(nurses 상태)은 이미 낙관적으로 바뀐 채로 남아 있었다. 그래서 새로고침 전까지는
  // "잘 된 것처럼" 보이다가, 새로고침하면 실제로는 저장 안 된 값(0 등)이 드러나는 문제가 반복됐다.
  // 이제는 res.ok를 꼭 확인해서 실패하면 사용자에게 바로 알리고, 호출한 쪽에서도 성공 여부를 알 수 있게 반환한다.
  const updateNurses = async (updatedNurses) => {
    setNurses(updatedNurses);
    try {
      const res = await fetch('/api/nurses/bulk', {
        method: 'PUT',
        headers: authHeaders(currentUser, true),
        body: JSON.stringify({ nurses: updatedNurses })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error('간호사 일괄 저장 실패:', data);
        alert(`간호사 정보(누적 통계 포함) 서버 저장에 실패했습니다: ${data.error || '알 수 없는 오류'}\n근무표는 만들어졌지만 통계가 정확하지 않을 수 있으니, 개발자에게 문의해주세요.`);
        return false;
      }
      return true;
    } catch (err) {
      console.error('간호사 일괄 저장 실패:', err);
      alert('간호사 정보 서버 저장 중 네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 근무표를 다시 생성해주세요.');
      return false;
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
    updateNurse,
    deleteNurse,
    updateNurses,
    getActiveNurses,
    getFilteredNurses
  };
};
