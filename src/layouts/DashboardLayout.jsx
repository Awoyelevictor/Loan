import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  Landmark, 
  Briefcase, 
  CreditCard, 
  FileText, 
  Users, 
  Calendar, 
  BarChart, 
  MessageSquare, 
  HelpCircle,
  Menu,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Savings', path: '/dashboard/savings', icon: Wallet },
    { name: 'Share Capital', path: '/dashboard/shares', icon: Landmark },
    { name: 'Assets', path: '/dashboard/assets', icon: Briefcase },
    { name: 'Loans', path: '/dashboard/loans', icon: CreditCard },
    { name: 'Payments', path: '/dashboard/payments', icon: FileText },
    { name: 'Transactions', path: '/dashboard/transactions', icon: FileText },
    { name: 'Guarantors', path: '/dashboard/guarantors', icon: Users },
    { name: 'AGM', path: '/dashboard/agm', icon: Calendar },
    { name: 'Reports', path: '/dashboard/reports', icon: BarChart },
    { name: 'Messages', path: '/dashboard/messages', icon: MessageSquare, badge: 3 },
    { name: 'Support', path: '/dashboard/support', icon: HelpCircle },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800">
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 md:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`w-[260px] bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 mb-2">
           <Link to="/dashboard" onClick={() => setMobileSidebarOpen(false)} className="flex items-center gap-3">
             <div className="w-10 h-12 bg-green-800 rounded-b-xl rounded-t-sm flex items-center justify-center font-extrabold text-white text-xs border-2 border-green-900 shadow-inner">
               PSN
             </div>
             <div>
               <div className="font-extrabold text-xl text-green-950 tracking-tight leading-none">FSBC</div>
               <div className="text-[9px] font-semibold text-slate-500 uppercase leading-tight mt-1">Functional System<br/>Basic Cooperative</div>
             </div>
           </Link>

           <button
             type="button"
             onClick={() => setMobileSidebarOpen(false)}
             className="md:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
             aria-label="Close sidebar"
           >
             <X className="w-5 h-5" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard');
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                  isActive 
                    ? 'bg-green-800 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
                {item.badge && (
                  <span className={`ml-auto py-0.5 px-2 rounded-full text-[10px] font-bold ${isActive ? 'bg-white text-green-800' : 'bg-green-100 text-green-800'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-800 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">{user?.fullName || 'FSBC Member'}</div>
              <div className="text-[10px] text-slate-500 font-mono font-medium truncate">{user?.memberId || 'MEM-PSN-00000'}</div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2 text-red-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-[260px] flex flex-col min-h-screen min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-none">Member Portal</h1>
              <span className="text-[9px] sm:text-[10px] text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded-full border border-green-200 inline-block mt-1">
                Live Cooperative Network
              </span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center flex-1 justify-center max-w-md px-6">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search transactions, loans, accounts..." 
                className="block w-full pl-10 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="relative">
              <button className="text-slate-500 hover:text-slate-700 relative p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-700 text-white text-[8px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {user?.notifications?.length || 0}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-3 sm:pl-5">
              <div className="w-8 h-8 rounded-full bg-green-800 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">{user?.fullName}</div>
                <div className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">{user?.professionalTitle || 'Member'}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block ml-0.5" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50/60">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
