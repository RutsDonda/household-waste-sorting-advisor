import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Recycle, 
  Leaf, 
  Cpu, 
  AlertTriangle, 
  TrendingUp, 
  PieChart as PieIcon, 
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Building
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { WasteAPI } from '../api';

export default function AnalyticsDashboard({ showToast }) {
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [trends, setTrends] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [timeframe, setTimeframe] = useState('daily');
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllAnalytics = async (tf = timeframe) => {
    setIsLoading(true);
    try {
      const [sumRes, catRes, trendRes, topRes] = await Promise.all([
        WasteAPI.getSummary(),
        WasteAPI.getCategoryDistribution(),
        WasteAPI.getTrends(tf),
        WasteAPI.getTopItems()
      ]);
      setSummary(sumRes);
      setCategories(catRes);
      setTrends(trendRes);
      setTopItems(topRes);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to load Big Data analytics.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAnalytics(timeframe);
  }, [timeframe]);

  const COLORS = ['#16a34a', '#2563eb', '#eab308', '#0d9488', '#6366f1', '#f97316', '#dc2626', '#4b5563'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-emerald-400" />
            <span>Big Data Analytics Dashboard</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Aggregated batch metrics powered by Apache Spark / Pandas distributed transformations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe Selector */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setTimeframe('daily')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                timeframe === 'daily' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                timeframe === 'monthly' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>

          <button
            onClick={() => fetchAllAnalytics(timeframe)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Total Analyzed */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Items</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {summary?.total_predictions ?? '...'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Ingested Records</div>
        </div>

        {/* Recycling Percentage */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Recycling Rate</span>
            <Recycle className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400 font-mono">
            {summary?.recycling_percentage ?? '...'}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Diverted from Landfill</div>
        </div>

        {/* Organic Items */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Organic / Wet</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {summary?.organic_count ?? '...'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{summary?.organic_percentage ?? 0}% Composted</div>
        </div>

        {/* Recyclables Total */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Recyclables</span>
            <Recycle className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono">
            {summary?.recyclable_count ?? '...'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Plastic/Paper/Metal/Glass</div>
        </div>

        {/* E-Waste Total */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>E-Waste</span>
            <Cpu className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-orange-400 font-mono">
            {summary?.e_waste_count ?? '...'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Recovered Electronics</div>
        </div>

        {/* Hazardous Waste */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Hazardous</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400 font-mono">
            {summary?.hazardous_count ?? '...'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Safe Disposal Units</div>
        </div>

      </div>

      {/* Row 2: Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Donut Chart for Category Distribution */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              <span>Waste Category Distribution</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Proportion of total municipal waste volume by stream
            </p>
          </div>

          <div className="h-[280px] w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="name"
                >
                  {categories.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color || COLORS[index % COLORS.length]} 
                      stroke="#0f172a"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val, name, item) => [`${val} items (${item.payload.percentage}%)`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Category Legend Badges */}
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-800">
            {categories.map((c, i) => (
              <div key={c.category} className="flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: c.color || COLORS[i % COLORS.length] }} 
                />
                <span className="text-slate-300 truncate">{c.name}:</span>
                <span className="font-mono font-bold text-white">{c.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Area Chart for Generation Trends */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                <span>Waste Generation Trend ({timeframe === 'daily' ? 'Daily Timeline' : 'Monthly Aggregation'})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-stream disposal volume tracked over time
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              PySpark Windowed Aggregation
            </span>
          </div>

          <div className="h-[300px] w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRecyclable" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHazardous" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="organic" name="Organic Waste" stroke="#16a34a" fillOpacity={1} fill="url(#colorOrganic)" />
                <Area type="monotone" dataKey="recyclable" name="Recyclables" stroke="#2563eb" fillOpacity={1} fill="url(#colorRecyclable)" />
                <Area type="monotone" dataKey="hazardous_ewaste" name="Hazardous/E-Waste" stroke="#dc2626" fillOpacity={1} fill="url(#colorHazardous)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span>Calculates organic wet vs dry recyclable vs dangerous streams.</span>
            <span className="font-mono text-slate-300">Total data points: {trends.length}</span>
          </div>
        </div>

      </div>

      {/* Row 3: Category Comparison & Top Waste Items Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Comparison Bar Chart */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <h3 className="text-base font-bold text-white mb-1">
            Category Volume Comparison
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Direct comparison of item counts across categories
          </p>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  angle={-20} 
                  textAnchor="end" 
                  interval={0}
                  tick={{ fontSize: 10 }}
                />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Most Frequently Detected Items */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <h3 className="text-base font-bold text-white mb-1">
            Top 10 Most Common Waste Items
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Items most frequently scanned by household residents
          </p>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={topItems} 
                layout="vertical" 
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis 
                  dataKey="item" 
                  type="category" 
                  stroke="#64748b" 
                  width={110}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Identified Count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
