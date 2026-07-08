import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { askGemini } from '../lib/askGemini';
import { buildQueuePredictionPrompt, buildGateInfoPrompt, buildRecapPrompt } from '../lib/prompts';
import { Timer, Accessibility, Loader2, MapPin, ArrowRight, Leaf, Train, X, Sparkles } from 'lucide-react';

// --- CONFIGURATION ---
const NOTIFICATION_POLL_MS = 5000;
const NOTIFICATION_LIMIT = 3;
const WAIT_TIME_OPTIONS = [5, 10, 15, 30];

// --- SHARED UI COMPONENTS ---
function InlineNotice({ tone = 'amber', onDismiss, children }) {
  const toneClasses = {
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    red: 'bg-red-500/10 border-red-500/30 text-red-400',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400'
  };

  return (
    <div className={`${toneClasses[tone]} backdrop-blur-md border p-4 rounded-xl text-sm flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 shadow-lg`}>
      <div className="flex-1 mt-0.5 leading-relaxed">{children}</div>
      {onDismiss && (
        <button 
          onClick={onDismiss} 
          className="text-current opacity-60 hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-white/10"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function FanView() {
  // 1. Core State
  const [gates, setGates] = useState([]);
  const [selectedGate, setSelectedGate] = useState('Gate 3');
  const [waitTime, setWaitTime] = useState(15);
  const [needsAccessibility, setNeedsAccessibility] = useState(false);

  // 2. Feature States
  const [prediction, setPrediction] = useState(null);
  const [predictionError, setPredictionError] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  const [gateInfo, setGateInfo] = useState(null);
  const [gateInfoError, setGateInfoError] = useState(null);
  const [loadingGateInfo, setLoadingGateInfo] = useState(false);

  const [sessionStats, setSessionStats] = useState({ predictions: 0, notificationsSeen: 0 });
  const [recap, setRecap] = useState(null);
  const [recapError, setRecapError] = useState(null);
  const [loadingRecap, setLoadingRecap] = useState(false);

  // 3. Notification State
  const [notifications, setNotifications] = useState([]);
  const [dismissedNotifs, setDismissedNotifs] = useState(new Set());

  // Derived Target Gate
  const targetGate = useMemo(
    () => gates.find((g) => g.gate_id === selectedGate) ?? null,
    [gates, selectedGate]
  );

  // --- API HOOKS ---
  
  // Fetch Stadium Data
  useEffect(() => {
    let isMounted = true;
    const fetchGates = async () => {
      const { data, error } = await supabase.from('stadium_state').select('*').order('gate_id');
      if (!isMounted) return;
      if (error) {
        console.error('Failed to fetch stadium_state:', error);
        return;
      }
      setGates(data ?? []);
    };
    fetchGates();
    return () => { isMounted = false; };
  }, []);

  // Poll Notifications
  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(NOTIFICATION_LIMIT);

      if (!isMounted) return;
      if (error) {
        console.error('Failed to fetch notifications:', error);
        return;
      }
      setNotifications(data ?? []);
      setSessionStats((prev) => ({ ...prev, notificationsSeen: data?.length ?? 0 }));
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, NOTIFICATION_POLL_MS);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Fetch contextual Gate Info when gate changes
  const getGateInfo = useCallback(async () => {
    if (!targetGate) return;
    setLoadingGateInfo(true);
    try {
      const prompt = buildGateInfoPrompt({ context: targetGate.context });
      const result = await askGemini(prompt);
      setGateInfo(result);
      setGateInfoError(null);
    } catch (error) {
      console.error('Gate info error:', error);
      setGateInfoError("Couldn't load gate context — try again.");
    } finally {
      setLoadingGateInfo(false);
    }
  }, [targetGate]);

  useEffect(() => {
    if (targetGate) getGateInfo();
  }, [targetGate, getGateInfo]);

  // --- ACTION HANDLERS ---
  const handleDismissNotif = (id) => {
    setDismissedNotifs((prev) => new Set(prev).add(id));
  };

  const getPrediction = async () => {
    if (!targetGate) {
      setPredictionError('No data available for this gate yet — try again shortly.');
      return;
    }
    setLoadingPrediction(true);
    try {
      const prompt = buildQueuePredictionPrompt({ gateId: selectedGate, gate: targetGate, waitTime, needsAccessibility });
      const result = await askGemini(prompt);
      setPrediction(result);
      setPredictionError(null);
      setSessionStats((prev) => ({ ...prev, predictions: prev.predictions + 1 }));
    } catch (error) {
      console.error('Prediction error:', error);
      setPredictionError("Couldn't reach AI right now — try again.");
    } finally {
      setLoadingPrediction(false);
    }
  };

  const generateRecap = async () => {
    setLoadingRecap(true);
    try {
      const prompt = buildRecapPrompt({ sessionStats, gateId: selectedGate, needsAccessibility });
      const result = await askGemini(prompt);
      setRecap(result);
      setRecapError(null);
    } catch (error) {
      console.error('Recap error:', error);
      setRecapError("Couldn't generate your recap — try again.");
    } finally {
      setLoadingRecap(false);
    }
  };

  // Filter out dismissed notifications
  const visibleNotifications = notifications.filter(n => !dismissedNotifs.has(n.id));

  // --- RENDER ---
  return (
    // Base wrapper with ambient meshes for the "vibe"
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-slate-950 overflow-hidden text-slate-200 selection:bg-blue-500/30">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      <div className="p-6 max-w-4xl mx-auto space-y-6 relative z-10">
        
        {/* Dynamic Broadcast Notifications */}
        {visibleNotifications.map((n) => (
          <InlineNotice key={n.id} tone="amber" onDismiss={() => handleDismissNotif(n.id)}>
            <strong className="text-amber-300 font-bold tracking-wide uppercase text-xs mr-2 border border-amber-500/30 px-2 py-0.5 rounded bg-amber-500/10">Broadcast</strong>
            {n.message}
          </InlineNotice>
        ))}

        {/* Global Errors */}
        {predictionError && <InlineNotice tone="red">{predictionError}</InlineNotice>}
        {gateInfoError && <InlineNotice tone="red">{gateInfoError}</InlineNotice>}
        {recapError && <InlineNotice tone="red">{recapError}</InlineNotice>}

        {/* --- MAIN PREDICTION PANEL --- */}
        <div className="bg-slate-900/40 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl border border-slate-800">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3 text-white tracking-tight">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <MapPin size={28} />
            </div>
            Smart Navigation
          </h2>

          {gates.length === 0 && (
            <p className="text-sm text-slate-400 mb-4 flex items-center gap-2 animate-pulse">
              <Loader2 size={16} className="animate-spin" /> Syncing with stadium telemetry...
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-5">
              <div>
                <label htmlFor="gate-select" className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Target Concession/Gate
                </label>
                <select
                  id="gate-select"
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-3.5 text-slate-100 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                  value={selectedGate}
                  onChange={(e) => setSelectedGate(e.target.value)}
                >
                  {gates.map((gate) => (
                    <option key={gate.gate_id} value={gate.gate_id} className="bg-slate-900">
                      {gate.gate_id} (Wait: {gate.queue_time_min}m)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="wait-select" className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Time flexibility
                </label>
                <select
                  id="wait-select"
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-3.5 text-slate-100 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                  value={waitTime}
                  onChange={(e) => setWaitTime(Number(e.target.value))}
                >
                  {WAIT_TIME_OPTIONS.map((minutes) => (
                    <option key={minutes} value={minutes} className="bg-slate-900">I can wait {minutes} minutes</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-slate-950/30 p-5 rounded-2xl border border-slate-800 flex flex-col justify-center">
              <label className="flex items-center gap-4 cursor-pointer p-2 group">
                <div className={`p-3 rounded-2xl transition-all duration-300 ${needsAccessibility ? 'bg-blue-500 text-white shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}`}>
                  <Accessibility size={24} />
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-lg transition-colors ${needsAccessibility ? 'text-white' : 'text-slate-300'}`}>Accessible Route</p>
                  <p className="text-sm text-slate-500 mt-0.5">Prioritize elevators & step-free paths</p>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${needsAccessibility ? 'bg-blue-500' : 'bg-slate-700'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute transition-transform duration-300 ${needsAccessibility ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={needsAccessibility}
                  onChange={(e) => setNeedsAccessibility(e.target.checked)}
                />
              </label>
            </div>
          </div>

          <button
            onClick={getPrediction}
            disabled={loadingPrediction || gates.length === 0}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-lg py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_-10px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.6)] hover:-translate-y-0.5"
          >
            {loadingPrediction ? <Loader2 className="animate-spin" /> : 'Calculate Best Strategy'}
          </button>
        </div>

        {/* --- PREDICTION RESULTS --- */}
        {prediction && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 text-center flex flex-col justify-center shadow-lg">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Depart Now</p>
              <p className="text-5xl font-black text-white tracking-tighter">
                {prediction.now_wait} <span className="text-xl font-medium text-slate-500 tracking-normal">min</span>
              </p>
            </div>

            <div className="flex items-center justify-center py-2 md:py-0">
              <ArrowRight className="text-slate-700 hidden md:block" size={40} strokeWidth={1} />
              <ArrowRight className="text-slate-700 md:hidden rotate-90" size={32} strokeWidth={1} />
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 text-center flex flex-col justify-center shadow-lg">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Wait {waitTime}m</p>
              <p className="text-5xl font-black text-white tracking-tighter">
                {prediction.later_wait} <span className="text-xl font-medium text-slate-500 tracking-normal">min</span>
              </p>
            </div>

            <div className="md:col-span-3 bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl flex items-start gap-4 shadow-[inset_0_0_30px_rgba(16,185,129,0.05)]">
              <div className="p-3 bg-emerald-500/20 rounded-xl shrink-0">
                <Timer className="text-emerald-400" size={24} />
              </div>
              <div className="mt-1">
                <h4 className="font-bold text-emerald-400 text-lg tracking-tight">AI Strategy Recommendation</h4>
                <p className="text-emerald-50/80 text-base mt-2 leading-relaxed font-medium">{prediction.recommendation}</p>
              </div>
            </div>
          </div>
        )}

        {/* --- CONTEXTUAL GATE INFO --- */}
        {loadingGateInfo && <p className="text-sm text-slate-500 animate-pulse text-center">Analyzing environmental sensors...</p>}
        {gateInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 hover:border-emerald-500/30 transition-colors p-5 rounded-2xl flex items-start gap-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-lg shrink-0 text-emerald-400">
                <Leaf size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-sm tracking-wide">Green Ops Status</h4>
                <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">{gateInfo.sustainability_tip}</p>
              </div>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 hover:border-blue-500/30 transition-colors p-5 rounded-2xl flex items-start gap-4">
              <div className="p-2.5 bg-blue-500/10 rounded-lg shrink-0 text-blue-400">
                <Train size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-sm tracking-wide">Transit Telemetry</h4>
                <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">{gateInfo.transport_status}</p>
              </div>
            </div>
          </div>
        )}

        {/* --- MATCHDAY RECAP --- */}
        <div className="bg-slate-900/40 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full group-hover:bg-purple-600/20 transition-colors duration-700" />
          
          <h3 className="text-xl font-bold mb-5 flex items-center gap-3 text-white relative z-10">
            <Sparkles className="text-purple-400" />
            Matchday Recap
          </h3>
          
          <button
            onClick={generateRecap}
            disabled={loadingRecap}
            className="w-full relative z-10 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50 shadow-sm"
          >
            {loadingRecap ? <Loader2 className="animate-spin" /> : 'Generate My Digital Passport'}
          </button>

          {recap && (
            <div className="mt-6 bg-purple-500/10 border border-purple-500/20 p-6 rounded-2xl space-y-4 relative z-10 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <p className="text-purple-100/90 text-sm md:text-base leading-relaxed">{recap.recap_text}</p>
              <div className="inline-flex bg-purple-500/20 border border-purple-500/30 px-3 py-1.5 rounded-lg">
                <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">
                  <span className="text-purple-400 mr-2">✦</span> {recap.fun_stat}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}