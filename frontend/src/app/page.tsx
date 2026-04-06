"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle, IndianRupee, Navigation, TrendingUp, Brain } from "lucide-react";
import { ClaimActivityPanel } from "@/components/dashboard/claim-activity-panel";
import { CoverageCard } from "@/components/dashboard/coverage-card";
import { CityPulsePanel } from "@/components/dashboard/city-pulse-panel";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { OverlayInfoModal } from "@/components/dashboard/overlay-info-modal";
import { SimulationActions } from "@/components/dashboard/simulation-actions";
import { SummaryCards } from "@/components/dashboard/summary-cards";


const INITIAL_RIDER_STATE = {
  rider_id: "RIDER_8023",
    profile: {
      name: "Ravi Kumar",
      phone: "+91-9876543210",
      vehicle_type: "2_WHEELER",
      primary_zone: "BLR_INDIRANAGAR",
    },
    real_time_state: {
      status: "ONLINE",
      current_location: { lat: 12.9784, lon: 77.6408 },
      last_ping_timestamp: "2026-03-16T20:54:00Z",
    },
    daily_performance: {
      orders_completed_today: 14,
      daily_target: 18,
      incentive_at_risk: 250.00,
      earnings_today: 650.00,
    },
    insurance_profile: {
      policy_active: true,
      weekly_premium_paid: 22.50,
      risk_score: 0.85,
    },
    fraud_telemetry: {
      current_speed_kmph: 0.0,
      is_mock_location_enabled: false,
      battery_level: 45,
    },
  };

const CITY_ZONES = [
  { name: "Indiranagar", risk: 78, status: "Elevated" },
  { name: "Koramangala", risk: 65, status: "Elevated" },
  { name: "Whitefield", risk: 82, status: "Critical" },
  { name: "HSR Layout", risk: 58, status: "Elevated" },
  { name: "Jayanagar", risk: 34, status: "Normal" },
  { name: "Malleshwaram", risk: 28, status: "Normal" },
  { name: "Electronic City", risk: 71, status: "Elevated" },
  { name: "Bellandur", risk: 91, status: "Critical" },
  { name: "Sarjapur Road", risk: 76, status: "Elevated" },
  { name: "JP Nagar", risk: 39, status: "Normal" },
  { name: "Marathahalli", risk: 74, status: "Elevated" },
  { name: "Hebbal", risk: 47, status: "Elevated" },
];

