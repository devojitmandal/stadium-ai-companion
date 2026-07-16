import { Leaf, Train } from 'lucide-react';

export default function GateInfoCards({ gateInfo, loading }) {
  if (loading) {
    return <p className="text-sm text-slate-500 animate-pulse text-center">Analyzing environmental sensors...</p>;
  }

  if (!gateInfo) return null;

  return (
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
  );
}
