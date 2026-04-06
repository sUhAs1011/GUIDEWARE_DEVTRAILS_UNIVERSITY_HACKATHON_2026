import { Activity, AlertTriangle, CloudLightning, MapPinOff, Navigation, Sun } from "lucide-react";
import { SectionHeading } from "./ui";

type RiderState = {
  profile: {
    primary_zone: string;
  };
};

export function SimulationActions({
  riderState,
  loading,
  onTriggerClaim,
  onResetDemo,
}: {
  riderState: RiderState;
  loading: boolean;
  onTriggerClaim: (disruption: any, spoofGPS?: boolean) => void;
  onResetDemo: () => void;
}) {
  const actionBase =
    "pressable group relative flex items-center justify-between w-full p-4 rounded-2xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed outline-none";

  return (
    <aside className="glass-panel-strong w-full lg:w-[400px] p-6 shadow-2xl flex flex-col h-fit sticky top-8 section-enter">
      <SectionHeading
        icon={<Activity className="w-5 h-5 text-indigo-400" />}
        title="Simulate Disruption"
      />
      <p className="text-sm text-slate-400 leading-relaxed mb-6">
        Inject external events to dry-run the claim engine, pricing logic, and fraud-aware protection flow.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1 gap-3">
        <button
          onClick={() =>
            onTriggerClaim({ type: "EXTREME_WEATHER", intensity_value: 45, zone: riderState.profile.primary_zone })
          }
          disabled={loading}
          className={`${actionBase} border border-blue-500/20 bg-gradient-to-r from-blue-950/40 to-blue-900/20 text-blue-100 hover:border-blue-500/60 hover:from-blue-900/60 hover:to-blue-800/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]`}
        >
          <div className="absolute inset-0 w-0 bg-blue-500/10 transition-all duration-500 ease-out group-hover:w-full" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400 group-hover:bg-blue-500/40 group-hover:text-blue-100 transition-colors ring-1 ring-inset ring-blue-500/30">
              <CloudLightning className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm text-blue-50">Extreme Rain</div>
              <div className="text-xs text-blue-300/80 font-medium mt-0.5">Intensity: 45mm</div>
            </div>
          </div>
          <div className="relative z-10 text-blue-500/50 group-hover:text-blue-400 group-hover:translate-x-1 transition-all">
            <Navigation className="w-4 h-4 rotate-90" />
          </div>
        </button>

        <button
          onClick={() =>
            onTriggerClaim({ type: "SEVERE_POLLUTION", intensity_value: 245, zone: riderState.profile.primary_zone })
          }
          disabled={loading}
          className={`${actionBase} border border-amber-500/30 bg-gradient-to-r from-amber-950/40 to-amber-900/20 text-amber-100 hover:border-amber-500/60 hover:from-amber-900/60 hover:to-amber-800/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]`}
        >
          <div className="absolute inset-0 w-0 bg-amber-500/10 transition-all duration-500 ease-out group-hover:w-full" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 group-hover:bg-amber-500/40 group-hover:text-amber-100 transition-colors ring-1 ring-inset ring-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm text-amber-50">Severe Pollution</div>
              <div className="text-xs text-amber-300/80 font-medium mt-0.5">AQI: 245</div>
            </div>
          </div>
          <div className="relative z-10 text-amber-500/50 group-hover:text-amber-400 group-hover:translate-x-1 transition-all">
            <Navigation className="w-4 h-4 rotate-90" />
          </div>
        </button>

        <button
          onClick={() =>
            onTriggerClaim({ type: "EXTREME_WEATHER", intensity_value: 5, zone: riderState.profile.primary_zone })
          }
          disabled={loading}
          className={`${actionBase} border border-slate-600/30 bg-gradient-to-r from-slate-800/40 to-slate-800/20 text-slate-100 hover:border-slate-500 hover:from-slate-700/60 hover:to-slate-700/40 hover:shadow-[0_0_20px_rgba(148,163,184,0.1)]`}
        >
          <div className="absolute inset-0 w-0 bg-slate-500/10 transition-all duration-500 ease-out group-hover:w-full" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-2.5 bg-slate-700/50 rounded-xl text-slate-300 group-hover:bg-slate-600/80 group-hover:text-white transition-colors ring-1 ring-inset ring-slate-500/40">
              <Sun className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm text-slate-100">Clear Weather</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Intensity: 5.0 (Parametric Fail)</div>
            </div>
          </div>
          <div className="relative z-10 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all">
            <Navigation className="w-4 h-4 rotate-90" />
          </div>
        </button>

        <button
          onClick={() =>
            onTriggerClaim({ type: "EXTREME_WEATHER", intensity_value: 45, zone: riderState.profile.primary_zone }, true)
          }
          disabled={loading}
          className={`${actionBase} border border-rose-500/30 bg-gradient-to-r from-rose-950/40 to-rose-900/20 text-rose-100 hover:border-rose-500/60 hover:from-rose-900/60 hover:to-rose-800/40 hover:shadow-[0_0_20px_rgba(225,29,72,0.15)]`}
        >
          <div className="absolute inset-0 w-0 bg-rose-500/10 transition-all duration-500 ease-out group-hover:w-full" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-400 group-hover:bg-rose-500/40 group-hover:text-rose-100 transition-colors ring-1 ring-inset ring-rose-500/30">
              <MapPinOff className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm text-rose-50">GPS Spoofing</div>
              <div className="text-xs text-rose-300/80 font-medium mt-0.5">Test LLM Fraud Filter</div>
            </div>
          </div>
          <div className="relative z-10 text-rose-500/50 group-hover:text-rose-400 group-hover:translate-x-1 transition-all">
            <Navigation className="w-4 h-4 rotate-90" />
          </div>
        </button>
      </div>

      {loading && (
        <div className="mt-6 flex flex-col items-center justify-center py-4 bg-indigo-500/5 rounded-2xl ring-1 ring-inset ring-indigo-500/20">
          <span className="w-5 h-5 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest text-center">
            Processing LLM Risk Evaluation
          </span>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-slate-700/50 border-dashed">
        <button
          onClick={onResetDemo}
          className="pressable w-full py-3 rounded-2xl bg-slate-800/20 border border-slate-700/50 text-slate-500 text-xs font-bold uppercase tracking-widest hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400"
        >
          Reset Demo State (Wipe Cache)
        </button>
      </div>
    </aside>
  );
}
