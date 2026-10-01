import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import WasteAnalyzer from './pages/WasteAnalyzer';
import WasteHistory from './pages/WasteHistory';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import HouseholdProfile from './pages/HouseholdProfile';
import AdminAnalytics from './pages/AdminAnalytics';
import DisposalGuide from './pages/DisposalGuide';
import { WasteAPI } from './api';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [currentHousehold, setCurrentHousehold] = useState('HH-101');
  const [backendStatus, setBackendStatus] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Check backend health on initial load
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await WasteAPI.checkHealth();
        setBackendStatus(res);
      } catch (err) {
        setBackendStatus({ status: 'offline', is_connected: false, database: 'unreachable' });
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-center justify-between gap-3 text-xs animate-in slide-in-from-bottom-5 duration-200 ${
              t.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                : t.type === 'error'
                ? 'bg-red-950/90 border-red-500 text-red-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {t.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : t.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-sky-400 shrink-0" />
              )}
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentHousehold={currentHousehold}
        setCurrentHousehold={setCurrentHousehold}
        backendStatus={backendStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage setActiveTab={setActiveTab} />
        )}

        {activeTab === 'analyzer' && (
          <WasteAnalyzer
            currentHousehold={currentHousehold}
            onPredictionCompleted={() => {}}
            showToast={showToast}
          />
        )}

        {activeTab === 'history' && (
          <WasteHistory
            currentHousehold={currentHousehold}
            showToast={showToast}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            showToast={showToast}
          />
        )}

        {activeTab === 'household' && (
          <HouseholdProfile
            currentHousehold={currentHousehold}
            setCurrentHousehold={setCurrentHousehold}
            showToast={showToast}
          />
        )}

        {activeTab === 'admin' && (
          <AdminAnalytics
            showToast={showToast}
          />
        )}

        {activeTab === 'guide' && (
          <DisposalGuide
            showToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
