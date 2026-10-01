import React from 'react';
import { 
  Camera, 
  Sparkles, 
  BarChart3, 
  Recycle, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Database, 
  Cpu, 
  Layers,
  Leaf,
  Flame,
  Zap,
  Globe2
} from 'lucide-react';

export default function LandingPage({ setActiveTab }) {
  const steps = [
    {
      num: '01',
      title: 'Upload or Capture',
      desc: 'Snap a photo of any household discarded item—a plastic bottle, eggshell, old battery, or cardboard carton.',
      icon: Camera,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      num: '02',
      title: 'AI Classification',
      desc: 'Deep learning MobileNetV2 analyzes visual textures, features, and contours to identify category and confidence.',
      icon: Cpu,
      color: 'from-sky-500 to-blue-600'
    },
    {
      num: '03',
      title: 'Smart Disposal Guide',
      desc: 'Get the exact color-coded municipal bin, prep instructions (e.g. rinse, crush), and recycling tips immediately.',
      icon: Recycle,
      color: 'from-amber-500 to-orange-500'
    },
    {
      num: '04',
      title: 'Big Data Ingestion',
      desc: 'Prediction metadata streams into MongoDB and PySpark batch pipelines to compute neighborhood trends & scores.',
      icon: Database,
      color: 'from-purple-500 to-indigo-600'
    }
  ];

  const categories = [
    { name: 'Organic / Wet', bin: 'Green Bin', hex: '#16a34a', bg: 'bg-emerald-950/40 border-emerald-800/50', text: 'text-emerald-400', desc: 'Food scraps, peels, coffee grounds, garden matter' },
    { name: 'Dry / Recyclable', bin: 'Blue Bin', hex: '#2563eb', bg: 'bg-blue-950/40 border-blue-800/50', text: 'text-blue-400', desc: 'Clean paper, cardboard boxes, cartons, magazines' },
    { name: 'Plastic', bin: 'Yellow Bin', hex: '#eab308', bg: 'bg-yellow-950/40 border-yellow-800/50', text: 'text-yellow-400', desc: 'PET bottles, HDPE milk jugs, clean food containers' },
    { name: 'Glass', bin: 'Teal Bin', hex: '#0d9488', bg: 'bg-teal-950/40 border-teal-800/50', text: 'text-teal-400', desc: 'Beverage bottles, pickle jars, glass cosmetic containers' },
    { name: 'Metal', bin: 'Indigo Bin', hex: '#6366f1', bg: 'bg-indigo-950/40 border-indigo-800/50', text: 'text-indigo-400', desc: 'Aluminum soda cans, tin food cans, foil, bottle caps' },
    { name: 'E-Waste', bin: 'Orange Depot', hex: '#f97316', bg: 'bg-orange-950/40 border-orange-800/50', text: 'text-orange-400', desc: 'Old phones, cables, circuit boards, small peripherals' },
    { name: 'Hazardous Waste', bin: 'Red Depot', hex: '#dc2626', bg: 'bg-red-950/40 border-red-800/50', text: 'text-red-400', desc: 'Batteries, paint, solvents, fluorescent CFL tubes' },
    { name: 'Non-Recyclable', bin: 'Black Bin', hex: '#4b5563', bg: 'bg-slate-900 border-slate-700/60', text: 'text-slate-400', desc: 'Multi-layer chip bags, soiled wrappers, styrofoam' }
  ];

  return (
    <div className="space-y-24 py-8">

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30 pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-emerald-600/30 to-cyan-500/20 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>AI Vision Classification + Apache Spark Batch Processing</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Household Waste Sorting <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Intelligent Advisor
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate sorting confusion at the source. Upload a waste photo to receive instant 
            AI classification, proper municipal bin guidance, and see how your household 
            contributes to city-wide Big Data sustainability analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setActiveTab('analyzer')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-base hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Camera className="w-5 h-5 text-slate-950" />
              <span>Analyze Waste Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-200 font-semibold text-base hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>Explore Big Data Dashboard</span>
            </button>
          </div>

          {/* Key Quick Stats */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-2xl font-bold text-emerald-400">8 Classes</div>
              <div className="text-xs text-slate-400 mt-1">Municipal Categories</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-2xl font-bold text-sky-400">&gt; 90%</div>
              <div className="text-xs text-slate-400 mt-1">Classification Accuracy</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-2xl font-bold text-amber-400">&lt; 300ms</div>
              <div className="text-xs text-slate-400 mt-1">Inference Latency</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-2xl font-bold text-purple-400">PySpark</div>
              <div className="text-xs text-slate-400 mt-1">Big Data MapReduce</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            How The System Works
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Seamless pipeline from camera lens to distributed batch aggregation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div 
                key={idx}
                className="relative p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-extrabold text-slate-600 font-mono">
                      {s.num}
                    </span>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${s.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Categories & Bins Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-medium">
            <Recycle className="w-3.5 h-3.5 text-teal-400" />
            <span>Extensible Municipal Taxonomy</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            8 Supported Waste Streams & Bin Allocations
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Each category links to a designated color-coded collection bin, handling precautions, and circular lifecycle instructions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((c, idx) => (
            <div 
              key={idx}
              className={`p-5 rounded-xl border ${c.bg} flex flex-col justify-between space-y-4`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${c.text}`}>
                    {c.bin}
                  </span>
                  <span 
                    className="w-3.5 h-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: c.hex }}
                  />
                </div>
                <h4 className="text-base font-bold text-slate-100 mt-2">
                  {c.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {c.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI & Big Data System Architecture Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-mono">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>BDS COLLEGE PROJECT ARCHITECTURE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Designed for Municipal Big Data Scalability
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                A modern municipal system cannot rely on simple database queries when processing millions of waste disposal events across urban sectors. Our architecture decouples real-time classification from heavy batch analytics:
              </p>

              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Fast Ingestion Tier:</span> FastAPI asynchronous REST endpoints parse multipart payloads with file verification.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">NoSQL Document Store:</span> MongoDB preserves raw telemetry with indexes on timestamp, category, and household.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Distributed Processing:</span> Apache Spark / PySpark executes MapReduce-style DataFrame transformations, window aggregations, and trend lines.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('admin')}
                  className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-sm font-semibold border border-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Inspect PySpark Batch Job Runner</span>
                </button>
              </div>
            </div>

            {/* Visual Architecture Box */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 font-mono text-xs text-slate-300 space-y-4">
              <div className="text-emerald-400 font-bold border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>SYSTEM DATAFLOW</span>
                <span className="text-[10px] text-slate-500">IEEE / BDS STANDARD</span>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                <div className="text-sky-400 font-semibold">[1] Ingestion</div>
                <div>User Photo ➔ FastAPI (`/api/predict`) ➔ Validate MIME</div>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                <div className="text-amber-400 font-semibold">[2] Computer Vision</div>
                <div>MobileNetV2 (Transfer Learning) ➔ Softmax Vector ➔ Bin Map</div>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                <div className="text-emerald-400 font-semibold">[3] Persistence</div>
                <div>MongoDB `waste_predictions` ➔ Indexed (ts, cat, hh_id)</div>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                <div className="text-purple-400 font-semibold">[4] Big Data Batch Engine</div>
                <div>PySpark Session ➔ DataFrame groupBy() ➔ Windowing ➔ Scores</div>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                <div className="text-cyan-400 font-semibold">[5] Real-Time Visualization</div>
                <div>React + Recharts ➔ Municipal Dashboards & Citizen Insights</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>Environmental Impact</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Why Intelligent Waste Segregation Matters
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Every item properly sorted diverts valuable resources from municipal open landfills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Methane Abatement</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Organic wet waste rotting in anaerobic landfill conditions produces potent methane ($CH_4$). Diverting to municipal composting converts wet mass to organic fertilizer.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Globe2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Circular Resource Recovery</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Recycling aluminum cans saves 95% of the energy needed for primary smelting. Glass and PET plastics can be re-pelletized repeatedly without virgin crude consumption.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Toxic Containment</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Lithium batteries, CFL tubes, and e-waste contain lead, mercury, and cadmium. AI-guided segregation keeps dangerous toxins out of urban drinking water aquifers.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 text-center space-y-5">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to test the classifier on an item?
          </h3>
          <p className="text-slate-300 text-sm max-w-lg mx-auto">
            Upload your own photo or pick from built-in municipal test samples to see real-time inference in action.
          </p>
          <div>
            <button
              onClick={() => setActiveTab('analyzer')}
              className="px-8 py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <span>Launch Waste Analyzer</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
