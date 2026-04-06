import { IndianRupee, Zap } from "lucide-react";

export function SummaryCards({
  earningsToday,
  incentiveAtRisk,
}: {
  earningsToday: number;
  incentiveAtRisk: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="glass-panel p-6 section-enter">
        <p className="text-xs text-slate-500 uppercase tracking-[0.22em] font-semibold mb-2">
          Earnings Today
        </p>
        <p className="text-4xl font-extrabold text-emerald-400 flex items-center">
          <IndianRupee className="w-7 h-7 mr-1" />
          {earningsToday}
        </p>
      </div>
      <div className="relative overflow-hidden rounded-[2rem] border border-indigo-400/30 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 shadow-[0_10px_40px_rgba(99,102,241,0.35)] section-enter">
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-2xl bg-white/10 text-white ring-1 ring-white/20">
            <Zap className="w-6 h-6" />
          </div>
        </div>
        <p className="mt-8 text-xs font-bold text-indigo-200 uppercase tracking-[0.22em]">
          Income Protected
        </p>
        <p className="mt-2 text-4xl font-extrabold text-white flex items-center">
          <IndianRupee className="w-7 h-7 mr-1" />
          {incentiveAtRisk}
        </p>
      </div>
    </div>
  );
}
