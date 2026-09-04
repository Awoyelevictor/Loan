import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronRight, ShieldCheck, TrendingUp, Users, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-[#0F172A] font-sans selection:bg-[#16a34a]/20">
      {/* Navigation */}
      <nav className="fixed w-full z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-12 bg-green-700/10 rounded flex items-center justify-center font-bold text-green-700">
                PSN
              </div>
              <div>
                <span className="block font-bold text-xl leading-tight">FSBC</span>
                <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Functional System Basic Cooperative</span>
              </div>
            </div>
            <div className="hidden md:flex space-x-8 text-sm font-medium">
              <a href="#about" className="text-gray-600 hover:text-green-700 transition-colors">About FSBC</a>
              <a href="#services" className="text-gray-600 hover:text-green-700 transition-colors">Financial Services</a>
              <a href="#security" className="text-gray-600 hover:text-green-700 transition-colors">Security</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-green-700 transition-colors">Member Login</Link>
              <Link to="/register" className="hidden md:inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 shadow-sm transition-all hover:shadow-md">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden relative">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-green-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-sm font-medium mb-6">
                <ShieldCheck size={16} />
                <span>Secure Financial Platform</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#0F172A] mb-6 leading-[1.1]">
                Manage Your Cooperative Finances <span className="text-green-700">With Confidence.</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
                FSBC brings savings, share capital, loans, payments, assets and cooperative services together in one secure platform for the Pharmaceutical Society of Nigeria.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="inline-flex justify-center items-center px-6 py-3.5 border border-transparent text-base font-medium rounded-lg text-white bg-green-700 hover:bg-green-800 shadow-md hover:shadow-lg transition-all gap-2 group">
                  Get Started
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="inline-flex justify-center items-center px-6 py-3.5 border border-gray-200 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all">
                  Member Login
                </Link>
              </div>
            </motion.div>

            {/* Right Visual / Parallax */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative lg:ml-10"
            >
              <div className="relative rounded-2xl bg-white shadow-2xl border border-gray-100 p-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-green-50/50 to-blue-50/50 opacity-50" />
                {/* Mockup Dashboard Header */}
                <div className="bg-gray-50 rounded-t-xl p-4 border-b border-gray-100 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xs">VA</div>
                     <div>
                       <div className="text-sm font-semibold text-gray-900">Victor Adewale</div>
                       <div className="text-[10px] text-gray-500">Member • FSBC</div>
                     </div>
                   </div>
                   <div className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">Active</div>
                </div>
                {/* Mockup Content */}
                <div className="p-6 relative">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <div className="text-xs text-gray-500 mb-1">Total Savings</div>
                      <div className="text-xl font-bold text-gray-900">₦250,000.00</div>
                      <div className="text-xs text-green-600 mt-2 flex items-center gap-1"><TrendingUp size={12}/> +12.5%</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <div className="text-xs text-gray-500 mb-1">Share Capital</div>
                      <div className="text-xl font-bold text-gray-900">₦150,000.00</div>
                      <div className="text-xs text-green-600 mt-2 flex items-center gap-1"><TrendingUp size={12}/> +8.7%</div>
                    </div>
                  </div>
                  
                  {/* Fake Chart Area */}
                  <div className="bg-gray-50 rounded-xl h-32 border border-gray-100 flex items-end p-4 gap-2">
                    {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                      <div key={i} className="flex-1 bg-blue-100 rounded-t-sm relative group">
                        <div className="absolute bottom-0 left-0 right-0 bg-[#1e3a8a] rounded-t-sm transition-all duration-500 group-hover:bg-green-600" style={{ height: `${h}%` }}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Floating Element 1 */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-6 top-1/4 bg-white p-4 rounded-xl shadow-xl border border-gray-100 z-10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Loan Approved</div>
                    <div className="text-xs text-gray-500">₦200,000.00 disbursed</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Element 2 */}
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -left-8 bottom-1/4 bg-white p-4 rounded-xl shadow-xl border border-gray-100 z-10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Guarantorship</div>
                    <div className="text-xs text-gray-500">Capacity Available</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Footer minimal stub */}
      <footer className="bg-[#0F172A] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">© 2026 Functional System Basic Cooperative. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
