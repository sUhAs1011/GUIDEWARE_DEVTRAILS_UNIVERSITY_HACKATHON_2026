from __future__ import annotations

from typing import Any, Callable
from uuid import uuid4

import json
import numpy as np

from pydantic import BaseModel, Field
from langchain_core.prompts import PromptTemplate
from langchain_ollama import ChatOllama
from langchain_core.output_parsers import JsonOutputParser

from ml.risk_model import predict_hgbr_risk

class FraudDecision(BaseModel):
    is_fraud: bool = Field(description="True if fraudulent, False otherwise")
    reason: str = Field(description="Explanation for the decision")

from .config import OrchestratorSettings
from .logging_config import get_logger
from .repository import SupabaseRepository
from .state import ClaimState
from .utils import (
    build_hgbr_feature_vector,
    current_utc_iso,
    disruption_threshold_met,
    map_api_claim_status_to_db_status,
    monday_week_start_iso,
)

logger = get_logger("orchestrator.nodes")


def _trace_prefix(state: ClaimState) -> str:
    return f"[{state.get('trace_id', 'NO_TRACE')}]"


def evaluate_parametric_rules(
    rider: dict[str, Any],
    disruption: dict[str, Any],
    settings: OrchestratorSettings,
) -> bool:
    profile = rider.get("profile", {})
    rider_zone = profile.get("primary_zone")
    rider_status = rider.get("real_time_state", {}).get("status", "")

    disruption_zone = disruption.get("zone")
    disruption_type = disruption.get("normalized_type", "")
    intensity_value = float(disruption.get("intensity_value", 0.0))

    return bool(
        disruption_threshold_met(disruption_type, intensity_value, settings)
        and (disruption_zone == rider_zone)
        and (rider_status == "ONLINE")
    )


def check_fraud_telemetry(rider_fraud_data: dict[str, Any], settings: OrchestratorSettings) -> bool:
    if bool(rider_fraud_data.get("is_mock_location_enabled", False)):
        return True
    speed = float(rider_fraud_data.get("current_speed_kmph", 0.0))
    return speed > settings.fraud_speed_threshold_kmph


def _build_decision(
    claim_status: str,
    payout_amount: float,
    reason: str,
) -> dict[str, Any]:
    return {
        "claim_status": claim_status,
        "payout_amount": round(float(max(payout_amount, 0.0)), 2),
        "reason": reason,
    }


def _build_attempt_row(
    state: ClaimState,
    decision: dict[str, Any],
    claim_id: str | None = None,
) -> dict[str, Any]:
    disruption = state.get("disruption", {})
    return {
        "attempt_id": f"ATT_{uuid4().hex[:12].upper()}",
        "claim_id": claim_id,
        "rider_id": state["rider_id"],
        "disruption_type": disruption.get("normalized_type"),
        "attempt_status": decision["claim_status"],
        "payout_amount": round(float(decision.get("payout_amount", 0.0)), 2),
        "reason": decision.get("reason"),
        "evidence_snapshot": {
            "disruption": disruption,
            "is_parametric_valid": state.get("is_parametric_valid", False),
            "is_fraud": state.get("is_fraud", False),
            "hgbr_event_risk": round(float(state.get("hgbr_event_risk", 0.0)), 6),
        },
    }


def make_fetch_db_context_node(
    repository: SupabaseRepository,
) -> Callable[[ClaimState], ClaimState]:
    def fetch_db_context(state: ClaimState) -> ClaimState:
        if state.get("final_decision"):
            logger.info("%s fetch_db_context skipped precomputed_decision=true", _trace_prefix(state))
            return state

        logger.info("%s fetch_db_context start rider_id=%s", _trace_prefix(state), state["rider_id"])
        rider = repository.fetch_rider_by_id(state["rider_id"])
        if rider is None:
            state["final_decision"] = _build_decision(
                claim_status="DENIED",
                payout_amount=0.0,
                reason="Rider not found",
            )
            logger.warning("%s rider lookup failed rider_id=%s", _trace_prefix(state), state["rider_id"])
            return state

        policy_active = bool(rider.get("insurance_profile", {}).get("policy_active", False))
        if not policy_active:
            state["rider_db_data"] = rider
            state["final_decision"] = _build_decision(
                claim_status="DENIED",
                payout_amount=0.0,
                reason="Policy inactive",
            )
            logger.warning("%s rider policy inactive rider_id=%s", _trace_prefix(state), state["rider_id"])
            return state

        state["rider_db_data"] = rider
        logger.info("%s fetch_db_context success rider_id=%s", _trace_prefix(state), state["rider_id"])
        return state

    return fetch_db_context


