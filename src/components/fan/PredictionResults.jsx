import { Timer, ArrowRight } from 'lucide-react';

export default function PredictionResults({ prediction, waitTime }) {
  if (!prediction) return null;

  return (
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
  );
}
