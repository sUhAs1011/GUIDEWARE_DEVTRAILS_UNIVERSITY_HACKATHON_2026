import { Navigation } from "lucide-react";

type Zone = {
  name: string;
  risk: number;
  status: string;
};

export function CityPulsePanel({ zones }: { zones: Zone[] }) {
  return (
    <div className="glass-panel-strong p-8 relative overflow-hidden group section-enter">
      <div className="flex items-center gap-3 mb-2">
        <Navigation className="w-5 h-5 text-indigo-400" />
        <h2 className="text-xl font-black text-white uppercase tracking-widest">City Risk Pulse</h2>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-slate-400 mb-8">
        Bengaluru demo signals show how localized disruption severity can shift pricing and claims decisions across zones.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map((zone) => (
          <div
            key={zone.name}
            className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all flex flex-col gap-3 group/zone"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{zone.name}</span>
              <span
                className={`text-[8px] font-black px-2 py-1 rounded-full uppercase border ${
                  zone.risk > 85
                    ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                    : zone.risk > 65
                    ? "bg-rose-400/10 text-rose-400 border-rose-400/20"
                    : zone.risk > 40
                    ? "bg-amber-400/10 text-amber-400 border-amber-400/20"
                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                }`}
              >
                {zone.status}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <span
                className={`text-3xl font-black ${
                  zone.risk > 85
                    ? "text-rose-600"
                    : zone.risk > 65
                    ? "text-rose-500"
                    : zone.risk > 40
                    ? "text-amber-500"
                    : zone.risk > 20
                    ? "text-emerald-500"
                    : "text-emerald-400"
                } drop-shadow-sm`}
              >
                {zone.risk}%
              </span>
              <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    zone.risk > 85
                      ? "bg-rose-600"
                      : zone.risk > 65
                      ? "bg-rose-500"
                      : zone.risk > 40
                      ? "bg-amber-500"
                      : zone.risk > 20
                      ? "bg-emerald-500"
                      : "bg-emerald-400"
                  }`}
                  style={{ width: `${zone.risk}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
