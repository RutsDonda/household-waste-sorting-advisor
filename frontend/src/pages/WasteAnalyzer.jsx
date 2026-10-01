import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Info, 
  ArrowRight,
  HelpCircle,
  FileCheck,
  ChevronDown
} from 'lucide-react';
import { WasteAPI } from '../api';

export default function WasteAnalyzer({ currentHousehold, onPredictionCompleted, showToast }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  // Manual fallback correction
  const [manualCategory, setManualCategory] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmedSuccess, setConfirmedSuccess] = useState(false);

  const fileInputRef = useRef(null);

  const demoSamples = [
    { id: 'plastic_bottle', name: 'Plastic Bottle', cat: 'plastic', icon: '🧴' },
    { id: 'banana_peel', name: 'Banana Peel', cat: 'organic', icon: '🍌' },
    { id: 'cardboard', name: 'Cardboard Box', cat: 'dry_recyclable', icon: '📦' },
    { id: 'soda_can', name: 'Soda Can', cat: 'metal', icon: '🥤' },
    { id: 'glass_jar', name: 'Pickle Jar', cat: 'glass', icon: '🫙' },
    { id: 'battery', name: 'AA Battery', cat: 'hazardous', icon: '🔋' },
    { id: 'old_phone', name: 'Old Phone', cat: 'e_waste', icon: '📱' },
    { id: 'chip_bag', name: 'Chip Bag', cat: 'non_recyclable', icon: '🍿' },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (.jpg, .png, .webp).');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrediction(null);
      setError(null);
      setConfirmedSuccess(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please drop a valid image file.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrediction(null);
      setError(null);
      setConfirmedSuccess(false);
    }
  };

  const runAnalysis = async () => {
    if (!selectedFile) {
      setError('Please choose or upload a waste image first.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setConfirmedSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('household_id', currentHousehold);

      const res = await WasteAPI.predictWaste(formData);
      setPrediction(res);
      setManualCategory(res.category);
      if (onPredictionCompleted) onPredictionCompleted(res);
      if (showToast) showToast('AI Classification Complete!', 'success');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runSampleAnalysis = async (sampleId) => {
    setIsAnalyzing(true);
    setError(null);
    setSelectedFile(null);
    setConfirmedSuccess(false);

    try {
      const res = await WasteAPI.sampleTest(sampleId, currentHousehold);
      setPrediction(res);
      setManualCategory(res.category);
      setPreviewUrl(res.image_url ? (res.image_url.startsWith('http') ? res.image_url : res.image_url) : null);
      if (onPredictionCompleted) onPredictionCompleted(res);
      if (showToast) showToast(`Tested sample: ${res.item}`, 'success');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to run sample test.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmCategory = async () => {
    if (!prediction || !manualCategory) return;
    setIsConfirming(true);

    try {
      await WasteAPI.confirmCategory(prediction.id, manualCategory);
      setConfirmedSuccess(true);
      if (showToast) showToast('Category confirmed & saved to database!', 'success');
    } catch (err) {
      console.error(err);
      setError('Failed to confirm category.');
    } finally {
      setIsConfirming(false);
    }
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPrediction(null);
    setError(null);
    setConfirmedSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Camera className="w-7 h-7 text-emerald-400" />
            <span>AI Waste Analyzer</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Detect household waste item, get recommended municipal bin, and verify instructions.
          </p>
        </div>

        {/* Current Household Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <span className="text-slate-400">Assigned Household:</span>
          <span className="text-emerald-400 font-bold font-mono">{currentHousehold}</span>
        </div>
      </div>

      {/* Main Grid: Upload & Preview on Left, Result on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Upload & Preview Area */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed transition-all p-6 text-center flex flex-col items-center justify-center min-h-[300px] ${
              previewUrl
                ? 'border-emerald-500/50 bg-slate-900/40'
                : 'border-slate-700 hover:border-emerald-500/60 bg-slate-900/60 hover:bg-slate-900/80'
            }`}
          >
            {previewUrl ? (
              <div className="space-y-4 w-full flex flex-col items-center">
                <div className="relative rounded-xl overflow-hidden max-h-[260px] w-full max-w-[280px] border border-slate-700 shadow-lg">
                  <img
                    src={previewUrl}
                    alt="Waste Item Preview"
                    className="w-full h-full object-contain bg-slate-950"
                  />
                  {prediction && (
                    <div className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-700 text-[11px] font-mono text-emerald-400">
                      {Math.round(prediction.confidence * 100)}% Match
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={resetAll}
                    disabled={isAnalyzing}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    Change Image
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-100">
                    Drag and drop your waste photo
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports JPG, PNG, WEBP up to 10MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                >
                  Browse Files
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Action Button */}
          {previewUrl && !prediction && (
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Classifying Image with MobileNetV2...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Analyze Item with AI</span>
                </>
              )}
            </button>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick-Test Sample Selector */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Or test with built-in waste samples:
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Instant Demo</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {demoSamples.map((s) => (
                <button
                  key={s.id}
                  onClick={() => runSampleAnalysis(s.id)}
                  disabled={isAnalyzing}
                  className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-left transition-all flex items-center gap-2 text-xs text-slate-200 cursor-pointer disabled:opacity-50"
                >
                  <span className="text-base">{s.icon}</span>
                  <span className="truncate">{s.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Prediction & Disposal Recommendation Result */}
        <div className="lg:col-span-7">
          {isAnalyzing ? (
            <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4 min-h-[400px] flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-emerald-400 animate-spin" />
                <Sparkles className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Extracting Deep Visual Features...</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  MobileNetV2 CNN evaluates contours, materials, and textures to compute softmax class probabilities.
                </p>
              </div>
            </div>
          ) : prediction ? (
            <div className="space-y-6">
              
              {/* Main Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
                
                {/* Result Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Detected Waste Item
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                      {prediction.item}
                    </h2>
                  </div>

                  {/* Confidence Badge */}
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Confidence Score</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-2xl font-bold font-mono text-emerald-400">
                        {Math.round(prediction.confidence * 1000) / 10}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Low Confidence Warning (if below threshold) */}
                {prediction.is_low_confidence && (
                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold text-amber-300">
                        Low confidence — please verify the category manually.
                      </div>
                      <div className="text-amber-300/80 mt-0.5">
                        The visual model detected ambiguous packaging textures. Use the selector below to confirm the category before disposal.
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommended Bin Box */}
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-slate-400">
                    RECOMMENDED DISPOSAL BIN
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-4 h-4 rounded-full ${
                        prediction.category === 'organic' ? 'bg-emerald-500' :
                        prediction.category === 'plastic' ? 'bg-yellow-500' :
                        prediction.category === 'dry_recyclable' ? 'bg-blue-500' :
                        prediction.category === 'glass' ? 'bg-teal-500' :
                        prediction.category === 'metal' ? 'bg-indigo-500' :
                        prediction.category === 'e_waste' ? 'bg-orange-500' :
                        prediction.category === 'hazardous' ? 'bg-red-500' : 'bg-slate-500'
                      }`} />
                      <span className="text-lg font-bold text-white">
                        {prediction.recommended_bin}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {prediction.category_name}
                    </span>
                  </div>
                </div>

                {/* Disposal Instructions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Handling & Disposal Instructions</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300 pl-2">
                    {prediction.instructions.map((inst, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{inst}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recycling Tips */}
                {prediction.recycling_tips?.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-slate-800/80">
                    <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <span>Environmental & Circular Economy Impact</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-400 pl-2">
                      {prediction.recycling_tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-sky-400 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Manual Category Verification / Fallback */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">
                      Manual Category Confirmation:
                    </span>
                    <span className="text-slate-500">
                      {prediction.is_mock ? 'Inference Engine: Demo Mode' : 'Trained MobileNetV2'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="organic">Organic / Wet Waste</option>
                      <option value="dry_recyclable">Dry / Recyclable Waste</option>
                      <option value="plastic">Plastic</option>
                      <option value="glass">Glass</option>
                      <option value="metal">Metal</option>
                      <option value="e_waste">E-Waste</option>
                      <option value="hazardous">Hazardous Waste</option>
                      <option value="non_recyclable">Non-Recyclable Waste</option>
                    </select>

                    <button
                      onClick={handleConfirmCategory}
                      disabled={isConfirming || confirmedSuccess}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        confirmedSuccess
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {confirmedSuccess ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Confirmed & Recorded</span>
                        </>
                      ) : isConfirming ? (
                        <span>Saving...</span>
                      ) : (
                        <>
                          <FileCheck className="w-4 h-4" />
                          <span>Confirm Category</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Softmax Probability Distribution Collapse */}
                {prediction.all_probabilities && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="text-[11px] font-mono text-slate-400 mb-2">
                      MODEL PROBABILITY VECTOR (Softmax):
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                      {Object.entries(prediction.all_probabilities).map(([cat, prob]) => (
                        <div key={cat} className="p-2 rounded bg-slate-950 border border-slate-800/60 flex justify-between">
                          <span className="text-slate-400 truncate">{cat}</span>
                          <span className={cat === prediction.category ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {Math.round(prob * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-center space-y-4 min-h-[400px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-500">
                <Info className="w-8 h-8" />
              </div>
              <div className="max-w-md">
                <h3 className="text-lg font-bold text-slate-300">Awaiting Waste Input</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Upload an image on the left or select any sample item to inspect real-time classification, recommended bins, and municipal disposal guidelines.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
