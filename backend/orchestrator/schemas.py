from __future__ import annotations

from typing import List, Optional, Literal

from pydantic import BaseModel, Field


class DisruptionPayload(BaseModel):
    type: str = Field(..., min_length=1)
    intensity_value: float = Field(..., ge=0.0)
    zone: str = Field(..., min_length=1)


class ClaimRequest(BaseModel):
    rider_id: str = Field(..., min_length=1)
    disruption: DisruptionPayload


class ClaimDecision(BaseModel):
    claim_status: Literal["APPROVED", "DENIED", "FRAUD_FLAGGED", "MANUAL_REVIEW"]
    payout_amount: float = Field(..., ge=0.0)
    reason: str


class PremiumQuoteRequest(BaseModel):
    rider_id: str = Field(..., min_length=1)


class PremiumQuoteResponse(BaseModel):
    weekly_premium_amount: float
    risk_score: float
    pricing_factors: dict
    pricing_explanation: List[str]

class AIInsightResponse(BaseModel):
    trust_score: float = Field(..., ge=0.0, le=100.0)
    projected_savings_last_30d: float = Field(..., ge=0.0)
    recommendation: str = Field(..., min_length=1)

class AppealRequest(BaseModel):
    rider_id: str
    last_rejection_reason: str
    trust_score: float

class AppealResponse(BaseModel):
    is_overturned: bool
    new_status: Literal["APPROVED", "REJECTED"]
    payout_amount: float
    appeal_narrative: str

class ClaimHistoryItem(BaseModel):
    claim_id: str
    rider_id: str
    disruption_type: str
    status: str
    amount: float
    decision_reason: str | None = None
    coverage_week_start: str
    created_at: str
    reviewed_at: str | None = None

class ClaimAttemptItem(BaseModel):
    attempt_id: str
    claim_id: str | None = None
    rider_id: str
    disruption_type: str | None = None
    attempt_status: Literal["APPROVED", "DENIED", "FRAUD_FLAGGED", "MANUAL_REVIEW"]
    payout_amount: float
    reason: str | None = None
    created_at: str

class RiderProfileResponse(BaseModel):
    rider_id: str
    profile: dict
    real_time_state: dict
    daily_performance: dict
    insurance_profile: dict
    fraud_telemetry: dict

class SignupRequest(BaseModel):
    name: str
    phone: str
    vehicle_type: str
    primary_zone: str

class RiderUpdateRequest(BaseModel):
    profile: Optional[dict] = None
    real_time_state: Optional[dict] = None
    daily_performance: Optional[dict] = None
    insurance_profile: Optional[dict] = None
    fraud_telemetry: Optional[dict] = None




