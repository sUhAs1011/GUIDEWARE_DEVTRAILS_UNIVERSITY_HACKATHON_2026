type DashboardTab = "hub" | "pulse";

export function DashboardTabs({
  activeTab,
  onChange,
}: {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
      {[
        { key: "hub", label: "Rider Hub" },
        { key: "pulse", label: "City Pulse" },
      ].map((tab) => {
        const active = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key as DashboardTab)}
            className={`pressable rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] ${
              active ? "bg-white text-slate-950" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