def make_evaluate_parametric_node(
    settings: OrchestratorSettings,
) -> Callable[[ClaimState], ClaimState]:
    def evaluate_parametric(state: ClaimState) -> ClaimState:
        if state.get("final_decision"):
            logger.info("%s evaluate_parametric skipped precomputed_decision=true", _trace_prefix(state))
            return state

        rider = state.get("rider_db_data", {})
        disruption = state.get("disruption", {})
        state["is_parametric_valid"] = evaluate_parametric_rules(
            rider=rider,
            disruption=disruption,
            settings=settings,
        )
        if state["is_parametric_valid"]:
            logger.info(
                "%s parametric passed rider_id=%s disruption_type=%s zone=%s intensity=%.2f",
                _trace_prefix(state),
                state["rider_id"],
                disruption.get("normalized_type"),
                disruption.get("zone"),
                float(disruption.get("intensity_value", 0.0)),
            )
        else:
            logger.warning(
                "%s parametric failed rider_id=%s disruption_type=%s zone=%s intensity=%.2f",
                _trace_prefix(state),
                state["rider_id"],
                disruption.get("normalized_type"),
                disruption.get("zone"),
                float(disruption.get("intensity_value", 0.0)),
            )
        return state

    return evaluate_parametric


def make_fraud_check_node(
    settings: OrchestratorSettings,
) -> Callable[[ClaimState], ClaimState]:
    def fraud_check_llm(state: ClaimState) -> ClaimState:
        if state.get("final_decision"):
            logger.info("%s fraud_check skipped precomputed_decision=true", _trace_prefix(state))
            return state

        try:
            logger.info("%s fraud_check llm start rider_id=%s", _trace_prefix(state), state["rider_id"])
            llm = ChatOllama(model="llama3", temperature=0, format="json")
            parser = JsonOutputParser(pydantic_object=FraudDecision)
            
            prompt_template = """You are a Fraud Detection Agent for a parametric insurance platform.
Analyze the provided telemetry and disruption state data.

CRITICAL RULES:
1. If 'is_mock_location_enabled' is true, you MUST flag it as fraud.
2. If 'current_speed_kmph' > 15.0 during a severe weather claim, you MUST flag it as fraud.

{format_instructions}
You MUST return ONLY valid JSON.

State Data:
{state_data}"""

            prompt = PromptTemplate(
                template=prompt_template,
                input_variables=["state_data"],
                partial_variables={"format_instructions": parser.get_format_instructions()}
            )
            
            chain = prompt | llm | parser
            decision = chain.invoke({"state_data": json.dumps(state)})
            state["is_fraud"] = decision.get("is_fraud", False)
            logger.info(
                "%s fraud_check llm complete rider_id=%s is_fraud=%s",
                _trace_prefix(state),
                state["rider_id"],
                state["is_fraud"],
            )
        except Exception as exc:
            # Fallback to deterministic check if local Ollama model fails
            logger.warning(
                "%s fraud_check llm fallback rider_id=%s error=%s",
                _trace_prefix(state),
                state["rider_id"],
                exc,
            )
            fraud_telemetry = state.get("rider_db_data", {}).get("fraud_telemetry", {})
            state["is_fraud"] = check_fraud_telemetry(fraud_telemetry, settings=settings)
            logger.info(
                "%s fraud_check fallback complete rider_id=%s is_fraud=%s",
                _trace_prefix(state),
                state["rider_id"],
                state["is_fraud"],
            )

        return state

    return fraud_check_llm


def make_risk_evaluator_node() -> Callable[[ClaimState], ClaimState]:
    def risk_evaluator(state: ClaimState) -> ClaimState:
        if state.get("final_decision"):
            logger.info("%s risk_evaluator skipped precomputed_decision=true", _trace_prefix(state))
            return state

        rider = state.get("rider_db_data", {})
        disruption = state.get("disruption", {})
        if not rider:
            state["hgbr_event_risk"] = 0.0
            logger.warning("%s risk_evaluator no_rider_context rider_id=%s", _trace_prefix(state), state["rider_id"])
            return state

        features = build_hgbr_feature_vector(rider_db_data=rider, disruption=disruption)
        risk_scores = predict_hgbr_risk(np.asarray([features], dtype=float))
        state["hgbr_event_risk"] = float(risk_scores[0])
        logger.info(
            "%s risk evaluated rider_id=%s hgbr_event_risk=%.4f",
            _trace_prefix(state),
            state["rider_id"],
            state["hgbr_event_risk"],
        )
        return state

    return risk_evaluator


