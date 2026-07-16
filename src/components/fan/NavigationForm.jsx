import { Accessibility, Loader2, MapPin } from 'lucide-react';

const WAIT_TIME_OPTIONS = [5, 10, 15, 30];

export default function NavigationForm({
  gates,
  selectedGate,
  onSelectGate,
  waitTime,
  onSelectWaitTime,
  needsAccessibility,
  onToggleAccessibility,
  onPredict,
  loading,
}) {
  return (
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
              onChange={(e) => onSelectGate(e.target.value)}
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
              onChange={(e) => onSelectWaitTime(Number(e.target.value))}
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
              aria-label="Enable accessibility mode"
              className="sr-only"
              checked={needsAccessibility}
              onChange={(e) => onToggleAccessibility(e.target.checked)}
            />
          </label>
        </div>
      </div>

      <button
        onClick={onPredict}
        disabled={loading || gates.length === 0}
        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-lg py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_-10px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.6)] hover:-translate-y-0.5"
      >
        {loading ? <Loader2 className="animate-spin" /> : 'Calculate Best Strategy'}
      </button>
    </div>
  );
}
