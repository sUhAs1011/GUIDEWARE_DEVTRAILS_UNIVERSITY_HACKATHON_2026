import { Activity, AlertTriangle, Brain, Calendar, ShieldCheck } from "lucide-react";

export function CoverageCard({
  premium,
  quoting,
  onRefreshQuote,
  onOpenBreakdown,
  onOpenCoverage,
  onOpenControls,
  breakdownReady,
}: {
  premium: number;
  quoting: boolean;
  breakdownReady: boolean;
  onRefreshQuote: () => void;
  onOpenBreakdown: () => void;
  onOpenCoverage: () => void;
  onOpenControls: () => void;
}) {
  return (
    <div className="glass-panel group relative overflow-hidden p-6 section-enter">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-500/10 blur-[40px] transition-transform duration-700 group-hover:scale-150" />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="p-3.5 rounded-2xl bg-indigo-500/20 text-indigo-400 ring-1 ring-inset ring-indigo-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold ring-1 ring-inset ring-emerald-500/30">
            Active
          </span>
        </div>
        <div className="mt-8">
          <h3 className="text-lg font-bold text-slate-100">Parametric Coverage</h3>
          <p className="text-sm text-slate-400 mt-1 font-medium flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-500" /> Premium Paid:
            <span className="text-slate-200">INR {premium}</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={onRefreshQuote}
              className="pressable flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-2 text-xs font-bold text-indigo-400 hover:bg-indigo-500/20"
            >
              {quoting ? (
                <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Activity className="w-3.5 h-3.5" />
              )}
              {quoting ? "Calculating HGBR Risk..." : "Refresh Premium Quote"}
            </button>
            <button
              onClick={onOpenBreakdown}
              disabled={!breakdownReady}
              className="pressable rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-300 disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                View Premium Breakdown
              </span>
            </button>
            <button
              onClick={onOpenCoverage}
              className="pressable rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300"
            >
              <span className="inline-flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Coverage Info
              </span>
            </button>
            <button
              onClick={onOpenControls}
              className="pressable rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300"
            >
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Fraud & Abuse Controls
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
