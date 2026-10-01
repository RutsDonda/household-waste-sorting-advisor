import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Recycle, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';
import { WasteAPI } from '../api';

export default function DisposalGuide({ showToast }) {
  const [guides, setGuides] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchGuides = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (search) params.search = search;
      const data = await WasteAPI.getDisposalGuides(params);
      setGuides(data);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to load disposal guide items.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGuides();
  };

  const categories = [
    { id: 'all', name: 'All Streams' },
    { id: 'organic', name: 'Organic / Wet' },
    { id: 'dry_recyclable', name: 'Dry / Recyclable' },
    { id: 'plastic', name: 'Plastic' },
    { id: 'glass', name: 'Glass' },
    { id: 'metal', name: 'Metal' },
    { id: 'e_waste', name: 'E-Waste' },
    { id: 'hazardous', name: 'Hazardous' },
    { id: 'non_recyclable', name: 'Non-Recyclable' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <BookOpen className="w-7 h-7 text-emerald-400" />
          <span>Municipal Disposal Directory & Sorting Rules</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Searchable, database-driven disposal knowledge base for proper household waste segregation.
        </p>
      </div>

      {/* Search Bar & Category Chips */}
      <div className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search waste item (e.g. bottle, peel, battery, bulb, carton)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400">
          Loading disposal guides from database...
        </div>
      ) : guides.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 space-y-2">
          <Info className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No disposal items found.</p>
          <p className="text-xs text-slate-500">Try modifying your search query or selecting a different category stream.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((item) => (
            <div 
              key={item.id || item.item_name}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-5 shadow-lg"
            >
              <div className="space-y-4">
                
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {item.item_name}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                      {item.category_name}
                    </span>
                  </div>

                  {/* Bin Badge */}
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                    item.category === 'organic' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    item.category === 'plastic' ? 'bg-yellow-950 text-yellow-400 border border-yellow-800' :
                    item.category === 'dry_recyclable' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                    item.category === 'glass' ? 'bg-teal-950 text-teal-400 border border-teal-800' :
                    item.category === 'metal' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800' :
                    item.category === 'e_waste' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                    item.category === 'hazardous' ? 'bg-red-950 text-red-400 border border-red-800' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {item.recommended_bin}
                  </span>
                </div>

                {/* Hazard Warning if exists */}
                {item.hazard_warning && (
                  <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-[11px] flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <span>{item.hazard_warning}</span>
                  </div>
                )}

                {/* Instructions */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <span className="font-semibold text-slate-400">Prep & Sorting:</span>
                  <ul className="space-y-1 pl-2">
                    {item.instructions.map((inst, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{inst}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recycling Tips */}
                {item.recycling_tips?.length > 0 && (
                  <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    <span className="font-semibold text-sky-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-sky-400" />
                      <span>Circular Impact:</span>
                    </span>
                    <ul className="space-y-1 pl-2 text-[11px]">
                      {item.recycling_tips.map((tip, idx) => (
                        <li key={idx}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>

              {/* Keywords / Tags Footer */}
              {item.keywords?.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-3 border-t border-slate-800/60">
                  {item.keywords.map((kw, i) => (
                    <span key={i} className="text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono">
                      #{kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
