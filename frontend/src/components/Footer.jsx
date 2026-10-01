import React from 'react';
import { Recycle, Cpu, Database, Server, BarChart2 } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Recycle className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200">
              Household Waste Sorting Advisor
            </div>
            <div className="text-xs text-slate-400">
              Big Data System (BDS) Academic Project • College Level
            </div>
          </div>
        </div>

        {/* Center: Tech Stack Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-sky-400" /> MobileNetV2 AI
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Server className="w-3.5 h-3.5 text-teal-400" /> FastAPI
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Database className="w-3.5 h-3.5 text-emerald-400" /> MongoDB NoSQL
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <BarChart2 className="w-3.5 h-3.5 text-amber-400" /> Apache Spark / PySpark
          </span>
        </div>

        {/* Right: Quick Links */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <button onClick={() => setActiveTab('landing')} className="hover:text-emerald-400 transition-colors">
            Overview
          </button>
          <button onClick={() => setActiveTab('analyzer')} className="hover:text-emerald-400 transition-colors">
            Analyze
          </button>
          <button onClick={() => setActiveTab('analytics')} className="hover:text-emerald-400 transition-colors">
            Analytics
          </button>
          <button onClick={() => setActiveTab('guide')} className="hover:text-emerald-400 transition-colors">
            Disposal Guide
          </button>
        </div>

      </div>
      
      <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-slate-900 text-center text-xs text-slate-400">
        Designed for Municipal Waste Segregation, Circular Economy Incentives, and Large-Scale Data Aggregations.
      </div>
    </footer>
  );
}
