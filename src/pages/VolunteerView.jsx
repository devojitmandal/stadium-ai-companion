import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { askGemini } from '../lib/askGemini';
import { Globe2, AlertCircle, Loader2, ShieldAlert, CheckCircle2, Sparkles } from 'lucide-react';

const POLL_INTERVAL_MS = 5000;

export default function VolunteerView() {
  // --- STATE ---
  // Phrasebook State
  const [language, setLanguage] = useState('Spanish');
  const [situation, setSituation] = useState('Lost Child');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Incident & System State
  const [incidents, setIncidents] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  // --- API CALLS & EFFECTS ---
  const fetchIncidents = useCallback(async () => {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Failed to fetch incidents:", error);
      return;
    }
    setIncidents(data ?? []);
  }, []);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  // --- HANDLERS ---
  const resolveIncident = async (id) => {
    const { error } = await supabase
      .from('incidents')
      .update({ status: 'resolved' })
      .eq('id', id);
      
    if (error) {
      console.error("Resolve error:", error);
      setErrorMsg("Couldn't resolve incident — please try again.");
      setTimeout(() => setErrorMsg(null), 3000); // Auto-clear error
      return;
    }
    fetchIncidents();
  };

  const generatePhrases = async () => {
    setLoading(true);
    setErrorMsg(null);
    
    try {
      const prompt = `
        You are helping a stadium volunteer communicate with a fan who speaks ${language}.
        Situation: ${situation}.
        Generate 5 short phrases the volunteer can read aloud or show on screen:
        - Original English phrase
        - ${language} translation
        - Phonetic pronunciation guide
        Also include 1 short, respectful cultural tip for interacting with people from this culture.
        
        Return strict, raw JSON in this exact format. 
        Do NOT wrap the response in markdown blocks (do not use \`\`\`json). 
        Return ONLY this structure with no other text:
        { 
          "phrases": [ {"english": "...", "translated": "...", "phonetic": "..."} ],
          "cultural_tip": "..."
        }
      `;

      const data = await askGemini(prompt);
      setResult(data);
    } catch (error) {
      console.error("Error generating phrases:", error);
      setErrorMsg("Couldn't reach AI right now — please try again.");
      setTimeout(() => setErrorMsg(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-slate-950 overflow-hidden text-slate-200">
      
      {/* Ambient Background Meshes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />

      <div className="p-6 max-w-4xl mx-auto space-y-6 relative z-10">
        
        {/* Global Error Notice */}
        {errorMsg && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-xl text-sm font-medium animate-in fade-in shadow-lg backdrop-blur-md">
            {errorMsg}
          </div>
        )}

        {/* Incident Management Panel */}
        {incidents.length > 0 && (
          <div className="bg-slate-900/40 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl border border-red-500/20 space-y-5 animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[80px] rounded-full pointer-events-none" />
            
            <h2 className="text-xl font-bold flex items-center gap-3 text-white">
              <div className="p-2 bg-red-500/10 rounded-xl text-red-400">
                <ShieldAlert size={24} />
              </div>
              Active Field Dispatch Alerts
            </h2>
            
            <div className="grid gap-4 relative z-10">
              {incidents.map((inc) => (
                <div key={inc.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-950/50 border border-red-500/30 p-5 rounded-2xl gap-4 hover:border-red-500/50 transition-colors shadow-[0_0_15px_-5px_rgba(239,68,68,0.15)]">
                  <div>
                    <p className="font-bold text-red-400 text-lg tracking-tight">{inc.type}</p>
                    <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wider">{inc.location}</p>
                  </div>
                  <button
                    onClick={() => resolveIncident(inc.id)}
                    className="bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shrink-0 shadow-sm"
                  >
                    <CheckCircle2 size={18} /> Resolve Issue
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Phrasebook Generator Configuration */}
        <div className="bg-slate-900/40 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl border border-slate-800">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3 text-white tracking-tight">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
              <Globe2 size={28} />
            </div>
            Instant Phrasebook
          </h2>
          
          <div>
            {/* Added htmlFor */}
            <label htmlFor="language-select" className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Target Language
            </label>
            <select 
              id="language-select" /* Added id to match */
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-3.5 text-slate-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option className="bg-slate-900">Spanish</option>
              <option className="bg-slate-900">French</option>
              <option className="bg-slate-900">Arabic</option>
              <option className="bg-slate-900">Japanese</option>
              <option className="bg-slate-900">Portuguese</option>
            </select>
          </div>
          
          <div>
            {/* Added htmlFor */}
            <label htmlFor="situation-select" className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Situation
            </label>
            <select 
              id="situation-select" /* Added id to match */
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-3.5 text-slate-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
            >
              <option className="bg-slate-900">Lost Child</option>
              <option className="bg-slate-900">Medical Emergency</option>
              <option className="bg-slate-900">Directions to Gate/Seat</option>
              <option className="bg-slate-900">Ticketing Issue</option>
              <option className="bg-slate-900">Food/Restroom Location</option>
            </select>
          </div>

          <button 
            onClick={generatePhrases}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_-10px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_-5px_rgba(59,130,246,0.6)] hover:-translate-y-0.5"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <><Sparkles size={20} /> Generate Translation Cards</>}
          </button>
        </div>

        {/* AI Results Output UI */}
        {result && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-3xl flex items-start gap-4 shadow-[inset_0_0_30px_rgba(59,130,246,0.05)] backdrop-blur-md">
              <div className="p-3 bg-blue-500/20 rounded-xl shrink-0">
                <AlertCircle className="text-blue-400" size={24} />
              </div>
              <div className="mt-1">
                <h4 className="font-bold text-blue-400 text-lg tracking-tight">Cultural Context Tip</h4>
                <p className="text-blue-50/80 text-base mt-2 leading-relaxed font-medium">{result.cultural_tip}</p>
              </div>
            </div>

            <div className="grid gap-4">
              {result.phrases.map((item, idx) => (
                <div key={idx} className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-800 hover:border-blue-500/40 transition-colors group">
                  <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-widest">{item.english}</p>
                  <p className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight leading-tight group-hover:text-blue-50 transition-colors">{item.translated}</p>
                  <p className="text-sm font-mono text-blue-300/80 bg-slate-950 border border-slate-800/80 inline-block px-4 py-2 rounded-lg">
                    "{item.phonetic}"
                  </p>
                </div>
              ))}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}