import React, { useState, useEffect } from 'react';
import { Search, Navigation2, ShieldCheck, ShieldAlert, Loader2, Info, ChevronDown } from 'lucide-react';

const API_BASE = "http://localhost:8000";

export default function App() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState("Night (9PM - 12AM)");

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2) {
        try {
          const res = await fetch(`${API_BASE}/suggestions?query=${query}`);
          const data = await res.json();
          setSuggestions(data);
        } catch (err) { console.error(err); }
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
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-sans flex flex-col items-center px-6 py-24">
      
      {/* Branding */}
      <header className="flex flex-col items-center mb-20">
        <div className="mb-8 p-5 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl">
          <ShieldCheck size={48} strokeWidth={1.2} />
        </div>
        <h1 className="text-7xl font-[900] tracking-tighter italic uppercase leading-none">
          SAFETY<span className="text-slate-300">WISE</span>
        </h1>
      </header>

      <div className="w-full max-w-lg space-y-6">
        {/* REDUCED SIZE DROPDOWN */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Select Timeframe</span>
          <div className="relative inline-block group">
            <select 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="appearance-none bg-transparent pr-8 pl-2 py-1 text-lg font-black tracking-tight text-slate-900 outline-none cursor-pointer border-b border-slate-100 focus:border-slate-900 transition-colors"
            >
              <option>Evening (5PM - 9PM)</option>
              <option>Night (9PM - 12AM)</option>
              <option>After Midnight (12AM - 5AM)</option>
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={16} />
          </div>
        </div>

        {/* DESTINATION SEARCH */}
        <div className="relative group pt-4">
          <div className="relative flex items-center bg-white border-2 border-slate-100 rounded-[2.5rem] px-8 py-3 transition-all duration-300 group-focus-within:border-slate-900 group-focus-within:shadow-2xl">
            <Search className="text-slate-300 mr-4" size={24} />
            <input 
              className="flex-1 bg-transparent py-5 outline-none text-xl font-bold placeholder:text-slate-200"
              placeholder="Enter destination"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-4 bg-white shadow-[0_40px_80px_rgba(0,0,0,0.15)] rounded-[2.5rem] border border-slate-50 overflow-hidden z-50">
              {suggestions.map((s) => (
                <button 
                  key={s.place_id}
                  onClick={() => { setQuery(s.description); analyzeSafety(s.place_id); }}
                  className="w-full text-left p-6 hover:bg-slate-50 transition-colors text-sm font-bold flex items-center gap-4 text-slate-600 border-b last:border-0 border-slate-50"
                >
                  <Navigation2 size={16} className="rotate-45 text-slate-400" />
                  {s.description}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LOADER */}
      {loading && (
        <div className="mt-20 flex flex-col items-center">
          <Loader2 className="animate-spin text-slate-900 mb-4" size={32} />
          <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Analyzing Environment</p>
        </div>
      )}

      {/* RESULT CARD - ADDED LEVEL BAR */}
      {result && !loading && (
        <div className="mt-16 w-full max-w-xl bg-slate-900 text-white rounded-[4rem] p-12 shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
           <div className="relative z-10">
             <div className="flex justify-between items-center mb-8">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4 block">Security Index</span>
                  <h2 className="text-9xl font-black tracking-tighter leading-none">{Math.round(result.score)}</h2>
                </div>
                
                <div className="flex flex-col items-center gap-4">
                  {result.level === 'Safe' ? (
                    <ShieldCheck size={72} strokeWidth={1.2} className="text-green-500" />
                  ) : (
                    <ShieldAlert size={72} strokeWidth={1.2} className={result.level === 'Risky' ? 'text-red-600' : 'text-amber-400'} />
                  )}
                  
                  <div className={`px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${
                    result.level === 'Safe' ? 'bg-green-500 text-white' : 
                    result.level === 'Moderate' ? 'bg-amber-400 text-slate-900' : 
                    'bg-red-600 text-white'
                  }`}>
                    {result.level}
                  </div>
                </div>
             </div>

             {/* LEVEL BAR INDICATOR */}
             <div className="w-full bg-white/10 h-3 rounded-full mb-12 overflow-hidden shadow-inner">
               <div 
                 className={`h-full transition-all duration-1000 ease-out rounded-full ${
                   result.level === 'Safe' ? 'bg-green-500' : 
                   result.level === 'Moderate' ? 'bg-amber-400' : 'bg-red-600'
                 }`}
                 style={{ width: `${result.score}%` }}
               />
             </div>
             
             <div className="pt-10 border-t border-white/10">
               <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">
                 <Info size={14} /> Intelligence Reasoning
               </h3>
               <p className="text-2xl font-medium leading-relaxed text-slate-300 italic">
                 "{result.reasoning}"
               </p>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}