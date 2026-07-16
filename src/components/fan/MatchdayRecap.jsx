import { Loader2, Sparkles } from 'lucide-react';

export default function MatchdayRecap({ recap, loading, onGenerate }) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full group-hover:bg-purple-600/20 transition-colors duration-700" />

      <h3 className="text-xl font-bold mb-5 flex items-center gap-3 text-white relative z-10">
        <Sparkles className="text-purple-400" />
        Matchday Recap
      </h3>

      <button
        onClick={onGenerate}
        disabled={loading}
        className="w-full relative z-10 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50 shadow-sm"
      >
        {loading ? <Loader2 className="animate-spin" /> : 'Generate My Digital Passport'}
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
  );
}
