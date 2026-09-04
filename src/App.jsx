import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Splash from './components/Splash';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-600">Loading FSBC Secure Portal...</span>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppContent() {
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    // Only show splash screen on first visit in the session
    const hasSeenSplash = sessionStorage.getItem('fsbc_seen_splash');
    if (hasSeenSplash) {
      setShowSplash(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem('fsbc_seen_splash', 'true');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <Splash />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="savings" element={<Dashboard />} />
          <Route path="shares" element={<Dashboard />} />
          <Route path="assets" element={<Dashboard />} />
          <Route path="loans" element={<Dashboard />} />
          <Route path="payments" element={<Dashboard />} />
          <Route path="transactions" element={<Dashboard />} />
          <Route path="guarantors" element={<Dashboard />} />
          <Route path="agm" element={<Dashboard />} />
          <Route path="reports" element={<Dashboard />} />
          <Route path="messages" element={<Dashboard />} />
          <Route path="support" element={<Dashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