def make_execute_decision_node(
    repository: SupabaseRepository,
    settings: OrchestratorSettings,
) -> Callable[[ClaimState], ClaimState]:
    def execute_decision(state: ClaimState) -> ClaimState:
        if state.get("final_decision"):
            if not state.get("attempt_logged", False):
                attempt_row = _build_attempt_row(state, state["final_decision"])
                try:
                    repository.insert_claim_attempt(attempt_row)
                    state["attempt_logged"] = True
                    logger.info(
                        "%s claim attempt persisted rider_id=%s attempt_id=%s status=%s",
                        _trace_prefix(state),
                        state["rider_id"],
                        attempt_row["attempt_id"],
                        attempt_row["attempt_status"],
                    )
                except Exception as exc:
                    logger.error(
                        "%s claim attempt persistence failed rider_id=%s error=%s",
                        _trace_prefix(state),
                        state["rider_id"],
                        exc,
                    )
            logger.info("%s execute_decision skipped precomputed_decision=true", _trace_prefix(state))
            return state

        rider = state.get("rider_db_data", {})
        disruption = state.get("disruption", {})

        incentive_at_risk = float(
            rider.get("daily_performance", {}).get("incentive_at_risk", 0.0)
        )
        payout_amount = 0.0

        if not state.get("is_parametric_valid", False):
            decision = _build_decision("DENIED", payout_amount, "Parametric criteria not met")
        elif state.get("is_fraud", False):
            decision = _build_decision("FRAUD_FLAGGED", payout_amount, "Fraud Flagged")
        elif float(state.get("hgbr_event_risk", 0.0)) > settings.manual_review_risk_threshold:
            decision = _build_decision("MANUAL_REVIEW", payout_amount, "Manual Review")
        else:
            payout_amount = max(incentive_at_risk, 0.0)
            decision = _build_decision("APPROVED", payout_amount, "Approved by parametric rules")

        logger.info(
            "%s decision prepared rider_id=%s status=%s payout=%.2f reason=%s",
            _trace_prefix(state),
            state["rider_id"],
            decision["claim_status"],
            float(decision["payout_amount"]),
            decision["reason"],
        )

        claim_id = f"CLM_{uuid4().hex[:12].upper()}"
        db_status = map_api_claim_status_to_db_status(decision["claim_status"])
        review_timestamp = current_utc_iso() if db_status in {"APPROVED", "REJECTED"} else None

        # DB schema requires amount > 0. Use requested amount floor for non-payout paths.
        claim_amount = max(incentive_at_risk, 0.01)

        claim_row = {
            "claim_id": claim_id,
            "rider_id": state["rider_id"],
            "amount": claim_amount,
            "status": db_status,
            "coverage_week_start": monday_week_start_iso(),
            "disruption_type": disruption.get("normalized_type"),
            "decision_reason": decision["reason"],
            "reviewed_at": review_timestamp,
            "paid_at": None,
            "evidence_snapshot": {
                "disruption": disruption,
                "is_parametric_valid": state.get("is_parametric_valid", False),
                "is_fraud": state.get("is_fraud", False),
                "hgbr_event_risk": round(float(state.get("hgbr_event_risk", 0.0)), 6),
            },
        }

        persisted_claim_id = None

        try:
            repository.insert_claim_decision(claim_row)
            persisted_claim_id = claim_id
            logger.info(
                "%s claim persisted rider_id=%s claim_id=%s db_status=%s",
                _trace_prefix(state),
                state["rider_id"],
                claim_id,
                db_status,
            )
        except Exception as exc:
            message = str(exc)
            if "claims_one_per_week_per_disruption" in message:
                decision = _build_decision("DENIED", 0.0, "Duplicate weekly claim")
            else:
                decision = _build_decision("DENIED", 0.0, "Claim persistence failed")
            logger.error(
                "%s claim persistence failed rider_id=%s claim_id=%s error=%s",
                _trace_prefix(state),
                state["rider_id"],
                claim_id,
                exc,
            )

        attempt_row = _build_attempt_row(state, decision, claim_id=persisted_claim_id)
        try:
            repository.insert_claim_attempt(attempt_row)
            state["attempt_logged"] = True
            logger.info(
                "%s claim attempt persisted rider_id=%s attempt_id=%s status=%s",
                _trace_prefix(state),
                state["rider_id"],
                attempt_row["attempt_id"],
                attempt_row["attempt_status"],
            )
        except Exception as exc:
            logger.error(
                "%s claim attempt persistence failed rider_id=%s error=%s",
                _trace_prefix(state),
                state["rider_id"],
                exc,
            )

        state["final_decision"] = decision
        return state

    return execute_decision

