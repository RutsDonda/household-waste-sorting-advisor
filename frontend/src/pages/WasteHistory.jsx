import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  CheckCircle2,
  RefreshCw,
  X
} from 'lucide-react';
import { WasteAPI } from '../api';

export default function WasteHistory({ currentHousehold, showToast }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [householdFilter, setHouseholdFilter] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [order, setOrder] = useState('desc');

  // Selected item modal
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit,
        sort_by: sortBy,
        order
      };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (householdFilter) params.household_id = householdFilter;
      if (confidenceFilter === 'low') params.is_low_confidence = true;
      if (confidenceFilter === 'high') params.min_confidence = 0.85;

      const data = await WasteAPI.getHistory(params);
      setItems(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to load history.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, categoryFilter, householdFilter, confidenceFilter, sortBy, order]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this waste prediction record?')) return;
    try {
      await WasteAPI.deletePrediction(id);
      if (showToast) showToast('Record deleted.', 'success');
      fetchHistory();
      if (selectedRecord?.id === id) setSelectedRecord(null);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to delete record.', 'error');
    }
  };

  const handleExportCSV = () => {
    window.open('/api/history/export/csv', '_blank');
  };

  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setHouseholdFilter('');
    setConfidenceFilter('');
    setSortBy('timestamp');
    setOrder('desc');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Title & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-emerald-400" />
            <span>Waste Analysis History</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete database of household items analyzed, sorted by date, category, and confidence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchHistory}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search waste item (e.g. bottle, peel, battery)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Categories</option>
            <option value="organic">Organic / Wet Waste</option>
            <option value="dry_recyclable">Dry / Recyclable</option>
            <option value="plastic">Plastic</option>
            <option value="glass">Glass</option>
            <option value="metal">Metal</option>
            <option value="e_waste">E-Waste</option>
            <option value="hazardous">Hazardous Waste</option>
            <option value="non_recyclable">Non-Recyclable</option>
          </select>

          {/* Household Dropdown */}
          <select
            value={householdFilter}
            onChange={(e) => { setHouseholdFilter(e.target.value); setPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Households</option>
            {['HH-101', 'HH-102', 'HH-103', 'HH-104', 'HH-105', 'HH-106', 'HH-107', 'HH-108', 'HH-109', 'HH-110'].map((hh) => (
              <option key={hh} value={hh}>{hh}</option>
            ))}
          </select>

          {/* Confidence Filter */}
          <select
            value={confidenceFilter}
            onChange={(e) => { setConfidenceFilter(e.target.value); setPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Confidence Levels</option>
            <option value="high">High Confidence (≥ 85%)</option>
            <option value="low">Low Confidence (&lt; 70%)</option>
          </select>

          {/* Search Button */}
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
          >
            Filter
          </button>

          {(search || categoryFilter || householdFilter || confidenceFilter) && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}

        </form>
      </div>

      {/* History Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-mono">
                <th className="p-3.5 pl-4">Timestamp</th>
                <th className="p-3.5">Household</th>
                <th className="p-3.5">Item Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Recommended Bin</th>
                <th className="p-3.5">Confidence</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Loading records from MongoDB...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-400">
                    No waste analysis records match your filters.
                  </td>
                </tr>
              ) : (
                items.map((r) => {
                  const confPct = Math.round(r.confidence * 100);
                  const isLow = r.is_low_confidence || r.confidence < 0.70;
                  return (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 pl-4 text-slate-300 font-mono">
                        {r.timestamp ? new Date(r.timestamp).toLocaleDateString() + ' ' + new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="p-3.5 text-slate-300 font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                          {r.household_id || 'HH-101'}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-white">
                        {r.item}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          r.category === 'organic' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          r.category === 'plastic' ? 'bg-yellow-950 text-yellow-300 border border-yellow-800' :
                          r.category === 'dry_recyclable' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                          r.category === 'glass' ? 'bg-teal-950 text-teal-300 border border-teal-800' :
                          r.category === 'metal' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' :
                          r.category === 'e_waste' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                          r.category === 'hazardous' ? 'bg-red-950 text-red-300 border border-red-800' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {r.category_name || r.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300">
                        {r.recommended_bin}
                      </td>
                      <td className="p-3.5 font-mono">
                        <span className={confPct >= 85 ? 'text-emerald-400 font-bold' : confPct >= 70 ? 'text-amber-400' : 'text-red-400 font-bold'}>
                          {confPct}%
                        </span>
                      </td>
                      <td className="p-3.5">
                        {r.user_confirmed_category ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
                            <AlertTriangle className="w-3.5 h-3.5" /> Low Conf
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">Auto AI</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right pr-4 space-x-2">
                        <button
                          onClick={() => setSelectedRecord(r)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{items.length}</span> of <span className="font-semibold text-white">{total}</span> records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || isLoading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-300 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || isLoading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-slate-500">ID: {selectedRecord.id}</span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedRecord.item}</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500">Category</span>
                <div className="font-semibold text-slate-200 mt-1">{selectedRecord.category_name || selectedRecord.category}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500">Confidence</span>
                <div className="font-semibold text-emerald-400 font-mono mt-1">{Math.round(selectedRecord.confidence * 100)}%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500">Assigned Bin</span>
                <div className="font-semibold text-slate-200 mt-1">{selectedRecord.recommended_bin}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500">Household ID</span>
                <div className="font-semibold text-slate-200 font-mono mt-1">{selectedRecord.household_id}</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-400">Disposal Instructions:</span>
              <ul className="space-y-1 text-slate-300 pl-3">
                {(selectedRecord.instructions || []).map((inst, i) => (
                  <li key={i} className="list-disc">{inst}</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
              <span>Model: {selectedRecord.model_version || 'mobilenetv2-waste-v1.0'}</span>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
