import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Award, 
  Recycle, 
  Leaf, 
  Cpu, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Info,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { WasteAPI } from '../api';

export default function HouseholdProfile({ currentHousehold, setCurrentHousehold, showToast }) {
  const [households, setHouseholds] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHouseholds = async () => {
    setIsLoading(true);
    try {
      const data = await WasteAPI.getHouseholdStats();
      setHouseholds(data);
      const matched = data.find((h) => h.household_id === currentHousehold) || data[0];
      setProfile(matched);
      if (matched && matched.household_id !== currentHousehold) {
        setCurrentHousehold(matched.household_id);
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to load household profiles.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds();
  }, []);

  const handleSelectHousehold = (hhId) => {
    setCurrentHousehold(hhId);
    const matched = households.find((h) => h.household_id === hhId);
    setProfile(matched);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Household Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-emerald-400" />
            <span>Household Stewardship Profile</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Individual residential segregation performance, recycling rates, and stewardship score.
          </p>
        </div>

        {/* Switch Household Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Select Unit:</span>
          <select
            value={currentHousehold}
            onChange={(e) => handleSelectHousehold(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            {households.map((h) => (
              <option key={h.household_id} value={h.household_id}>
                {h.household_id} ({h.total_items} items)
              </option>
            ))}
          </select>
        </div>
      </div>

      {profile ? (
        <div className="space-y-6">
          
          {/* Top Score Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>RESIDENTIAL SEGREGATION METRIC</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">
                Household {profile.household_id}
              </h2>
              <p className="text-xs text-slate-400 max-w-md">
                Active residential participant in municipal automated waste sorting and circular recycling program.
              </p>
            </div>

            {/* Score Ring / Card */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[200px]">
              <div className="text-xs text-slate-400 font-semibold mb-1">
                Waste Management Score
              </div>
              <div className="text-4xl font-extrabold text-emerald-400 font-mono">
                {profile.waste_score}
                <span className="text-lg text-slate-500">/100</span>
              </div>
              <div className="mt-1.5 inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Grade: {profile.score_grade}
              </div>
            </div>
          </div>

          {/* Mandatory Project Disclaimer Alert */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Project Metric Notice:</span> The Waste Management Score above is an algorithmic demonstration index computed from the ratio of diverted recyclables/organics and proper hazard containment. It is presented as a project demonstration metric rather than an official municipal environmental certification.
            </div>
          </div>

          {/* Breakdown Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Total Items</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {profile.total_items}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Logged from unit</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Recycling Rate</span>
                <Recycle className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400 font-mono">
                {profile.recycling_percentage}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">{profile.recyclable_count} dry recyclable items</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Organic Share</span>
                <Leaf className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                {profile.organic_percentage}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">{profile.organic_count} compostable items</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Hazard & E-Waste</span>
                <AlertTriangle className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-orange-400 font-mono">
                {profile.e_waste_count + profile.hazardous_count}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {profile.e_waste_count} E-waste / {profile.hazardous_count} Hazard
              </div>
            </div>

          </div>

          {/* Recent Waste History for this Household */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Recent Waste Items Logged by {profile.household_id}</span>
              <span className="text-xs text-slate-400 font-normal">Last 5 Scans</span>
            </h3>

            {profile.recent_items?.length > 0 ? (
              <div className="divide-y divide-slate-800">
                {profile.recent_items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-semibold text-slate-200">{item.item}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-slate-800 text-slate-300 font-medium">
                        {item.category.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-slate-500 font-mono">
                        {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center">
                No recent activity logged for this household unit yet.
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="p-12 text-center text-slate-400">
          Loading household profiles...
        </div>
      )}

    </div>
  );
}
