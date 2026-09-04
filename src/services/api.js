import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fsbc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if checking /api/auth/me on cold load
      if (!error.config.url.includes('/auth/me')) {
        console.warn('Session expired or unauthorized');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  getCollectionAccounts: async () => {
    const res = await api.get('/auth/collection-accounts');
    return res.data;
  }
};

export const walletAPI = {
  deposit: async (amount, notes, paymentReference) => {
    const res = await api.post('/wallet/deposit', { amount, notes, paymentReference });
    return res.data;
  },
  withdraw: async (amount, destinationBank, accountNumber) => {
    const res = await api.post('/wallet/withdraw', { amount, destinationBank, accountNumber });
    return res.data;
  },
  buyShares: async (shareUnits) => {
    const res = await api.post('/wallet/shares', { shareUnits });
    return res.data;
  },
  applyLoan: async (loanData) => {
    const res = await api.post('/loans/apply', loanData);
    return res.data;
  },
  repayLoan: async (amount) => {
    const res = await api.post('/loans/repay', { amount });
    return res.data;
  },
  getTransactions: async () => {
    const res = await api.get('/wallet/transactions');
    return res.data;
  }
};

export const cooperativeAPI = {
  getDashboardData: async () => {
    const res = await api.get('/cooperative/dashboard');
    return res.data;
  },
  checkEligibility: async (amount, durationMonths) => {
    const res = await api.post('/cooperative/loans/eligibility', { amount, durationMonths });
    return res.data;
  },
  applyLoan: async (loanData) => {
    const res = await api.post('/cooperative/loans/apply', loanData);
    return res.data;
  },
  adminReviewLoan: async (loanId, action, comment) => {
    const res = await api.post('/cooperative/admin/loans/review', { loanId, action, comment });
    return res.data;
  },
  adminReconcile: async (reconciliationId, action, matchedMemberId, notes) => {
    const res = await api.post('/cooperative/admin/reconciliation', { reconciliationId, action, matchedMemberId, notes });
    return res.data;
  },
  adminApprovePayout: async (payoutId, action, comment) => {
    const res = await api.post('/cooperative/admin/payouts/approve', { payoutId, action, comment });
    return res.data;
  },
  scheduleNotification: async (notifData) => {
    const res = await api.post('/cooperative/admin/notifications', notifData);
    return res.data;
  },
  updateRules: async (rulesData) => {
    const res = await api.post('/cooperative/admin/rules', rulesData);
    return res.data;
  },
  ussdQuery: async (ussdString, memberId) => {
    const res = await api.post('/cooperative/ussd', { ussdString, memberId });
    return res.data;
  }
};

export default api;
