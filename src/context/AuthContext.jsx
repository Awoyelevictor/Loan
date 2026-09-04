import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, walletAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('fsbc_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('fsbc_token') || null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Check auth on startup
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('fsbc_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res && res.user) {
            setUser(res.user);
            localStorage.setItem('fsbc_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification failed, keeping cached user if available');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login(email, password);
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('fsbc_token', res.token);
        localStorage.setItem('fsbc_user', JSON.stringify(res.user));
        showToast(`Welcome back, ${res.user.fullName}!`, 'success');
        return { success: true, user: res.user };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData);
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('fsbc_token', res.token);
        localStorage.setItem('fsbc_user', JSON.stringify(res.user));
        showToast(`Welcome to FSBC! Your assigned funding account is ${res.user.assignedAccount.bankName}.`, 'success');
        return { success: true, user: res.user };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fsbc_token');
    localStorage.removeItem('fsbc_user');
    showToast('You have been logged out safely.', 'info');
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      if (res && res.user) {
        setUser(res.user);
        localStorage.setItem('fsbc_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.error('Failed to refresh user data', err);
    }
  };

  const deposit = async (amount, notes, paymentReference) => {
    try {
      const res = await walletAPI.deposit(amount, notes, paymentReference);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('fsbc_user', JSON.stringify(res.user));
        showToast(`₦${Number(amount).toLocaleString()} deposit confirmed and credited!`, 'success');
        return { success: true, user: res.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Deposit failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const withdraw = async (amount, destinationBank, accountNumber) => {
    try {
      const res = await walletAPI.withdraw(amount, destinationBank, accountNumber);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('fsbc_user', JSON.stringify(res.user));
        showToast(`₦${Number(amount).toLocaleString()} withdrawal processed successfully!`, 'success');
        return { success: true, user: res.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Withdrawal failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const buyShares = async (shareUnits) => {
    try {
      const res = await walletAPI.buyShares(shareUnits);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('fsbc_user', JSON.stringify(res.user));
        showToast(`Successfully purchased ${shareUnits} shares!`, 'success');
        return { success: true, user: res.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Share purchase failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const applyLoan = async (loanData) => {
    try {
      const res = await walletAPI.applyLoan(loanData);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('fsbc_user', JSON.stringify(res.user));
        showToast(`Loan application approved for ₦${Number(loanData.amount).toLocaleString()}!`, 'success');
        return { success: true, user: res.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Loan application failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const repayLoan = async (amount) => {
    try {
      const res = await walletAPI.repayLoan(amount);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('fsbc_user', JSON.stringify(res.user));
        showToast(`₦${Number(amount).toLocaleString()} loan repayment processed!`, 'success');
        return { success: true, user: res.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Loan repayment failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        deposit,
        withdraw,
        buyShares,
        applyLoan,
        repayLoan,
        showToast
      }}
    >
      {children}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold border ${
              toastMessage.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : toastMessage.type === 'info'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                toastMessage.type === 'error'
                  ? 'bg-red-600'
                  : toastMessage.type === 'info'
                  ? 'bg-blue-600'
                  : 'bg-emerald-600'
              }`}
            />
            {toastMessage.message}
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