class AIInsightResult(BaseModel):
    recommendation: str = Field(description="A 1-2 sentence supportive insurance/safety recommendation.")

def generate_rider_insight(
    rider_data: dict[str, Any],
    recent_claims: list[dict[str, Any]],
) -> str:
    """Uses LLM to synthesize a rider's recent history into a smart recommendation."""
    try:
        llm = ChatOllama(model="llama3", temperature=0.7, format="json")
        parser = JsonOutputParser(pydantic_object=AIInsightResult)
        
        prompt_template = """You are a supportive AI Career & Insurance Coach for a gig worker.
Analyze their profile and recent insurance claims to provide a single, punchy, supportive recommendation.
The recommendation should focus on financial protection or safety.

Context:
Rider Profile: {rider_profile}
Recent Claims: {claims_summary}

{format_instructions}
Return ONLY valid JSON."""

        claims_summary = [
            {"status": c.get("status"), "reason": c.get("decision_reason"), "amount": c.get("amount")}
            for c in recent_claims
        ]

        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["rider_profile", "claims_summary"],
            partial_variables={"format_instructions": parser.get_format_instructions()}
        )
        
        chain = prompt | llm | parser
        result = chain.invoke({
            "rider_profile": json.dumps(rider_data.get("profile", {})),
            "claims_summary": json.dumps(claims_summary)
        })
        return result.get("recommendation", "Continue maintaining your policy to stay protected against external disruptions.")
    except Exception:
        return "Stay protected! Your active policy ensures you're covered during extreme weather and pollution events."

class AppealResult(BaseModel):
    is_overturned: bool = Field(description="True if the appeal is successful and the decision is reversed.")
    appeal_narrative: str = Field(description="A 1-2 sentence explanation of why the decision was overturned or upheld.")

def generate_claim_appeal_advocacy(
    rider_id: str,
    last_rejection_reason: str,
    trust_score: float,
) -> dict[str, Any]:
    """Uses LLM to act as a 'Rider Advocate' and potentially overturn a rejection."""
    try:
        # Higher temperature for more 'creative advocacy'
        llm = ChatOllama(model="llama3", temperature=0.8, format="json")
        parser = JsonOutputParser(pydantic_object=AppealResult)
        
        prompt_template = """You are a 'Rider Advocate Agent' for Aegis Insurance. 
Your goal is to review a rejected insurance claim and decide if it should be OVERTURNED (Approved).

HARD CONSTRAINTS (NEVER OVERTURN):
1. If the 'last_rejection_reason' is 'Duplicate weekly claim', you MUST UPHELD the rejection.
2. If the 'last_rejection_reason' contains 'No active policy' or 'Unsupported', you MUST UPHELD it.
3. If the 'last_rejection_reason' is related to 'Parametric threshold', you MUST UPHELD it. These are hard data facts.

SMART ADVOCACY (OVERTURN ONLY IF):
1. If the 'last_rejection_reason' is 'Fraud' or 'Speed' related, AND the 'trust_score' is > 90.0, you MAY OVERTURN it.
2. Argue that the speed spike or location anomaly was likely a GPS/Sensor error given the rider's perfect history.
3. If trust_score < 80.0, UPHELD it regardless.

{format_instructions}
Return ONLY valid JSON.

Data:
Rider ID: {rider_id}
Rejection Reason: {last_rejection_reason}
Rider Trust Score: {trust_score}"""

        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["rider_id", "last_rejection_reason", "trust_score"],
            partial_variables={"format_instructions": parser.get_format_instructions()}
        )
        
        chain = prompt | llm | parser
        result = chain.invoke({
            "rider_id": rider_id,
            "last_rejection_reason": last_rejection_reason,
            "trust_score": trust_score
        })
        
        is_overturned = result.get("is_overturned", False)
        return {
            "is_overturned": is_overturned,
            "new_status": "APPROVED" if is_overturned else "REJECTED",
            "appeal_narrative": result.get("appeal_narrative", "Appeal reviewed based on historical telemetry and trust profile.")
        }
    except Exception:
        # Fallback to smart logic if LLM fails
        hard_rejections = ["Duplicate weekly claim", "No active policy", "Unsupported disruption type"]
        is_hard = any(hr in last_rejection_reason for hr in hard_rejections)
        
        should_overturn = trust_score > 90.0 and not is_hard
        return {
            "is_overturned": should_overturn,
            "new_status": "APPROVED" if should_overturn else "REJECTED",
            "appeal_narrative": "Standard review completed: Perfect history of trust justifies an override for this anomalous event." if should_overturn else f"Appeal denied: {last_rejection_reason} is a hard constraint or trust is insufficient."
        }



