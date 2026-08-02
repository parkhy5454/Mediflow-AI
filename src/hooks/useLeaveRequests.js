// src/hooks/useLeaveRequests.js
import { useState, useEffect, useCallback } from 'react';

const authHeaders = (currentUser, withBody = false) => {
  const headers = { 'x-user-id': currentUser?.id };
  if (withBody) headers['Content-Type'] = 'application/json';
  return headers;
};

export const useLeaveRequests = (currentUser) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/leave-requests', { headers: authHeaders(currentUser) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '휴가 신청 목록을 가져오지 못했습니다.');
      setRequests(data);
    } catch (err) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const createRequest = async (payload) => {
    try {
      const res = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: authHeaders(currentUser, true),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '휴가 신청에 실패했습니다.');
      setRequests(prev => [data, ...prev]);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const cancelRequest = async (id) => {
    try {
      const res = await fetch(`/api/leave-requests/${id}/cancel`, {
        method: 'PUT',
        headers: authHeaders(currentUser, true)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '취소에 실패했습니다.');
      setRequests(prev => prev.map(r => (r.id === id ? data : r)));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const decide = async (id, decision, note) => {
    try {
      const res = await fetch(`/api/leave-requests/${id}/decision`, {
        method: 'PUT',
        headers: authHeaders(currentUser, true),
        body: JSON.stringify({ decision, note })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '처리에 실패했습니다.');
      setRequests(prev => prev.map(r => (r.id === id ? data : r)));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return { requests, loading, error, fetchRequests, createRequest, cancelRequest, decide };
};
