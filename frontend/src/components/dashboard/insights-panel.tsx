import { Brain, IndianRupee, Sparkles } from "lucide-react";
import { SectionHeading } from "./ui";

type AiInsights = {
  trust_score: number;
  recommendation: string;
  projected_savings_last_30d: number;
} | null;

export function InsightsPanel({
  aiInsights,
  loadingInsights,
  safeStreak,
}: {
  aiInsights: AiInsights;
  loadingInsights: boolean;
  safeStreak: number;
}) {
  return (
    <div className="glass-panel relative overflow-hidden p-6 md:p-8 mt-5 group section-enter" style={{ animationDelay: "40ms" }}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full -mr-10 -mt-10" />
      <SectionHeading
        icon={<Brain className="w-4 h-4 text-purple-400" />}
        title="AI Strategic Insights"
        action={
          aiInsights ? (
            <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-black uppercase tracking-tighter shadow-[0_0_10px_rgba(168,85,247,0.2)]">
              Trust Score: {aiInsights.trust_score}%
            </div>
          ) : undefined
        }
      />

      {loadingInsights && !aiInsights ? (
        <div className="flex items-center gap-3 py-4">
          <span className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-500 animate-pulse tracking-wide">
            Synthesizing claim activity...
          </span>
        </div>
      ) : aiInsights ? (
        <div className="space-y-5">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:border-purple-500/20 transition-all duration-500">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium italic">
              "{aiInsights.recommendation}"
            </p>
          </div>

          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Savings Protection
              </span>
              <span className="text-xl font-black text-slate-200 mt-1 flex items-center">
                <IndianRupee className="w-4 h-4 mr-0.5" />
                {aiInsights.projected_savings_last_30d}
              </span>
            </div>
            <div className="flex flex-col items-end text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Safety Streak
              </span>
              <div className="flex items-center gap-1 mt-1.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-1.5 rounded-full ${
                      i < safeStreak % 6
                        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        : "bg-slate-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500 py-4 italic">
          Insufficient data to generate insights. Start your shift to activate AI guidance.
        </p>
      )}
    </div>
  );
}
