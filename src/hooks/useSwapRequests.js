// src/hooks/useSwapRequests.js
// 근무 변경 요청(1:1 맞교환 / 공개 대타) 관련 서버 API 호출을 담당하는 훅.
import { useState, useEffect, useCallback } from 'react';

const authHeaders = (currentUser, withBody = false) => {
  const headers = { 'x-user-id': currentUser?.id };
  if (withBody) headers['Content-Type'] = 'application/json';
  return headers;
};

export const useSwapRequests = (currentUser, selectedYear, selectedMonth) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/swap-requests?year=${selectedYear}&month=${selectedMonth}`, {
        headers: authHeaders(currentUser)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '요청 목록을 가져오지 못했습니다.');
      setRequests(data);
    } catch (err) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedYear, selectedMonth]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const createRequest = async (payload) => {
    try {
      const res = await fetch('/api/swap-requests', {
        method: 'POST',
        headers: authHeaders(currentUser, true),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '요청 등록에 실패했습니다.');
      setRequests(prev => [data, ...prev]);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const volunteer = async (requestId, nurseId) => {
    try {
      const res = await fetch(`/api/swap-requests/${requestId}/volunteer`, {
        method: 'PUT',
        headers: authHeaders(currentUser, true),
        body: JSON.stringify({ nurseId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '지원 처리에 실패했습니다.');
      setRequests(prev => prev.map(r => (r.id === requestId ? data : r)));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const cancelRequest = async (requestId) => {
    try {
      const res = await fetch(`/api/swap-requests/${requestId}/cancel`, {
        method: 'PUT',
        headers: authHeaders(currentUser, true)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '취소에 실패했습니다.');
      setRequests(prev => prev.map(r => (r.id === requestId ? data : r)));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // decision: 'approved' | 'rejected'
  const decide = async (requestId, decision, note) => {
    try {
      const res = await fetch(`/api/swap-requests/${requestId}/decision`, {
        method: 'PUT',
        headers: authHeaders(currentUser, true),
        body: JSON.stringify({ decision, note })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '처리에 실패했습니다.');
      setRequests(prev => prev.map(r => (r.id === requestId ? data : r)));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return {
    requests,
    loading,
    error,
    fetchRequests,
    createRequest,
    volunteer,
    cancelRequest,
    decide
  };
};
