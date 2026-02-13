import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, MapPin, Clock, Loader2, AlertCircle } from 'lucide-react';

const API_BASE = "http://localhost:8000";

export default function App() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState("Night (9PM - 12AM)");

  // Live search for suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2) {
        try {
          const res = await fetch(`${API_BASE}/suggestions?query=${query}`);
          const data = await res.json();
          setSuggestions(data);
        } catch (err) { console.error("Search error:", err); }
      } else { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const analyzeSafety = async (placeId) => {
    setLoading(true);
    setSuggestions([]);
    try {
      const res = await fetch(`${API_BASE}/analyze?place_id=${placeId}&time=${time}`);
      const data = await res.json();
      setResult(data);
    } catch (err) { console.error("Analysis error:", err); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-block p-3 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">SafetyWise AI</h1>
          <p className="text-slate-500 mt-2 font-medium">Real-time night safety intelligence</p>
        </header>

        {/* Search & Time Selection */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-10 border border-slate-100 relative">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-4 text-slate-300" size={20} />
              <input 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                placeholder="Where are you heading?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer"
            >
              <option>Evening (5PM - 9PM)</option>
              <option>Night (9PM - 12AM)</option>
              <option>After Midnight (12AM - 5AM)</option>
              <option>Early Morning (5AM - 9AM)</option>
            </select>
          </div>

          {/* Autocomplete Suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute left-6 right-6 top-24 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2">
              {suggestions.map((s) => (
                <button 
                  key={s.place_id}
                  onClick={() => { setQuery(s.description); analyzeSafety(s.place_id); }}
                  className="w-full text-left p-5 hover:bg-blue-50 border-b last:border-0 text-sm font-semibold flex items-center gap-3 transition-colors text-slate-700"
                >
                  <MapPin size={16} className="text-blue-500" /> {s.description}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading & Results */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-12 text-blue-600 gap-4">
            <Loader2 className="animate-spin" size={48} />
            <span className="font-bold tracking-wide animate-pulse uppercase text-xs">Processing Safety Metrics...</span>
          </div>
        )}
        
        {result && !loading && (
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 animate-in fade-in zoom-in duration-500">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-5">
                <div className={`p-5 rounded-3xl ${result.level === 'Safe' ? 'bg-green-500' : result.level === 'Moderate' ? 'bg-amber-500' : 'bg-red-500'} text-white shadow-lg`}>
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900">{result.level}</h2>
                  <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">Area Assessment</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-black text-slate-800 leading-none">{Math.round(result.score)}</div>
                <div className="text-slate-300 text-[10px] font-black mt-2 uppercase tracking-widest">Safety Index</div>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-4 rounded-full mb-10 overflow-hidden shadow-inner">
              <div 
                className={`h-full transition-all duration-1000 ease-out rounded-full ${result.level === 'Safe' ? 'bg-green-500' : result.level === 'Moderate' ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${result.score}%` }}
              />
            </div>

            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-2 h-full ${result.level === 'Safe' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
              <h3 className="text-[10px] font-black text-slate-400 mb-4 flex items-center gap-2 tracking-[0.2em] uppercase">
                <AlertCircle size={14} /> Safety Insights
              </h3>
              <p className="text-slate-600 leading-relaxed font-semibold italic text-lg">"{result.reasoning}"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}