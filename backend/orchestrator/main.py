from __future__ import annotations

from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import load_settings
from .graph import build_claim_graph
from .logging_config import get_logger
from .pricing import build_dynamic_quote
from .repository import SupabaseRepository
from .schemas import ClaimAttemptItem, ClaimDecision, ClaimHistoryItem, ClaimRequest, PremiumQuoteRequest, PremiumQuoteResponse, AIInsightResponse, AppealRequest, AppealResponse, RiderProfileResponse, SignupRequest, RiderUpdateRequest
from .state import ClaimState
from .utils import normalize_disruption_type
from .nodes import generate_rider_insight, generate_claim_appeal_advocacy
import uuid


app = FastAPI(
    title="ShiftGuard - AI Parametric Insurance Orchestrator",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_compiled_graph = None
logger = get_logger("orchestrator.main")


@app.on_event("startup")
def startup_event() -> None:
    global _compiled_graph
    settings = load_settings()
    repository = SupabaseRepository(settings=settings)
    _compiled_graph = build_claim_graph(repository=repository, settings=settings)
    logger.info("orchestrator startup complete")


def _build_initial_state(payload: ClaimRequest) -> ClaimState:
    normalized_type = normalize_disruption_type(payload.disruption.type)
    trace_id = f"TRACE_{uuid.uuid4().hex[:8].upper()}"
    disruption_dict: dict[str, Any] = {
        "type": payload.disruption.type,
        "intensity_value": float(payload.disruption.intensity_value),
        "zone": payload.disruption.zone,
        "normalized_type": normalized_type,
    }

    initial_decision: dict[str, Any] = {}
    if normalized_type is None:
        initial_decision = {
            "claim_status": "DENIED",
            "payout_amount": 0.0,
            "reason": "Unsupported disruption type",
        }

    return ClaimState(
        trace_id=trace_id,
        rider_id=payload.rider_id,
        disruption=disruption_dict,
        rider_db_data={},
        is_parametric_valid=False,
        is_fraud=False,
        hgbr_event_risk=0.0,
        attempt_logged=False,
        final_decision=initial_decision,
    )


@app.post("/evaluate_claim", response_model=ClaimDecision)
def evaluate_claim(payload: ClaimRequest) -> ClaimDecision:
    if _compiled_graph is None:
        raise HTTPException(status_code=500, detail="Orchestrator graph is not initialized.")

    initial_state = _build_initial_state(payload)
    logger.info(
        "[%s] claim request received rider_id=%s disruption_type=%s zone=%s intensity=%.2f",
        initial_state["trace_id"],
        payload.rider_id,
        initial_state["disruption"].get("normalized_type") or payload.disruption.type,
        payload.disruption.zone,
        float(payload.disruption.intensity_value),
    )
    final_state = _compiled_graph.invoke(initial_state)
    final_decision = final_state.get("final_decision", {})

    if not final_decision:
        raise HTTPException(status_code=500, detail="Claim evaluation did not produce a final decision.")
    logger.info(
        "[%s] claim completed rider_id=%s status=%s payout=%.2f reason=%s",
        final_state["trace_id"],
        payload.rider_id,
        final_decision.get("claim_status"),
        float(final_decision.get("payout_amount", 0.0)),
        final_decision.get("reason"),
    )
    return ClaimDecision(**final_decision)


@app.post("/quote_premium", response_model=PremiumQuoteResponse)
def quote_premium(payload: PremiumQuoteRequest) -> PremiumQuoteResponse:
    settings = load_settings()
    repository = SupabaseRepository(settings=settings)
    logger.info("premium quote requested rider_id=%s", payload.rider_id)
    
    rider = repository.fetch_rider_by_id(payload.rider_id)
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")

    response = PremiumQuoteResponse(**build_dynamic_quote(rider))
    logger.info(
        "premium quote generated rider_id=%s weekly_premium=%.2f risk_score=%.4f zone=%s rainfall=%.1f aqi=%.1f strike=%.1f",
        payload.rider_id,
        response.weekly_premium_amount,
        response.risk_score,
        response.pricing_factors["zone"],
        float(response.pricing_factors["rainfall_mm"]),
        float(response.pricing_factors["aqi"]),
        float(response.pricing_factors["strike_intensity"]),
    )
    return response

@app.get("/rider_ai_insights/{rider_id}", response_model=AIInsightResponse)
def get_rider_ai_insights(rider_id: str) -> AIInsightResponse:
    settings = load_settings()
    repository = SupabaseRepository(settings=settings)
    
    rider = repository.fetch_rider_by_id(rider_id)
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")
        
    recent_claims = repository.fetch_claims_by_rider(rider_id, limit=5)
    
    # Calculate simple stats for the response
    total_savings = sum(float(c.get("amount", 0.0)) for c in recent_claims if c.get("status") == "APPROVED")
    
    # Trust Score calculation based on claim approval vs fraud flagging
    frauds = len([c for c in recent_claims if c.get("status") == "REJECTED" and "Fraud" in str(c.get("decision_reason", ""))])
    trust_score = 100.0 if not recent_claims else max(0.0, 100.0 - (frauds * 25))
    
    recommendation = generate_rider_insight(rider, recent_claims)
    
    return AIInsightResponse(
        trust_score=trust_score,
        projected_savings_last_30d=total_savings,
        recommendation=recommendation
    )

@app.get("/claims/{rider_id}", response_model=list[ClaimHistoryItem])
def get_claim_history(rider_id: str) -> list[ClaimHistoryItem]:
    settings = load_settings()
    repository = SupabaseRepository(settings=settings)
    logger.info("claim history requested rider_id=%s", rider_id)

    rider = repository.fetch_rider_by_id(rider_id)
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")

    claims = repository.fetch_claims_by_rider(rider_id, limit=10)
    return [ClaimHistoryItem(**claim) for claim in claims]

@app.get("/claim-attempts/{rider_id}", response_model=list[ClaimAttemptItem])
def get_claim_attempts(rider_id: str) -> list[ClaimAttemptItem]:
    settings = load_settings()
    repository = SupabaseRepository(settings=settings)
    logger.info("claim attempts requested rider_id=%s", rider_id)

    rider = repository.fetch_rider_by_id(rider_id)
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")

    attempts = repository.fetch_claim_attempts_by_rider(rider_id, limit=20)
    return [ClaimAttemptItem(**attempt) for attempt in attempts]

@app.post("/appeal_claim", response_model=AppealResponse)
def appeal_claim(payload: AppealRequest) -> AppealResponse:
    settings = load_settings()
    repository = SupabaseRepository(settings=settings)
    logger.info("appeal requested rider_id=%s reason=%s", payload.rider_id, payload.last_rejection_reason)
    
    # Run the Advocate Agent logic
    result = generate_claim_appeal_advocacy(
        rider_id=payload.rider_id,
        last_rejection_reason=payload.last_rejection_reason,
        trust_score=payload.trust_score
    )
    
    # Determine restored payout if overturned
    payout = 0.0
    if result["is_overturned"]:
        rider = repository.fetch_rider_by_id(payload.rider_id)
        if rider:
            payout = float(rider.get("daily_performance", {}).get("incentive_at_risk", 0.0))
        else:
            payout = 250.0 # Default fallback
            
    response = AppealResponse(
        is_overturned=result["is_overturned"],
        new_status=result["new_status"],
        payout_amount=payout,
        appeal_narrative=result["appeal_narrative"]
    )
    logger.info(
        "appeal completed rider_id=%s overturned=%s new_status=%s payout=%.2f",
        payload.rider_id,
        response.is_overturned,
        response.new_status,
        response.payout_amount,
    )
    return response

@app.get("/rider/{rider_id}", response_model=RiderProfileResponse)
def get_rider_profile(rider_id: str) -> RiderProfileResponse:
    settings = load_settings()
    repository = SupabaseRepository(settings=settings)
    
    rider = repository.fetch_rider_by_id(rider_id)
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")
        
    return RiderProfileResponse(**rider)

@app.post("/signup", response_model=RiderProfileResponse)
def signup_rider(payload: SignupRequest) -> RiderProfileResponse:
    settings = load_settings()
    repository = SupabaseRepository(settings=settings)
    
    # Generate a unique Rider ID
    rider_id = f"RIDER_{str(uuid.uuid4())[:4].upper()}"
    
    # Initialize with hackathon defaults
    rider_data = {
        "rider_id": rider_id,
        "profile": {
            "name": payload.name,
            "phone": payload.phone,
            "vehicle_type": payload.vehicle_type,
            "primary_zone": payload.primary_zone
        },
        "real_time_state": {
            "status": "ONLINE",
            "current_location": {"lat": 12.9716, "lon": 77.5946}, # Bangalore Center
            "last_ping_timestamp": "2026-04-04T10:00:00Z"
        },
        "daily_performance": {
            "orders_completed_today": 0,
            "daily_target": 15,
            "incentive_at_risk": 200.00,
            "earnings_today": 0.00
        },
        "insurance_profile": {
            "policy_active": True,
            "weekly_premium_paid": 25.00,
            "risk_score": 0.85
        },
        "fraud_telemetry": {
            "current_speed_kmph": 0.0,
            "is_mock_location_enabled": False,
            "battery_level": 100
        }
    }
    
    new_rider = repository.insert_rider(rider_data)
    if not new_rider:
        raise HTTPException(status_code=500, detail="Failed to create rider profile")
        
    return RiderProfileResponse(**new_rider)

@app.patch("/rider/{rider_id}", response_model=RiderProfileResponse)
def update_rider(rider_id: str, payload: RiderUpdateRequest) -> RiderProfileResponse:
    settings = load_settings()
    repository = SupabaseRepository(settings=settings)
    
    # Filter out None values to perform partial update
    update_data = {k: v for k, v in payload.dict().items() if v is not None}
    
    updated_rider = repository.update_rider(rider_id, update_data)
    if not updated_rider:
        raise HTTPException(status_code=404, detail="Rider not found or update failed")
        
    return RiderProfileResponse(**updated_rider)

@app.delete("/rider/{rider_id}")
def delete_rider(rider_id: str):
    settings = load_settings()
    repository = SupabaseRepository(settings=settings)
    
    success = repository.delete_rider(rider_id)
    if not success:
        raise HTTPException(status_code=404, detail="Rider not found or delete failed")
        
    return {"status": "success", "message": f"Rider {rider_id} has been deleted"}






