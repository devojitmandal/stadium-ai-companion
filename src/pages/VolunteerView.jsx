import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { askGemini } from '../lib/askGemini';
import { buildPhrasebookPrompt } from '../lib/prompts';
import { TABLES, INCIDENT_STATUS } from '../lib/constants';
import InlineNotice from '../components/InlineNotice';
import { Globe2, AlertCircle, Loader2, ShieldAlert, CheckCircle2, Sparkles } from 'lucide-react';

const ERROR_DISPLAY_MS = 3000;
const LANGUAGES = ['Spanish', 'French', 'Arabic', 'Japanese', 'Portuguese'];
const SITUATIONS = ['Lost Child', 'Medical Emergency', 'Directions to Gate/Seat', 'Ticketing Issue', 'Food/Restroom Location'];

export default function VolunteerView() {
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [situation, setSituation] = useState(SITUATIONS[0]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [incidents, setIncidents] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const showError = (message) => {
    setErrorMsg(message);
    setTimeout(() => setErrorMsg(null), ERROR_DISPLAY_MS);
  };

  const fetchIncidents = useCallback(async () => {
    const { data, error } = await supabase
      .from(TABLES.INCIDENTS)
      .select('*')
      .eq('status', INCIDENT_STATUS.OPEN)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch incidents:', error);
      return;
    }
    setIncidents(data ?? []);
  }, []);

  // Live dispatch alerts: load once, then subscribe to changes instead of
  // polling on an interval — only refetches when an incident is actually
  // created or resolved, elsewhere (e.g. the Organizer's dispatch action).
  useEffect(() => {
    fetchIncidents();
    const channel = supabase
      .channel('volunteer-incidents')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.INCIDENTS }, fetchIncidents)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchIncidents]);

  const resolveIncident = async (id) => {
    const { error } = await supabase
      .from(TABLES.INCIDENTS)
      .update({ status: INCIDENT_STATUS.RESOLVED })
      .eq('id', id);

    if (error) {
      console.error('Resolve error:', error);
      showError("Couldn't resolve incident — please try again.");
      return;
    }
    // The realtime subscription will also refresh the list, but resolving
    // immediately keeps the UI feeling instant rather than waiting on it.
    fetchIncidents();
  };

  const generatePhrases = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await askGemini(buildPhrasebookPrompt({ language, situation }));
      setResult(data);
    } catch (error) {
      console.error('Error generating phrases:', error);
      showError("Couldn't reach AI right now — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-slate-950 overflow-hidden text-slate-200">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />

      <div className="p-6 max-w-4xl mx-auto space-y-6 relative z-10">

        {errorMsg && <InlineNotice tone="amber">{errorMsg}</InlineNotice>}

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

        <div className="bg-slate-900/40 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl border border-slate-800">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3 text-white tracking-tight">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
              <Globe2 size={28} />
            </div>
            Instant Phrasebook
          </h2>

          <div>
            <label htmlFor="language-select" className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Target Language
            </label>
            <select
              id="language-select"
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-3.5 text-slate-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} className="bg-slate-900">{lang}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="situation-select" className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Situation
            </label>
            <select
              id="situation-select"
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-3.5 text-slate-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
            >
              {SITUATIONS.map((s) => (
                <option key={s} className="bg-slate-900">{s}</option>
              ))}
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
              {result.phrases.map((item) => (
                <div key={item.english} className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-800 hover:border-blue-500/40 transition-colors group">
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