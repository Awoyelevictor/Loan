import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email or Member ID and password.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Invalid credentials. Please check your details.');
    }
  };

  const handleDemoLogin = async () => {
    setEmail('awoyeleemma1@gmail.com');
    setPassword('Password123!');
    setLoading(true);
    setError('');
    const res = await login('awoyeleemma1@gmail.com', 'Password123!');
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-14 bg-green-800 rounded-b-xl rounded-t-sm flex items-center justify-center font-extrabold text-white text-base shadow-md">
            PSN
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Member Sign In
        </h2>
        <p className="mt-1 text-center text-sm text-slate-600">
          FSBC Cooperative Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 border border-slate-200 rounded-2xl sm:px-10">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address or Member ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-none"
                  placeholder="e.g. victor@example.com or MEM-PSN-00458"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-none"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-green-700 focus:ring-green-600 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-xs">
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Please contact FSBC secretariat or support@fsbc.psn.ng for password recovery."); }} className="font-semibold text-green-800 hover:underline">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-green-800 hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Sign In to Dashboard'
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Access Button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-green-200 rounded-xl text-xs font-bold text-green-900 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-green-700" />
              <span>Instant Demo Sign In (Pharm. Victor Adewale)</span>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="text-center">
              <span className="text-xs text-slate-500">Don't have an FSBC Member account yet?</span>
            </div>
            
            <div className="mt-3">
              <Link
                to="/register"
                className="w-full flex justify-center items-center py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all gap-2"
              >
                <span>Register New Member Account</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
