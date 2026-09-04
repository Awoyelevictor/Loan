import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, Briefcase, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    professionalTitle: 'Registered Pharmacist (MPSN)',
    password: '',
    confirmPassword: '',
    agreeTerms: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [assignedModal, setAssignedModal] = useState(null);
  const [copied, setCopied] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.agreeTerms) {
      setError('You must accept the FSBC Cooperative bye-laws.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await register({
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      professionalTitle: formData.professionalTitle,
      password: formData.password
    });

    setLoading(false);

    if (res.success && res.user) {
      // Show celebration and assigned account modal
      setAssignedModal(res.user);
    } else {
      setError(res.message || 'Registration failed. Please check your information.');
    }
  };

  const copyAccount = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="flex justify-center">
          <div className="w-12 h-14 bg-green-800 rounded-b-xl rounded-t-sm flex items-center justify-center font-extrabold text-white text-base shadow-md">
            PSN
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Member Registration
        </h2>
        <p className="mt-1 text-center text-sm text-slate-600">
          Functional System Basic Cooperative (FSBC)
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 border border-slate-200 rounded-2xl sm:px-10">
          
          {/* Account Assignment Banner */}
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Instant Account Assignment:</span> Upon registration, you will be randomly assigned one of our 4 official FSBC collection accounts (First Bank, GTBank, Zenith Bank, or Access Bank) for direct wallet funding.
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Pharm. Victor Adewale"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. victor@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-none"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="e.g. +234 803 123 4567"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-none"
                />
              </div>
            </div>

            {/* Professional Cadre */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Professional Cadre / Category
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                </div>
                <select
                  name="professionalTitle"
                  value={formData.professionalTitle}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-none text-slate-700"
                >
                  <option value="Registered Pharmacist (MPSN)">Registered Pharmacist (MPSN)</option>
                  <option value="Fellow of the PSN (FPSN)">Fellow of the PSN (FPSN)</option>
                  <option value="Community Pharmacist">Community Pharmacist (ACPN)</option>
                  <option value="Hospital Pharmacist">Hospital Pharmacist (AHAPN)</option>
                  <option value="Industrial Pharmacist">Industrial Pharmacist (NAIP)</option>
                  <option value="Academic Pharmacist">Academic Pharmacist (NAPA)</option>
                  <option value="Intern / Associate Member">Intern / Associate Member</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 chars"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2 pt-2">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-green-700 focus:ring-green-600 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="agreeTerms" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                I agree to the <span className="font-semibold text-green-800">FSBC Cooperative Bye-Laws</span> and understand that membership requires regular contributions and compliance.
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-green-800 hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700 transition-all disabled:opacity-50 gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Registration & Assigning Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Already have an FSBC account?{' '}
              <Link to="/login" className="font-bold text-green-800 hover:text-green-900 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Account Assignment Modal Upon Successful Registration */}
      {assignedModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Registration Complete!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Welcome, <span className="font-bold text-slate-800">{assignedModal.fullName}</span> ({assignedModal.memberId})
              </p>
            </div>

            <div className="mt-6 bg-gradient-to-br from-green-900 to-emerald-950 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-green-300 uppercase tracking-wider">
                  Your Randomly Assigned Funding Account
                </span>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                  {assignedModal.assignedAccount?.accountRef}
                </span>
              </div>

              <div className="text-xs text-emerald-100 font-medium mb-1">
                {assignedModal.assignedAccount?.bankName}
              </div>

              <div className="text-2xl font-mono font-bold tracking-widest text-white mb-3">
                {assignedModal.assignedAccount?.accountNumber}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-white/15">
                <div>
                  <div className="text-[9px] text-emerald-300 uppercase">Beneficiary Name</div>
                  <div className="text-xs font-semibold text-white">
                    {assignedModal.assignedAccount?.accountName}
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => copyAccount(assignedModal.assignedAccount?.rawAccountNumber || assignedModal.assignedAccount?.accountNumber)}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Number</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-4 text-center leading-relaxed">
              Whenever you transfer funds to this bank account from your mobile app or bank, quote your Member ID <span className="font-bold text-slate-700">{assignedModal.memberId}</span>. It automatically credits your savings wallet!
            </p>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mt-6 w-full py-3 bg-green-800 hover:bg-green-900 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Go to My Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
