// src/hooks/useSubscription.js
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const authHeaders = (currentUser, withBody = false) => {
  const headers = { 'Authorization': `Bearer ${currentUser?.token}` };
  if (withBody) headers['Content-Type'] = 'application/json';
  return headers;
};

export const useSubscription = (currentUser) => {
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSubscription = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      const [subRes, historyRes] = await Promise.all([
        fetch('/api/subscription', { headers: authHeaders(currentUser) }),
        fetch('/api/subscription/billing-history', { headers: authHeaders(currentUser) })
      ]);
      const subData = await subRes.json();
      const historyData = await historyRes.json();
      if (!subRes.ok) throw new Error(subData.error || t('구독 정보를 가져오지 못했습니다.'));
      setSubscription(subData);
      if (historyRes.ok) setBillingHistory(historyData);
    } catch (err) {
      setError(err.message || t('오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  }, [currentUser, t]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const registerCard = async (authKey, customerKey) => {
    try {
      const res = await fetch('/api/subscription/register-card', {
        method: 'POST',
        headers: authHeaders(currentUser, true),
        body: JSON.stringify({ authKey, customerKey })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('카드 등록에 실패했습니다.'));
      await fetchSubscription();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const cancelSubscription = async () => {
    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'PUT',
        headers: authHeaders(currentUser, true)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('구독 해지에 실패했습니다.'));
      await fetchSubscription();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return { subscription, billingHistory, loading, error, fetchSubscription, registerCard, cancelSubscription };
};
