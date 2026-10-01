import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Database, 
  Cpu, 
  RefreshCw, 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  Play,
  Layers,
  Clock,
  Server
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { WasteAPI } from '../api';

export default function AdminAnalytics({ showToast }) {
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchOutput, setBatchOutput] = useState(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const data = await WasteAPI.getAdminAnalytics();
      setAdminData(data);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to load admin analytics.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRunBatchJob = async () => {
    setIsBatchRunning(true);
    setBatchOutput(null);
    try {
      const res = await WasteAPI.triggerBatchJob();
      setBatchOutput(res);
      if (showToast) showToast(`Batch job finished via ${res.engine_used}!`, 'success');
      // Refresh admin data
      fetchAdminData();
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Batch processing failed.', 'error');
    } finally {
      setIsBatchRunning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Batch Processing Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <span>Admin & Big Data Control Center</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            System health, model confidence histograms, low-confidence audit, and Apache Spark batch triggers.
          </p>
        </div>

        {/* Trigger Batch Job Button */}
        <button
          onClick={handleRunBatchJob}
          disabled={isBatchRunning}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isBatchRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Executing PySpark Batch Job...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Trigger PySpark Batch Pipeline</span>
            </>
          )}
        </button>
      </div>

      {/* Batch Run Banner (if triggered) */}
      {batchOutput && (
        <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between font-bold text-sm">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Big Data Batch Processing Completed Successfully!</span>
            </span>
            <span className="font-mono text-emerald-300">Job: {batchOutput.job_id}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-emerald-300/90 font-mono">
            <div>Engine: <span className="text-white font-bold">{batchOutput.engine_used}</span></div>
            <div>Records Processed: <span className="text-white font-bold">{batchOutput.records_processed}</span></div>
            <div>Execution Latency: <span className="text-white font-bold">{batchOutput.execution_time_seconds}s</span></div>
            <div>Timestamp: <span className="text-white">{new Date(batchOutput.timestamp).toLocaleTimeString()}</span></div>
          </div>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Households</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {adminData?.total_households ?? '...'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Registered Units</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Ingested Scans</span>
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400 font-mono">
            {adminData?.total_predictions ?? '...'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">NoSQL MongoDB Records</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Predictions / Day</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {adminData?.predictions_per_day ?? '...'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Average Daily Velocity</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Storage Engine</span>
            <Server className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-base font-bold text-purple-400 truncate">
            {adminData?.storage_engine || 'MongoDB Motor'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Document Persistence</div>
        </div>

      </div>

      {/* Row 2: Model Confidence Distribution Histogram & Data Growth Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Model Confidence Histogram */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Model Confidence Distribution
              </h3>
              <p className="text-xs text-slate-400">
                Evaluation of AI certainty across all scanned waste items
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Softmax Histogram
            </span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adminData?.confidence_distribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" name="Items Count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cumulative Data Growth Line Chart */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Cumulative Ingestion Growth
              </h3>
              <p className="text-xs text-slate-400">
                Volume accumulation in MongoDB over the past month
              </p>
            </div>
            <span className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              Storage Scale
            </span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={adminData?.data_growth || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="cumulative" name="Cumulative Scans" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 3: Low-Confidence Predictions Audit Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Low-Confidence Prediction Audit Queue (&lt; 70%)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Items flagged for human quality review or model fine-tuning re-training
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {adminData?.low_confidence_records?.length || 0} flagged records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono">
                <th className="p-3 pl-4">Record ID</th>
                <th className="p-3">Item Name</th>
                <th className="p-3">Predicted Category</th>
                <th className="p-3">Household</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">User Confirmed</th>
                <th className="p-3 text-right pr-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {adminData?.low_confidence_records?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-500">
                    No low-confidence records currently flagged. Model certainty is optimal!
                  </td>
                </tr>
              ) : (
                (adminData?.low_confidence_records || []).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30">
                    <td className="p-3 pl-4 font-mono text-slate-400">{r.id}</td>
                    <td className="p-3 font-semibold text-white">{r.item}</td>
                    <td className="p-3 text-amber-300">{r.category_name || r.category}</td>
                    <td className="p-3 font-mono text-slate-400">{r.household_id}</td>
                    <td className="p-3 font-mono text-amber-400 font-bold">
                      {Math.round(r.confidence * 100)}%
                    </td>
                    <td className="p-3">
                      {r.user_confirmed_category ? (
                        <span className="text-emerald-400 font-medium">
                          {r.user_confirmed_category} (User)
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Pending Verification</span>
                      )}
                    </td>
                    <td className="p-3 text-right pr-4 text-slate-400 font-mono">
                      {r.timestamp ? new Date(r.timestamp).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
