import { Calendar, IndianRupee } from "lucide-react";
import { SectionHeading } from "./ui";

type ClaimAttempt = {
  attempt_id: string;
  disruption_type?: string;
  attempt_status: string;
  reason?: string;
  payout_amount: number;
  created_at: string;
};

export function ClaimActivityPanel({
  claimActivity,
  loadingClaimActivity,
  onRefresh,
  formatClaimStatus,
  getClaimStatusStyles,
}: {
  claimActivity: ClaimAttempt[];
  loadingClaimActivity: boolean;
  onRefresh: () => void;
  formatClaimStatus: (status: string, reason?: string) => string;
  getClaimStatusStyles: (status: string, reason?: string) => string;
}) {
  return (
    <div className="glass-panel p-6 md:p-8 mt-5 relative overflow-hidden section-enter" style={{ animationDelay: "80ms" }}>
      <SectionHeading
        icon={<Calendar className="w-4 h-4 text-indigo-400" />}
        title="Claim Activity"
        action={
          <button
            onClick={onRefresh}
            disabled={loadingClaimActivity}
            className="pressable text-[10px] font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-full border border-indigo-500/20 uppercase tracking-widest disabled:opacity-50"
          >
            {loadingClaimActivity ? "Loading..." : "Refresh"}
          </button>
        }
      />

      {loadingClaimActivity && claimActivity.length === 0 ? (
        <div className="flex items-center gap-3 py-4">
          <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-500 animate-pulse tracking-wide">
            Loading claim activity...
          </span>
        </div>
      ) : claimActivity.length > 0 ? (
        <div className="space-y-3">
          {claimActivity.map((claim) => (
            <div
              key={claim.attempt_id}
              className="rounded-2xl bg-white/5 border border-white/5 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-slate-100">
                    {String(claim.disruption_type || "UNKNOWN_EVENT").replaceAll("_", " ")}
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-1 rounded-full uppercase border ${getClaimStatusStyles(
                      claim.attempt_status,
                      claim.reason
                    )}`}
                  >
                    {formatClaimStatus(claim.attempt_status, claim.reason)}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {claim.reason || "Decision recorded in the activity ledger."}
                </p>
              </div>
              <div className="flex flex-col md:items-end gap-1">
                <span className="text-lg font-black text-slate-100 flex items-center">
                  <IndianRupee className="w-4 h-4 mr-1" />
                  {claim.payout_amount}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {new Date(claim.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 py-4 italic">
          No activity yet. Simulate a disruption to start building your claim timeline.
        </p>
      )}
    </div>
  );
}
