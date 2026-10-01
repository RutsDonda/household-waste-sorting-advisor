import React, { useState } from 'react';
import { 
  Recycle, 
  Camera, 
  BarChart3, 
  History, 
  Home, 
  BookOpen, 
  ShieldCheck, 
  UserCheck, 
  Menu, 
  X,
  Database
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentHousehold, setCurrentHousehold, backendStatus }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'analyzer', label: 'Analyze Waste', icon: Camera, highlight: true },
    { id: 'history', label: 'History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'household', label: 'Household', icon: UserCheck },
    { id: 'admin', label: 'Admin & Spark', icon: ShieldCheck },
    { id: 'guide', label: 'Disposal Guide', icon: BookOpen },
  ];

  const households = [
    'HH-101', 'HH-102', 'HH-103', 'HH-104', 'HH-105',
    'HH-106', 'HH-107', 'HH-108', 'HH-109', 'HH-110'
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Recycle className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                WasteSort AI
              </span>
              <span className="hidden sm:block text-xs text-slate-400 font-medium">
                Household Sorting Advisor • Big Data System
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : item.highlight
                      ? 'text-emerald-400 hover:bg-emerald-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {item.label}
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Household Selector & System Status */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Household Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
              <span className="text-slate-400">Unit:</span>
              <select
                value={currentHousehold}
                onChange={(e) => setCurrentHousehold(e.target.value)}
                className="bg-transparent text-emerald-400 font-semibold focus:outline-none cursor-pointer"
              >
                {households.map((hh) => (
                  <option key={hh} value={hh} className="bg-slate-900 text-slate-200">
                    {hh}
                  </option>
                ))}
              </select>
            </div>

            {/* Health Status Indicator */}
            <div 
              title={`API Status: ${backendStatus ? 'Connected (' + (backendStatus.database || 'active') + ')' : 'Connecting...'}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs"
            >
              <span className={`w-2 h-2 rounded-full ${backendStatus?.is_connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300 text-[11px] font-mono">
                {backendStatus?.is_connected ? (backendStatus.database === 'mongodb' ? 'MongoDB' : 'DB Active') : 'Connecting'}
              </span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-900/95 px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Current Household:</span>
            <select
              value={currentHousehold}
              onChange={(e) => setCurrentHousehold(e.target.value)}
              className="bg-slate-800 text-emerald-400 text-xs rounded px-2 py-1 border border-slate-700 font-semibold"
            >
              {households.map((hh) => (
                <option key={hh} value={hh}>{hh}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </header>
  );
}