export default function Dashboard() {
  const [riderState, setRiderState] = useState(INITIAL_RIDER_STATE);
  const [premiumBreakdown, setPremiumBreakdown] = useState<any>(null);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [coverageModalOpen, setCoverageModalOpen] = useState(false);
  const [controlsModalOpen, setControlsModalOpen] = useState(false);
  const [claimActivity, setClaimActivity] = useState<any[]>([]);
  const [loadingClaimActivity, setLoadingClaimActivity] = useState(false);
  const [activeTab, setActiveTab] = useState<'hub' | 'pulse'>('hub');


  // Load from local storage on first mount to prevent resetting on page reload
  useEffect(() => {
    const savedData = localStorage.getItem("rider_dashboard_state");
    if (savedData) {
      try {
        setRiderState(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
  }, []);

  // Save to local storage whenever rider state changes
  useEffect(() => {
    localStorage.setItem("rider_dashboard_state", JSON.stringify(riderState));
  }, [riderState]);

  const [modalData, setModalData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [appealLoading, setAppealLoading] = useState(false);
  const [safeStreak, setSafeStreak] = useState(3);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [riderIdInput, setRiderIdInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async (id: string) => {
    setLoggingIn(true);
    setLoginError("");
    try {
      const response = await fetch(`http://localhost:8000/rider/${id}`);
      const data = await response.json();
      if (response.ok) {
        setRiderState(data);
        setPremiumBreakdown(null);
        setPremiumModalOpen(false);
        setCoverageModalOpen(false);
        setControlsModalOpen(false);
        setClaimActivity([]);
        setIsLoggedIn(true);
      } else {
        setLoginError("Rider not found. Try RIDER_8023 or RIDER_9042.");
      }
    } catch (error) {
      setLoginError("Failed to connect to backend.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setRiderIdInput("");
  };

  const [isSignup, setIsSignup] = useState(false);
  const [signupForm, setSignupForm] = useState({
    name: "",
    phone: "",
    vehicle_type: "2_WHEELER",
    primary_zone: "BLR_INDIRANAGAR"
  });
  const [signingUp, setSigningUp] = useState(false);

  const handleSignup = async () => {
    setSigningUp(true);
    setLoginError("");
    try {
      const response = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm)
      });
      const data = await response.json();
      if (response.ok) {
        setRiderState(data);
        setPremiumBreakdown(null);
        setPremiumModalOpen(false);
        setCoverageModalOpen(false);
        setControlsModalOpen(false);
        setClaimActivity([]);
        setIsLoggedIn(true);
      } else {
        setLoginError("Signup failed. Ensure all fields are filled.");
      }
    } catch (error) {
      setLoginError("Failed to connect to backend.");
    } finally {
      setSigningUp(false);
    }
  };



  const fetchAiInsights = async () => {
    setLoadingInsights(true);
    try {
      const response = await fetch(`http://localhost:8000/rider_ai_insights/${riderState.rider_id}`);
      const data = await response.json();
      if (response.ok) {
        setAiInsights(data);
      }
    } catch (error) {
      console.error("Failed to fetch AI insights", error);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchAiInsights();
  }, [riderState.rider_id]);

  const fetchClaimActivity = async () => {
    if (!riderState.rider_id) return;
    setLoadingClaimActivity(true);
    try {
      const response = await fetch(`http://localhost:8000/claim-attempts/${riderState.rider_id}`);
      const data = await response.json();
      if (response.ok) {
        setClaimActivity(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch claim activity", error);
    } finally {
      setLoadingClaimActivity(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && riderState.rider_id) {
      fetchClaimActivity();
    }
  }, [isLoggedIn, riderState.rider_id]);

  const [resigning, setResigning] = useState(false);

  const handleResign = async () => {
    if (!window.confirm("ARE YOU SURE? This will permanently delete your account and all claim activity. This action cannot be undone.")) return;
    
    setResigning(true);
    try {
      const response = await fetch(`http://localhost:8000/rider/${riderState.rider_id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        localStorage.removeItem("rider_dashboard_state");
        setIsLoggedIn(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Resignation failed", error);
    } finally {
      setResigning(false);
    }
  };

  const syncRiderData = async (updatedPerformance: any) => {

    try {
      await fetch(`http://localhost:8000/rider/${riderState.rider_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ daily_performance: updatedPerformance }),
      });
    } catch (error) {
      console.error("Failed to sync rider data", error);
    }
  };

  const handleAppeal = async () => {
    if (!modalData) return;
    setAppealLoading(true);
    try {
      const payload = {
        rider_id: riderState.rider_id,
        last_rejection_reason: modalData.reason,
        trust_score: aiInsights?.trust_score || 85.0
      };
      const response = await fetch("http://localhost:8000/appeal_claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      
      if (data.is_overturned) {
        const updatedPerformance = {
          ...riderState.daily_performance,
          earnings_today: riderState.daily_performance.earnings_today + data.payout_amount
        };
        // Update local state
        setRiderState(prev => ({
          ...prev,
          daily_performance: updatedPerformance
        }));
        // Sync to backend
        await syncRiderData(updatedPerformance);
      }


      setModalData({
        ...modalData,
        claim_status: data.is_overturned ? "APPROVED" : "REJECTED",
        reason: data.appeal_narrative,
        payout_amount: data.payout_amount,
        is_appeal: true
      });
      await fetchClaimActivity();
    } catch (error) {
       console.error("Appeal failed", error);
    } finally {
      setAppealLoading(false);
    }
  };

  const refreshQuote = async (showLoading: boolean = true) => {
    if (showLoading) {
      setQuoting(true);
    }
    try {
      const response = await fetch("http://localhost:8000/quote_premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rider_id: riderState.rider_id }),
      });
      const data = await response.json();
      if (response.ok) {
        setRiderState(prev => ({
          ...prev,
          insurance_profile: {
            ...prev.insurance_profile,
            weekly_premium_paid: data.weekly_premium_amount,
            risk_score: data.risk_score
          }
        }));
        setPremiumBreakdown({
          pricing_factors: data.pricing_factors,
          pricing_explanation: data.pricing_explanation
        });
      }
    } catch (error) {
      console.error("Quote failed", error);
    } finally {
      if (showLoading) {
        setQuoting(false);
      }
    }
  };

  useEffect(() => {
    if (isLoggedIn && riderState.rider_id && !premiumBreakdown) {
      refreshQuote(false);
    }
  }, [isLoggedIn, riderState.rider_id]);

  const resetDemo = async () => {
    localStorage.removeItem("rider_dashboard_state");
    
    // Reset Ravi/Aditi back to original hackathon values if they are the current user
    if (riderState.rider_id === "RIDER_8023" || riderState.rider_id === "RIDER_9042") {
      const originalEarnings = 650.00; 
      try {
        await fetch(`http://localhost:8000/rider/${riderState.rider_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            daily_performance: {
              ...riderState.daily_performance,
              earnings_today: originalEarnings
            }
          }),
        });
      } catch (e) {
        console.error("Reset sync failed", e);
      }
    }

    setRiderState(INITIAL_RIDER_STATE);
    setPremiumBreakdown(null);
    setPremiumModalOpen(false);
    setCoverageModalOpen(false);
    setControlsModalOpen(false);
    setClaimActivity([]);
    setIsLoggedIn(false);
    window.location.reload();
  };


  const triggerClaim = async (disruption: any, spoofGPS: boolean = false) => {
    setLoading(true);
    setModalData(null);
    const mockRiderState = { ...riderState };
    if (spoofGPS) {
      mockRiderState.fraud_telemetry.is_mock_location_enabled = true;
    }
    const payload = {
      rider_id: mockRiderState.rider_id,
      disruption,
    };

    try {
      const response = await fetch("http://localhost:8000/evaluate_claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setModalData(data);
      
      // Update earnings dynamically if claim is approved
      if (data.claim_status === "APPROVED" && data.payout_amount) {
        const updatedPerformance = {
          ...mockRiderState.daily_performance,
          earnings_today: mockRiderState.daily_performance.earnings_today + data.payout_amount
        };
        mockRiderState.daily_performance = updatedPerformance;
        // Sync to backend
        await syncRiderData(updatedPerformance);
      }

    } catch (error) {
      setModalData({ claim_status: "ERROR", reason: "Connection failed to backend API", payout_amount: 0 });
    } finally {
      if (spoofGPS) {
        mockRiderState.fraud_telemetry.is_mock_location_enabled = false;
      }
      setRiderState(mockRiderState);
      setLoading(false);
      fetchAiInsights();
      fetchClaimActivity();
    }
  };

  const formatClaimStatus = (status: string, reason?: string) => {
    if (status === "FRAUD_FLAGGED" || reason?.toLowerCase().includes("fraud")) return "FRAUD FLAGGED";
    if (status === "MANUAL_REVIEW") return "MANUAL REVIEW";
    return status;
  };

  const getClaimStatusStyles = (status: string, reason?: string) => {
    const displayStatus = formatClaimStatus(status, reason);
    if (displayStatus === "APPROVED") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (displayStatus === "MANUAL REVIEW") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  };

  const progressPercentage = Math.min(
    (riderState.daily_performance.orders_completed_today / riderState.daily_performance.daily_target) * 100,
    100
  );

  if (!isLoggedIn) {

    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Dynamic Background Gradients */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-emerald-600/10 blur-[130px] rounded-full mix-blend-screen" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-700/50 rounded-[2.5rem] p-10 shadow-2xl">
            <header className="text-center mb-10">
              <div className="inline-flex p-4 rounded-3xl bg-indigo-500/10 text-indigo-400 mb-6 ring-1 ring-indigo-500/20">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white mb-2">ShiftGuard</h1>
              <p className="text-slate-500 text-sm font-medium italic">
                {isSignup ? "AI protection for food delivery partners" : "AI protection for food delivery partners using Bengaluru demo data"}
              </p>
            </header>

            {!isSignup ? (
              <div className="space-y-6">
                <div>
                  <input
                    type="text"
                    placeholder="RIDER_XXXX"
                    value={riderIdInput}
                    onChange={(e) => setRiderIdInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin(riderIdInput)}
                    className="w-full bg-slate-950/80 border border-slate-700/50 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-700 font-bold tracking-widest text-center"
                  />
                  {loginError && <p className="text-rose-400 text-[10px] font-bold mt-2 px-2 uppercase tracking-widest text-center">{loginError}</p>}
                </div>

                <button
                  onClick={() => handleLogin(riderIdInput)}
                  disabled={loggingIn || !riderIdInput}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {loggingIn ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Authorize Access"}
                </button>

                <div className="pt-6 mt-6 border-t border-slate-800 flex flex-col gap-3">
                  <p className="text-[10px] font-bold text-slate-600 text-center uppercase tracking-widest">Demo Quick Select</p>
                  <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => handleLogin('RIDER_8023')} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/50 transition-all text-left group">
                        <span className="block text-[8px] font-bold text-slate-500 group-hover:text-indigo-400 uppercase mb-0.5 tracking-tighter">Indiranagar</span>
                        <span className="block text-xs font-bold text-slate-300">Ravi Kumar</span>
                      </button>
                      <button onClick={() => handleLogin('RIDER_9042')} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/50 transition-all text-left group">
                        <span className="block text-[8px] font-bold text-slate-500 group-hover:text-indigo-400 uppercase mb-0.5 tracking-tighter">Koramangala</span>
                        <span className="block text-xs font-bold text-slate-300">Aditi Sharma</span>
                      </button>
                  </div>
                  <button 
                    onClick={() => setIsSignup(true)}
                    className="mt-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] hover:text-indigo-300 transition-colors"
                  >
                    Don't have an ID? Join Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                    className="w-full bg-slate-950/80 border border-slate-700/50 rounded-2xl px-6 py-3.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-700 font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm({...signupForm, phone: e.target.value})}
                    className="w-full bg-slate-950/80 border border-slate-700/50 rounded-2xl px-6 py-3.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-700 font-bold"
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={signupForm.vehicle_type}
                      onChange={(e) => setSignupForm({...signupForm, vehicle_type: e.target.value})}
                      className="bg-slate-950/80 border border-slate-700/50 rounded-2xl px-4 py-3.5 text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    >
                      <option value="2_WHEELER">2 Wheeler</option>
                      <option value="3_WHEELER">3 Wheeler</option>
                    </select>
                    <select
                      value={signupForm.primary_zone}
                      onChange={(e) => setSignupForm({...signupForm, primary_zone: e.target.value})}
                      className="bg-slate-950/80 border border-slate-700/50 rounded-2xl px-4 py-3.5 text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    >
                      <option value="BLR_INDIRANAGAR">Indiranagar</option>
                      <option value="BLR_KORAMANGALA">Koramangala</option>
                      <option value="BLR_WHITEFIELD">Whitefield</option>
                      <option value="BLR_HSR">HSR Layout</option>
                      <option value="BLR_JAYANAGAR">Jayanagar</option>
                      <option value="BLR_JPNAGAR">JP Nagar</option>
                      <option value="BLR_MALLESHWARAM">Malleshwaram</option>
                      <option value="BLR_MARATHAHALLI">Marathahalli</option>
                      <option value="BLR_ECITY">Electronic City</option>
                      <option value="BLR_BELLANDUR">Bellandur</option>
                      <option value="BLR_SARJAPUR">Sarjapur Road</option>
                      <option value="BLR_HEBBAL">Hebbal</option>
                    </select>


                  </div>
                  {loginError && <p className="text-rose-400 text-[10px] font-bold mt-2 px-2 uppercase tracking-widest text-center">{loginError}</p>}
                </div>

                <button
                  onClick={handleSignup}
                  disabled={signingUp || !signupForm.name || !signupForm.phone}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {signingUp ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Complete Registration"}
                </button>

                <button 
                  onClick={() => setIsSignup(false)}
                  className="w-full text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-slate-400 transition-colors pt-2"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
          <div className="text-center mt-8">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Parametric Intelligence • Demo Build</p>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden pb-12">
      {/* Dynamic Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-emerald-600/10 blur-[130px] rounded-full mix-blend-screen" />
      </div>

      <DashboardShell
        header={
          <header className="section-enter flex flex-col gap-6">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    LIVE / {riderState.real_time_state.status}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-rose-400 transition-colors flex items-center gap-1.5"
                  >
                    Switch Rider
                  </button>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
                  Rider Hub
                </h1>
                <p className="text-slate-400 mt-2 flex flex-wrap items-center gap-2 text-sm tracking-wide">
                  <span className="font-semibold text-slate-200">{riderState.profile.name}</span>
                  <span className="w-1 h-1 bg-slate-600 rounded-full" />
                  <span>{riderState.profile.vehicle_type}</span>
                  <span className="w-1 h-1 bg-slate-600 rounded-full" />
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5" /> {riderState.profile.primary_zone}
                  </span>
                </p>
              </div>

              <DashboardTabs activeTab={activeTab} onChange={setActiveTab} />
            </div>
          </header>
        }
      >
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_400px] gap-8 items-start">
          <div className="space-y-6">
            {activeTab === "hub" ? (
              <>
                <SummaryCards
                  earningsToday={riderState.daily_performance.earnings_today}
                  incentiveAtRisk={riderState.daily_performance.incentive_at_risk}
                />

                {riderState.insurance_profile.policy_active && (
                  <div className="section-enter" style={{ animationDelay: "40ms" }}>
                    <CoverageCard
                      premium={riderState.insurance_profile.weekly_premium_paid}
                      quoting={quoting}
                      breakdownReady={Boolean(premiumBreakdown)}
                      onRefreshQuote={() => refreshQuote()}
                      onOpenBreakdown={() => setPremiumModalOpen(true)}
                      onOpenCoverage={() => setCoverageModalOpen(true)}
                      onOpenControls={() => setControlsModalOpen(true)}
                    />
                  </div>
                )}

                <div className="glass-panel p-6 md:p-8 section-enter" style={{ animationDelay: "60ms" }}>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" /> Target Progress
                    </h2>
                    <span className="text-sm font-bold text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/50">
                      <span className="text-slate-200">{riderState.daily_performance.orders_completed_today}</span> / {riderState.daily_performance.daily_target}
                    </span>
                  </div>
                  <div className="w-full bg-slate-950/80 rounded-full h-3.5 ring-1 ring-inset ring-slate-800/80 overflow-hidden shadow-inner relative">
                    <div
                      className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-indigo-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                      style={{ width: `${progressPercentage}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/30 skew-x-12 translate-x-4 mix-blend-overlay" />
                    </div>
                  </div>
                </div>

                <InsightsPanel aiInsights={aiInsights} loadingInsights={loadingInsights} safeStreak={safeStreak} />

                <ClaimActivityPanel
                  claimActivity={claimActivity}
                  loadingClaimActivity={loadingClaimActivity}
                  onRefresh={fetchClaimActivity}
                  formatClaimStatus={formatClaimStatus}
                  getClaimStatusStyles={getClaimStatusStyles}
                />
              </>
            ) : (
              <CityPulsePanel zones={CITY_ZONES} />
            )}

            <div className={`transition-all duration-500 ease-out origin-top ${premiumModalOpen && premiumBreakdown ? "scale-100 opacity-100 h-auto mt-6" : "scale-95 opacity-0 h-0 overflow-hidden mt-0"}`}>
              {premiumModalOpen && premiumBreakdown && (
                <div className="p-6 rounded-3xl backdrop-blur-2xl bg-slate-950/40 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.12)] relative overflow-hidden">
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-32 h-32 blur-[60px] rounded-full bg-indigo-500/10 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-extrabold tracking-tight text-indigo-300">Premium Breakdown</h3>
                        <p className="text-sm mt-1.5 text-slate-400 leading-relaxed font-medium">
                          Your weekly quote is recalculated from simulated live zone conditions and rider-specific factors.
                        </p>
                      </div>
                      <button
                        onClick={() => setPremiumModalOpen(false)}
                        className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-bold uppercase tracking-widest border border-white/10"
                      >
                        Close
                      </button>
                    </div>

                    <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <div className="rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-3">
                        <div className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Zone</div>
                        <div className="text-slate-200 font-semibold mt-1">{premiumBreakdown.pricing_factors.zone}</div>
                      </div>
                      <div className="rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-3">
                        <div className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Risk Score</div>
                        <div className="text-slate-200 font-semibold mt-1">{riderState.insurance_profile.risk_score}</div>
                      </div>
                      <div className="rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-3">
                        <div className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Weekly Premium</div>
                        <div className="text-slate-200 font-semibold mt-1">INR {riderState.insurance_profile.weekly_premium_paid}</div>
                      </div>
                      <div className="rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-3">
                        <div className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Rainfall</div>
                        <div className="text-slate-200 font-semibold mt-1">{premiumBreakdown.pricing_factors.rainfall_mm} mm</div>
                      </div>
                      <div className="rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-3">
                        <div className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">AQI</div>
                        <div className="text-slate-200 font-semibold mt-1">{premiumBreakdown.pricing_factors.aqi}</div>
                      </div>
                      <div className="rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-3">
                        <div className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Strike Index</div>
                        <div className="text-slate-200 font-semibold mt-1">{premiumBreakdown.pricing_factors.strike_intensity}</div>
                      </div>
                      <div className="rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-3">
                        <div className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Experience</div>
                        <div className="text-slate-200 font-semibold mt-1">{premiumBreakdown.pricing_factors.rider_experience_months} mo</div>
                      </div>
                      <div className="rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-3">
                        <div className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Seasonal Risk</div>
                        <div className="text-slate-200 font-semibold mt-1">{premiumBreakdown.pricing_factors.seasonal_risk_index}</div>
                      </div>
                      <div className="rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-3">
                        <div className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Updated</div>
                        <div className="text-slate-200 font-semibold mt-1">{new Date(premiumBreakdown.pricing_factors.updated_at).toLocaleTimeString()}</div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl bg-white/5 border border-white/5 p-4">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Why the price looks like this</h4>
                      <div className="space-y-2">
                        {premiumBreakdown.pricing_explanation.map((reason: string, index: number) => (
                          <p key={index} className="text-sm text-slate-300 leading-relaxed">
                            {reason}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`transition-all duration-500 ease-out origin-top ${modalData ? "scale-100 opacity-100 h-auto mt-6" : "scale-95 opacity-0 h-0 overflow-hidden mt-0"}`}>
              {modalData && (
                <div className={`p-6 rounded-3xl backdrop-blur-2xl flex flex-col md:flex-row gap-5 items-start md:items-center relative overflow-hidden ${
                  modalData.claim_status === "APPROVED"
                    ? "bg-emerald-950/30 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                    : modalData.claim_status === "REJECTED" || modalData.claim_status === "FRAUD_FLAGGED" || modalData.claim_status === "DENIED" || modalData.claim_status === "ERROR"
                    ? "bg-rose-950/30 border border-rose-500/30 shadow-[0_0_30px_rgba(225,29,72,0.1)]"
                    : "bg-amber-950/30 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]"
                }`}>
                  <div className={`absolute top-1/2 left-0 -translate-y-1/2 w-32 h-32 blur-[60px] rounded-full pointer-events-none ${
                    modalData.claim_status === "APPROVED"
                      ? "bg-emerald-500/20"
                      : modalData.claim_status === "REJECTED" || modalData.claim_status === "FRAUD_FLAGGED" || modalData.claim_status === "DENIED" || modalData.claim_status === "ERROR"
                      ? "bg-rose-500/20"
                      : "bg-amber-500/20"
                  }`} />

                  <div className={`p-4 rounded-2xl flex-shrink-0 z-10 ${
                    modalData.claim_status === "APPROVED"
                      ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                      : modalData.claim_status === "REJECTED" || modalData.claim_status === "FRAUD_FLAGGED" || modalData.claim_status === "DENIED" || modalData.claim_status === "ERROR"
                      ? "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30"
                      : "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30"
                  }`}>
                    {modalData.claim_status === "APPROVED" ? <CheckCircle className="w-8 h-8 flex-shrink-0 drop-shadow-md" /> : <AlertTriangle className="w-8 h-8 flex-shrink-0 drop-shadow-md" />}
                  </div>

                  <div className="flex-1 w-full z-10">
                    <h3 className={`text-xl font-extrabold tracking-tight ${
                      modalData.claim_status === "APPROVED"
                        ? "text-emerald-400"
                        : modalData.claim_status === "REJECTED" || modalData.claim_status === "FRAUD_FLAGGED" || modalData.claim_status === "DENIED" || modalData.claim_status === "ERROR"
                        ? "text-rose-400"
                        : "text-amber-400"
                    }`}>
                      {modalData.claim_status}
                    </h3>
                    <p className="text-sm mt-1.5 text-slate-300 leading-relaxed font-medium">{modalData.reason}</p>

                    {(modalData.claim_status === "REJECTED" || modalData.claim_status === "FRAUD_FLAGGED" || modalData.claim_status === "DENIED") && !modalData.is_appeal && (
                      <button
                        onClick={handleAppeal}
                        disabled={appealLoading}
                        className="mt-3 flex items-center gap-2 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors border border-indigo-500/20 uppercase tracking-widest shadow-sm shadow-indigo-500/20"
                      >
                        {appealLoading ? <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
                        {appealLoading ? "Advocate Reviewing..." : "Appeal with Aegis Advocate AI"}
                      </button>
                    )}
                  </div>

                  {modalData.payout_amount !== undefined && modalData.payout_amount > 0 && (
                    <div className="mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-700/50 md:pl-6 w-full md:w-auto flex flex-row md:flex-col items-center md:items-start justify-between z-10">
                      <span className="text-xs font-bold text-emerald-400/70 uppercase tracking-widest mb-1">Payout</span>
                      <span className="text-3xl font-black text-emerald-400 flex items-center drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]">
                        <IndianRupee className="w-6 h-6 mr-1" />{modalData.payout_amount}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <SimulationActions
              riderState={riderState}
              loading={loading}
              onTriggerClaim={triggerClaim}
              onResetDemo={resetDemo}
            />

            <div className="glass-panel p-6 section-enter">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.22em] text-rose-400 mb-1">Danger Zone</h3>
                  <p className="text-sm text-slate-400">Resign from the demo and permanently remove your rider profile.</p>
                </div>
              </div>
              <button
                onClick={handleResign}
                disabled={resigning}
                className="pressable w-full rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
              >
                {resigning ? "Processing..." : "Delete Rider Account"}
              </button>
            </div>
          </div>
        </div>

        <OverlayInfoModal
          open={coverageModalOpen}
          onClose={() => setCoverageModalOpen(false)}
          title="Coverage Info"
          description="This prototype covers income disruption only and is not a health, life, or motor insurance product."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-4">
              <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3">Covered</h4>
              <div className="space-y-2">
                {[
                  "Loss of income from extreme weather disruptions",
                  "Loss of income from severe pollution disruptions",
                  "Loss of income from local strike disruptions",
                  "Weekly parametric protection for eligible external events",
                ].map((item) => (
                  <p key={item} className="text-sm text-slate-300 leading-relaxed">
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-rose-500/5 border border-rose-500/20 p-4">
              <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-3">Not Covered</h4>
              <div className="space-y-2">
                {[
                  "Health expenses or hospitalization",
                  "Life insurance events",
                  "Personal accidents or injury claims",
                  "Vehicle damage, servicing, or repair costs",
                  "Any non-income-loss claims",
                ].map((item) => (
                  <p key={item} className="text-sm text-slate-300 leading-relaxed">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </OverlayInfoModal>

        <OverlayInfoModal
          open={controlsModalOpen}
          onClose={() => setControlsModalOpen(false)}
          title="Fraud & Abuse Controls"
          description="This protection flow is designed to stay explainable, abuse-aware, and financially disciplined instead of blindly auto-paying every disruption event."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-cyan-500/5 border border-cyan-500/20 p-4">
              <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-3">Fraud & Abuse Controls</h4>
              <div className="space-y-2">
                {[
                  "Mock-location detection blocks GPS spoofing attempts.",
                  "Speed anomaly detection checks whether the rider was still moving during a disruption claim.",
                  "One official claim per disruption type per week prevents duplicate weekly payouts.",
                  "Every claim evaluation attempt is stored in the activity ledger for auditability.",
                  "Very high-risk events are routed to manual review instead of auto-approval.",
                ].map((item) => (
                  <p key={item} className="text-sm text-slate-300 leading-relaxed">
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-indigo-500/5 border border-indigo-500/20 p-4">
              <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Why This Helps Financial Viability</h4>
              <div className="space-y-2">
                {[
                  "Weekly premiums are bounded instead of being open-ended.",
                  "Pricing adjusts to hyper-local disruption risk, so safer operating conditions pay less.",
                  "Payouts are tied to incentive at risk rather than unlimited income replacement.",
                  "Duplicate official claims are blocked before they can inflate payouts.",
                  "Fraud screening and manual review reduce payout leakage over time.",
                ].map((item) => (
                  <p key={item} className="text-sm text-slate-300 leading-relaxed">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </OverlayInfoModal>
      </DashboardShell>
    </div>
  );
}
