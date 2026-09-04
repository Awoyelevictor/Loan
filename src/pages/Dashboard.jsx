import React, { useState, useEffect } from 'react';
import { 
  Wallet, Landmark, Briefcase, CreditCard, ChevronDown, 
  ArrowUpRight, ArrowDownRight, Calendar, CheckCircle2, 
  FileText, Users, ShieldCheck, Copy, Check, Plus, 
  DollarSign, ArrowRight, X, AlertCircle, Sparkles, Building2,
  Sliders, ShieldAlert, History, Bell, Send, CheckSquare, RefreshCw, Printer
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { cooperativeAPI } from '../services/api';

export default function Dashboard() {
  const { user, deposit, withdraw, buyShares, applyLoan, repayLoan } = useAuth();

  // Cooperative backend data state
  const [coopData, setCoopData] = useState(null);
  const [loadingCoop, setLoadingCoop] = useState(true);
  const [adminTab, setAdminTab] = useState('contributions'); // contributions | reconciliation | loans | payouts | ledger | audit | notifications | rules

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'deposit' | 'withdraw' | 'shares' | 'loan' | 'repay' | 'guarantor' | 'receipt' | 'ussd'
  const [copied, setCopied] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Form states
  const [depositAmount, setDepositAmount] = useState('20000');
  const [depositNotes, setDepositNotes] = useState('Regular monthly savings');
  const [withdrawAmount, setWithdrawAmount] = useState('10000');
  const [withdrawBank, setWithdrawBank] = useState('First Bank of Nigeria');
  const [withdrawAccountNum, setWithdrawAccountNum] = useState('0123456789');
  const [shareUnits, setShareUnits] = useState('50');
  const [loanForm, setLoanForm] = useState({
    loanType: 'Personal / Development Loan',
    amount: '100000',
    durationMonths: '12',
    purpose: 'Pharmacy expansion & inventory restocking',
    guarantorName: 'Pharm. Kolawole (MEM-PSN-00192)'
  });
  const [repayAmount, setRepayAmount] = useState('20000');

  // Deterministic eligibility engine state
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // USSD Simulator state
  const [ussdString, setUssdString] = useState('*894#');
  const [ussdOutput, setUssdOutput] = useState('');

  // Rules state for admin
  const [rulesForm, setRulesForm] = useState({
    monthlyContributionAmount: 20000,
    loanInterestRateAnnual: 10,
    maxLoanMultiplier: 2,
    guarantorLimitPercent: 50
  });

  const assignedAccount = user?.assignedAccount || {
    accountNumber: '0001 2345 6789',
    rawAccountNumber: '000123456789',
    bankName: 'First Bank of Nigeria',
    accountName: 'FSBC Collection Account 01',
    accountRef: 'FSBC-FBN-01',
    ussdCode: '*894*000123456789#'
  };

  useEffect(() => {
    fetchCooperativeDashboard();
  }, [user]);

  const fetchCooperativeDashboard = async () => {
    try {
      setLoadingCoop(true);
      const res = await cooperativeAPI.getDashboardData();
      if (res.success) {
        setCoopData(res);
        if (res.adminData?.rules) {
          setRulesForm(res.adminData.rules);
        }
      }
    } catch (err) {
      console.error('Failed to fetch cooperative dashboard data:', err);
    } finally {
      setLoadingCoop(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe live statistics
  const totalSavings = user?.stats?.totalSavings ?? 0;
  const shareCapital = user?.stats?.shareCapital ?? 0;
  const totalAssets = user?.stats?.totalAssets ?? (totalSavings + shareCapital);
  const activeLoan = user?.stats?.activeLoan ?? 0;
  const usedGuarantee = user?.guarantor?.usedGuarantee ?? 0;
  const maxGuarantorCapacity = totalAssets * 0.5;
  const availableCapacity = Math.max(0, maxGuarantorCapacity - usedGuarantee);

  const stats = [
    { 
      name: 'Total Savings', 
      value: `₦${totalSavings.toLocaleString()}.00`, 
      icon: Wallet, 
      trend: totalSavings > 0 ? '+12.5%' : 'Ready for deposit', 
      color: 'text-green-600', 
      iconBg: 'bg-green-100', 
      iconColor: 'text-green-700',
      action: () => { setDepositAmount('20000'); setActiveModal('deposit'); }
    },
    { 
      name: 'Share Capital', 
      value: `₦${shareCapital.toLocaleString()}.00`, 
      icon: Landmark, 
      trend: shareCapital > 0 ? '+8.7%' : '0 Units Owned', 
      color: 'text-green-600', 
      iconBg: 'bg-blue-100', 
      iconColor: 'text-blue-700',
      action: () => { setShareUnits('50'); setActiveModal('shares'); }
    },
    { 
      name: 'Total Assets', 
      value: `₦${totalAssets.toLocaleString()}.00`, 
      icon: Briefcase, 
      trend: totalAssets > 0 ? '+15.3%' : '₦0 Initial Balance', 
      color: 'text-green-600', 
      iconBg: 'bg-emerald-100', 
      iconColor: 'text-emerald-700',
      action: null
    },
    { 
      name: 'Active Loan', 
      value: `₦${activeLoan.toLocaleString()}.00`, 
      icon: CreditCard, 
      trend: activeLoan > 0 ? 'Outstanding Balance' : 'No Active Loan', 
      color: 'text-slate-500', 
      iconBg: 'bg-amber-100', 
      iconColor: 'text-amber-700',
      action: () => {
        if (activeLoan > 0) {
          setRepayAmount(String(Math.min(activeLoan, 20000)));
          setActiveModal('repay');
        } else {
          setActiveModal('loan');
        }
      }
    },
  ];

  const hasFunds = totalSavings > 0 || shareCapital > 0 || activeLoan > 0;
  const pieData = hasFunds ? [
    ...(totalSavings > 0 ? [{ name: 'Savings', value: totalSavings, color: '#16a34a' }] : []),
    ...(shareCapital > 0 ? [{ name: 'Share Capital', value: shareCapital, color: '#2563eb' }] : []),
    ...(activeLoan > 0 ? [{ name: 'Loans', value: activeLoan, color: '#f59e0b' }] : []),
  ] : [
    { name: 'Initial Zero Balance', value: 1, color: '#cbd5e1' }
  ];

  const transactions = user?.transactions || [];
  const notifications = user?.notifications || [];

  // Handlers for real API calls
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(depositAmount);
    if (!amt || amt <= 0) return;
    setLoadingAction(true);
    await deposit(amt, depositNotes);
    setLoadingAction(false);
    setActiveModal(null);
    fetchCooperativeDashboard();
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) return;
    if (amt > totalSavings) {
      alert('Withdrawal amount cannot exceed your available savings balance.');
      return;
    }
    setLoadingAction(true);
    await withdraw(amt, withdrawBank, withdrawAccountNum);
    setLoadingAction(false);
    setActiveModal(null);
    fetchCooperativeDashboard();
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    const units = Number(shareUnits);
    if (!units || units <= 0) return;
    setLoadingAction(true);
    await buyShares(units);
    setLoadingAction(false);
    setActiveModal(null);
    fetchCooperativeDashboard();
  };

  const handleCheckEligibility = async () => {
    try {
      setCheckingEligibility(true);
      const res = await cooperativeAPI.checkEligibility(Number(loanForm.amount), Number(loanForm.durationMonths));
      if (res.success) {
        setEligibilityResult(res.evaluation);
      }
    } catch (err) {
      console.error('Eligibility check error:', err);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      const res = await cooperativeAPI.applyLoan(loanForm);
      alert(res.message);
      setActiveModal(null);
      fetchCooperativeDashboard();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRepaySubmit = async (e) => {
    e.preventDefault();
    const amt = Number(repayAmount);
    if (!amt || amt <= 0) return;
    setLoadingAction(true);
    await repayLoan(amt);
    setLoadingAction(false);
    setActiveModal(null);
    fetchCooperativeDashboard();
  };

  const handleUssdTest = async (e) => {
    e.preventDefault();
    try {
      const res = await cooperativeAPI.ussdQuery(ussdString, user?.memberId);
      if (res.success) {
        setUssdOutput(res.ussdResponse);
      }
    } catch (err) {
      setUssdOutput('USSD Gateway timeout or error.');
    }
  };

  const handleAdminLoanAction = async (loanId, action) => {
    const comment = prompt(`Enter comment for loan ${action.toLowerCase()}:`, 'Verified and approved by FSBC Executive Committee');
    if (!comment) return;
    try {
      const res = await cooperativeAPI.adminReviewLoan(loanId, action, comment);
      alert(res.message);
      fetchCooperativeDashboard();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleAdminReconciliation = async (recId, action) => {
    try {
      const res = await cooperativeAPI.adminReconcile(recId, action, null, 'Manually reviewed and confirmed by treasurer');
      alert(res.message);
      fetchCooperativeDashboard();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleAdminPayout = async (payoutId, action) => {
    try {
      const res = await cooperativeAPI.adminApprovePayout(payoutId, action, 'Verified by financial committee');
      alert(res.message);
      fetchCooperativeDashboard();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleUpdateRules = async (e) => {
    e.preventDefault();
    try {
      const res = await cooperativeAPI.updateRules(rulesForm);
      alert(res.message);
      fetchCooperativeDashboard();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const quickAccess = [
    { name: 'Apply for Loan', icon: FileText, color: 'text-green-700', action: () => setActiveModal('loan') },
    { name: 'Make Deposit', icon: Wallet, color: 'text-blue-700', action: () => setActiveModal('deposit') },
    { name: 'Buy Shares', icon: Landmark, color: 'text-emerald-700', action: () => setActiveModal('shares') },
    { name: 'USSD Simulator', icon: Send, color: 'text-purple-700', action: () => setActiveModal('ussd') },
    { name: 'Repay Loan', icon: CreditCard, color: 'text-indigo-700', action: () => setActiveModal('repay') },
  ];

  const isAdmin = coopData?.isAdmin || user?.role === 'ADMIN';
  const adminData = coopData?.adminData;
  const memberData = coopData?.memberData;

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">

      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {isAdmin ? 'Administrator / Treasurer Portal' : 'Verified PSN Member'}
            </span>
            <span className="text-slate-400 text-xs font-mono">ID: {user?.memberId}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Welcome back, {user?.fullName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isAdmin ? 'Manage cooperative collections, loans, reconciliation, and audits.' : 'Manage your cooperative savings, shares, loan eligibility, and payout rotation.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setSelectedReceipt({
                id: `RCT-${Math.floor(100000 + Math.random()*900000)}`,
                type: 'Cooperative Statement Summary',
                member: user?.fullName,
                memberId: user?.memberId,
                amount: totalSavings + shareCapital,
                date: new Date().toLocaleString(),
                status: 'Verified & Authoritative'
              });
              setActiveModal('receipt');
            }}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Official Statement</span>
          </button>
          <button
            onClick={() => setActiveModal('ussd')}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4 text-emerald-200" />
            <span>USSD Gateway (*894#)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MONEY FUNDED BOX WITH FUND WALLET & WITHDRAW BESIDE TRANSACTION HISTORY   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Money Funded & Wallet Actions Box */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                FSBC Wallet Balance
              </span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Secure Ledger
              </span>
            </div>

            <div className="text-xs font-semibold text-slate-500 mb-1">
              Total Money Funded
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              ₦{totalSavings.toLocaleString()}.00
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Assigned Bank:</span>
                <span className="font-semibold text-slate-800">{assignedAccount.bankName}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Account Number:</span>
                <span className="font-mono font-bold text-slate-800">{assignedAccount.accountNumber}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex gap-3">
            <button
              onClick={() => setActiveModal('deposit')}
              className="flex-1 py-3 bg-green-800 hover:bg-green-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Fund Wallet</span>
            </button>
            <button
              onClick={() => setActiveModal('withdraw')}
              className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ArrowDownRight className="w-4 h-4 text-slate-500" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>

        {/* Beside it: Recent Transaction History Box */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Transaction Ledger</h3>
                <p className="text-[11px] text-slate-500">Authoritative records of contributions, loans & payouts</p>
              </div>
              <button 
                onClick={() => setActiveModal('deposit')}
                className="text-xs font-bold text-green-700 hover:text-green-800 cursor-pointer"
              >
                + Add Deposit
              </button>
            </div>

            <div className="space-y-3.5">
              {transactions.slice(0, 4).map((tx) => {
                const isCredit = tx.isCredit;
                return (
                  <div key={tx.id} className="flex justify-between items-center pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCredit 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {isCredit ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{tx.type}</div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {tx.date} • <span className="font-mono">{tx.reference}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-bold ${isCredit ? 'text-green-700' : 'text-slate-800'}`}>
                        {isCredit ? '+ ' : '- '}₦{Number(tx.amount).toLocaleString()}.00
                      </div>
                      <div className="text-[10px] text-green-700 font-semibold mt-0.5">
                        {tx.status}
                      </div>
                    </div>
                  </div>
                );
              })}

              {transactions.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No transactions recorded yet in the financial ledger.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Showing {Math.min(transactions.length, 4)} of {transactions.length} entries</span>
            <span className="text-green-700 font-bold">Immutable Ledger Verified</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4 STATS CARDS GRID */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <div 
              key={idx} 
              onClick={stat.action}
              className={`bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs transition-all ${stat.action ? 'cursor-pointer hover:border-emerald-300 hover:shadow-md' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-11 h-11 rounded-2xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {stat.trend}
                </span>
              </div>

              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {stat.name}
              </div>
              <div className="text-2xl font-black text-slate-900">
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* ADMIN MANAGEMENT HUB (IF ADMIN) OR MEMBER COOPERATIVE TOOLS               */}
      {/* ========================================================================= */}
      {isAdmin ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-800 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Executive Admin & Treasurer Suite
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900">Cooperative Operations & Oversight Hub</h2>
              <p className="text-xs text-slate-500">Manage contributions pipeline, payment reconciliation, loan approvals, payout rotations, and audit logs.</p>
            </div>

            {/* Admin Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold text-slate-600">
              {[
                { key: 'contributions', label: 'Contributions' },
                { key: 'reconciliation', label: 'Reconciliation' },
                { key: 'loans', label: 'Loan Applications' },
                { key: 'payouts', label: 'Payout Rotations' },
                { key: 'ledger', label: 'Financial Ledger' },
                { key: 'audit', label: 'Audit Trail' },
                { key: 'rules', label: 'Rules Engine' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setAdminTab(tab.key)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    adminTab === tab.key ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab 1: Contributions */}
          {adminTab === 'contributions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">Member Contributions Pipeline & Status</h3>
                <span className="text-xs text-slate-500">Total Members: {adminData?.totalMembers || 0}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">Member ID & Name</th>
                      <th className="p-3">Assigned Bank Account</th>
                      <th className="p-3">Total Savings</th>
                      <th className="p-3">Share Capital</th>
                      <th className="p-3">Active Loan</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminData?.allMembers?.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{m.fullName}</div>
                          <div className="text-[10px] font-mono text-slate-400">{m.memberId}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-700">{m.assignedAccount?.bankName}</div>
                          <div className="text-[10px] font-mono text-slate-500">{m.assignedAccount?.accountNumber}</div>
                        </td>
                        <td className="p-3 font-bold text-green-700">₦{(m.stats?.totalSavings || 0).toLocaleString()}</td>
                        <td className="p-3 font-semibold text-blue-700">₦{(m.stats?.shareCapital || 0).toLocaleString()}</td>
                        <td className="p-3 font-semibold text-amber-700">₦{(m.stats?.activeLoan || 0).toLocaleString()}</td>
                        <td className="p-3">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">
                            Verified & Reconciled
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Reconciliation */}
          {adminTab === 'reconciliation' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Payment Reconciliation Queue</h3>
                  <p className="text-xs text-slate-500">Unmatched or uncertain bank transfers requiring human treasurer review</p>
                </div>
              </div>

              <div className="space-y-3">
                {adminData?.reconciliationQueue?.map((rec) => (
                  <div key={rec.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {rec.status}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-700">{rec.reference}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">Sender: {rec.senderName} • ₦{rec.amount.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">Account: {rec.accountNumber} • Date: {rec.date}</div>
                      <div className="text-[11px] text-amber-700 mt-1 italic">{rec.notes}</div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAdminReconciliation(rec.id, 'CONFIRM')}
                        className="px-3 py-2 bg-green-800 hover:bg-green-900 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                      >
                        Confirm & Match
                      </button>
                      <button
                        onClick={() => handleAdminReconciliation(rec.id, 'FLAG')}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Flag for Review
                      </button>
                    </div>
                  </div>
                ))}
                {(!adminData?.reconciliationQueue || adminData.reconciliationQueue.length === 0) && (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    All incoming payments are fully reconciled. No pending reconciliation items.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Loan Applications */}
          {adminTab === 'loans' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">Loan Applications & Human Approval Workflow</h3>
              </div>

              <div className="space-y-3">
                {adminData?.allLoans?.map((loan) => (
                  <div key={loan.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {loan.status}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-700">{loan.loanId}</span>
                        <span className="text-xs text-slate-500">Member: {loan.memberName} ({loan.memberId})</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">{loan.loanType} • ₦{loan.requestedAmount?.toLocaleString()} ({loan.durationMonths} Months)</div>
                      <div className="text-xs text-slate-500 mt-0.5">Purpose: {loan.purpose}</div>
                      <div className="text-xs text-emerald-700 font-semibold mt-1">
                        Eligibility Check: <span className="underline">{loan.eligibilityStatus}</span> — {loan.eligibilityReason}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {loan.status === 'Under Review' && (
                        <>
                          <button
                            onClick={() => handleAdminLoanAction(loan.id, 'APPROVE')}
                            className="px-3 py-2 bg-green-800 hover:bg-green-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Approve Loan
                          </button>
                          <button
                            onClick={() => handleAdminLoanAction(loan.id, 'REJECT')}
                            className="px-3 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {loan.status === 'Approved' && (
                        <button
                          onClick={() => handleAdminLoanAction(loan.id, 'DISBURSE')}
                          className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                        >
                          Disburse Funds
                        </button>
                      )}
                      {loan.status !== 'Under Review' && loan.status !== 'Approved' && (
                        <span className="text-xs text-slate-400 font-semibold italic">Action Completed</span>
                      )}
                    </div>
                  </div>
                ))}
                {(!adminData?.allLoans || adminData.allLoans.length === 0) && (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No loan applications currently submitted.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Payout Rotations */}
          {adminTab === 'payouts' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">Cooperative Payout & Rotation Management</h3>
              </div>

              <div className="space-y-3">
                {adminData?.upcomingPayouts?.map((payout) => (
                  <div key={payout.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {payout.status}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">{payout.cycle}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">Recipient: {payout.recipientName} ({payout.recipientMemberId})</div>
                      <div className="text-xs text-slate-500">Scheduled Payout: ₦{payout.amount?.toLocaleString()} on {payout.scheduledDate}</div>
                    </div>

                    <div className="flex gap-2">
                      {payout.status === 'Pending Review' && (
                        <button
                          onClick={() => handleAdminPayout(payout.id, 'APPROVE')}
                          className="px-3 py-2 bg-green-800 hover:bg-green-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Approve Payout
                        </button>
                      )}
                      {payout.status === 'Approved' && (
                        <button
                          onClick={() => handleAdminPayout(payout.id, 'EXECUTE')}
                          className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Execute Payout
                        </button>
                      )}
                      {payout.status === 'Executed' && (
                        <span className="text-xs text-emerald-700 font-bold">Executed Successfully</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Financial Ledger */}
          {adminTab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">Authoritative Financial Ledger & Monthly Summary</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-xs text-slate-500">Total Collected</div>
                  <div className="text-lg font-black text-slate-900 mt-1">₦{adminData?.totalContributions?.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-xs text-slate-500">Total Active Loans</div>
                  <div className="text-lg font-black text-slate-900 mt-1">₦{adminData?.activeLoansAmount?.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-xs text-slate-500">Active Members</div>
                  <div className="text-lg font-black text-slate-900 mt-1">{adminData?.totalMembers} Pharmacists</div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                <span>All financial records are cryptographically structured and tied to authoritative transaction references.</span>
                <button 
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 cursor-pointer"
                >
                  Download Report (PDF/CSV)
                </button>
              </div>
            </div>
          )}

          {/* Tab 6: Audit Trail */}
          {adminTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">Immutable Audit Trail</h3>
              </div>

              <div className="space-y-2">
                {adminData?.auditTrail?.map((audit) => (
                  <div key={audit.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{audit.action}</span>
                        <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono">{audit.affectedRecord}</span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{audit.reason} • Actor: <span className="font-semibold text-slate-800">{audit.actor}</span></div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {new Date(audit.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 7: Rules Engine */}
          {adminTab === 'rules' && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-sm font-bold text-slate-900">Cooperative Financial Rules Configuration</h3>
              <p className="text-xs text-slate-500">Configure global contribution amounts, loan interest rates, and lending multipliers.</p>

              <form onSubmit={handleUpdateRules} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Contribution Amount (₦)</label>
                  <input
                    type="number"
                    value={rulesForm.monthlyContributionAmount}
                    onChange={(e) => setRulesForm({ ...rulesForm, monthlyContributionAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Loan Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    value={rulesForm.loanInterestRateAnnual}
                    onChange={(e) => setRulesForm({ ...rulesForm, loanInterestRateAnnual: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Loan Multiplier (of Assets)</label>
                  <input
                    type="number"
                    value={rulesForm.maxLoanMultiplier}
                    onChange={(e) => setRulesForm({ ...rulesForm, maxLoanMultiplier: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2.5 px-4 bg-green-800 hover:bg-green-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Cooperative Rules
                </button>
              </form>
            </div>
          )}

        </div>
      ) : (
        /* Member Cooperative Features & Overview */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">My Cooperative Portfolio</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Deterministic Loan Eligibility Engine</h3>
              <p className="text-xs text-slate-500 mb-4">Calculate your pre-approved credit limit instantly based on your savings and contributions.</p>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Savings & Shares:</span>
                  <span className="font-bold text-slate-900">₦{totalAssets.toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Max Permissible Limit (2x):</span>
                  <span className="font-bold text-emerald-700">₦{Math.max(500000, totalAssets * 2).toLocaleString()}.00</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveModal('loan')}
              className="mt-4 w-full py-3 bg-green-800 hover:bg-green-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              Apply for Loan Now
            </button>
          </div>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {quickAccess.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={action.action}
              className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center transition-all cursor-pointer group"
            >
              <div className={`w-10 h-10 rounded-xl bg-slate-100 ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">{action.name}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* DEPOSIT MODAL */}
      {activeModal === 'deposit' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Fund FSBC Wallet / Savings</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl mb-4 text-xs border border-slate-200">
              <span className="font-bold text-slate-700">Dedicated Bank Transfer Info:</span>
              <div className="mt-1 font-mono text-emerald-800 font-bold">{assignedAccount.bankName} - {assignedAccount.accountNumber}</div>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount (₦)</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-base font-bold bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Narration / Notes</label>
                <input
                  type="text"
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50"
                />
              </div>
              <button
                type="submit"
                disabled={loadingAction}
                className="w-full py-3 bg-green-800 hover:bg-green-900 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                {loadingAction ? 'Processing...' : 'Simulate / Record Deposit'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WITHDRAWAL MODAL */}
      {activeModal === 'withdraw' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Withdraw Funds</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount (₦)</label>
                <input
                  type="number"
                  min="1000"
                  max={totalSavings}
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-base font-bold bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Destination Bank</label>
                <input
                  type="text"
                  required
                  value={withdrawBank}
                  onChange={(e) => setWithdrawBank(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Account Number</label>
                <input
                  type="text"
                  maxLength="10"
                  required
                  value={withdrawAccountNum}
                  onChange={(e) => setWithdrawAccountNum(e.target.value)}
                  className="w-full px-3 py-2 font-mono border border-slate-200 rounded-xl text-xs bg-slate-50"
                />
              </div>
              <button
                type="submit"
                disabled={loadingAction}
                className="w-full py-3 bg-green-800 hover:bg-green-900 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                {loadingAction ? 'Processing...' : 'Authorize & Transfer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BUY SHARES MODAL */}
      {activeModal === 'shares' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Buy Cooperative Shares</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleShareSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Number of Share Units (₦1,000 / unit)</label>
                <input
                  type="number"
                  min="10"
                  required
                  value={shareUnits}
                  onChange={(e) => setShareUnits(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-base font-bold bg-slate-50"
                />
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex justify-between">
                <span>Total Cost:</span>
                <span className="font-bold text-slate-900">₦{(Number(shareUnits || 0) * 1000).toLocaleString()}.00</span>
              </div>
              <button
                type="submit"
                disabled={loadingAction}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                {loadingAction ? 'Processing...' : 'Purchase Share Units'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* APPLY LOAN MODAL */}
      {activeModal === 'loan' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Apply for Cooperative Loan</h3>
                <p className="text-xs text-slate-500">Deterministic loan eligibility engine powered</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLoanSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Loan Type</label>
                <select
                  value={loanForm.loanType}
                  onChange={(e) => setLoanForm({ ...loanForm, loanType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50"
                >
                  <option value="Personal / Development Loan">Personal / Development Loan (10% p.a.)</option>
                  <option value="Pharmacy Working Capital">Pharmacy Working Capital (8% p.a.)</option>
                  <option value="Emergency Welfare">Emergency Welfare Facility (5% p.a.)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount (₦)</label>
                  <input
                    type="number"
                    min="50000"
                    step="10000"
                    required
                    value={loanForm.amount}
                    onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration</label>
                  <select
                    value={loanForm.durationMonths}
                    onChange={(e) => setLoanForm({ ...loanForm, durationMonths: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50"
                  >
                    <option value="6">6 Months</option>
                    <option value="12">12 Months</option>
                    <option value="24">24 Months</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Purpose</label>
                <input
                  type="text"
                  value={loanForm.purpose}
                  onChange={(e) => setLoanForm({ ...loanForm, purpose: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                <div className="font-bold mb-1">Deterministic Eligibility Evaluation:</div>
                <button
                  type="button"
                  onClick={handleCheckEligibility}
                  className="px-3 py-1.5 bg-emerald-800 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                >
                  {checkingEligibility ? 'Evaluating...' : 'Check Eligibility Rules'}
                </button>
                {eligibilityResult && (
                  <div className="mt-2 pt-2 border-t border-emerald-200 space-y-1">
                    <div>Status: <span className="font-bold">{eligibilityResult.status}</span></div>
                    <div>Reason: {eligibilityResult.reason}</div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loadingAction}
                className="w-full py-3 bg-green-800 hover:bg-green-900 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                {loadingAction ? 'Submitting...' : 'Submit Loan Application'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REPAY LOAN MODAL */}
      {activeModal === 'repay' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Repay Loan</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRepaySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Repayment Amount (₦)</label>
                <input
                  type="number"
                  min="1000"
                  max={activeLoan}
                  required
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-base font-bold bg-slate-50"
                />
              </div>
              <button
                type="submit"
                disabled={loadingAction}
                className="w-full py-3 bg-green-800 hover:bg-green-900 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                {loadingAction ? 'Processing...' : 'Confirm Loan Repayment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* USSD SIMULATOR MODAL */}
      {activeModal === 'ussd' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <h3 className="text-sm font-bold font-mono">USSD Gateway (*894#)</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mb-4">Test USSD commands for balance checks, loan status, and assigned collection accounts.</p>

            <form onSubmit={handleUssdTest} className="space-y-3">
              <input
                type="text"
                value={ussdString}
                onChange={(e) => setUssdString(e.target.value)}
                className="w-full px-3 py-2 bg-black text-green-400 font-mono rounded-xl border border-slate-700 text-sm outline-none"
                placeholder="*894#"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Send USSD Code
              </button>
            </form>

            {ussdOutput && (
              <div className="mt-4 p-3 bg-black/80 border border-green-500/40 rounded-xl font-mono text-green-300 text-xs whitespace-pre-line">
                {ussdOutput}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {activeModal === 'receipt' && selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">FSBC Official Receipt</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Transaction ID:</span><span className="font-mono font-bold">{selectedReceipt.id}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Member Name:</span><span className="font-bold">{selectedReceipt.member}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Member ID:</span><span className="font-mono">{selectedReceipt.memberId}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date/Time:</span><span>{selectedReceipt.date}</span></div>
              <div className="flex justify-between text-sm pt-2 border-t border-slate-100"><span className="font-bold text-slate-700">Verified Amount:</span><span className="font-black text-emerald-700">₦{selectedReceipt.amount?.toLocaleString()}.00</span></div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Print / Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
