from __future__ import annotations

from typing import Any

import numpy as np

from ml.risk_model import calculate_weekly_premium_with_model, predict_hgbr_risk

from .utils import build_hgbr_feature_vector, derive_seasonal_risk_index, derive_zone_risk_index
from .zone_conditions import get_simulated_zone_conditions


def build_dynamic_quote(rider: dict[str, Any]) -> dict[str, Any]:
    profile = rider.get("profile", {})
    zone = str(profile.get("primary_zone", "BLR_INDIRANAGAR")).strip().upper()
    experience_months = float(profile.get("experience_months", 12.0))
    zone_conditions = get_simulated_zone_conditions(zone)

    disruption = {
        "normalized_type": "EXTREME_WEATHER",
        "zone": zone,
        "intensity_value": float(zone_conditions["rainfall_mm"]),
        "aqi": float(zone_conditions["aqi"]),
        "strike_intensity": float(zone_conditions["strike_intensity"]),
    }

    features = build_hgbr_feature_vector(rider_db_data=rider, disruption=disruption)
    feature_array = np.asarray([features], dtype=float)
    risk_score = float(predict_hgbr_risk(feature_array)[0])
    weekly_premium_amount = float(calculate_weekly_premium_with_model(feature_array, model_key="hgbr_v1")[0])
    zone_risk_index = derive_zone_risk_index(zone)

    return {
        "weekly_premium_amount": round(weekly_premium_amount, 2),
        "risk_score": round(risk_score, 4),
        "pricing_factors": {
            "zone": zone,
            "rainfall_mm": float(zone_conditions["rainfall_mm"]),
            "aqi": float(zone_conditions["aqi"]),
            "strike_intensity": float(zone_conditions["strike_intensity"]),
            "rider_experience_months": round(experience_months, 1),
            "zone_risk_index": zone_risk_index,
            "seasonal_risk_index": derive_seasonal_risk_index(),
            "zone_baseline_risk": round(zone_risk_index / 10.0, 4),
            "updated_at": zone_conditions["updated_at"],
        },
        "pricing_explanation": [
            _rainfall_explanation(float(zone_conditions["rainfall_mm"])),
            _aqi_explanation(float(zone_conditions["aqi"])),
            _experience_explanation(experience_months),
        ],
    }


def _rainfall_explanation(rainfall_mm: float) -> str:
    if rainfall_mm >= 30:
        return "Heavy rainfall in your zone is pushing up disruption risk this week."
    if rainfall_mm >= 18:
        return "Moderate rainfall is contributing to a higher weekly premium."
    return "Rainfall conditions are relatively calm, keeping weather-driven risk lower."


def _aqi_explanation(aqi: float) -> str:
    if aqi >= 180:
        return "Elevated AQI is increasing the chance of work disruption in your area."
    if aqi >= 120:
        return "AQI is moderately elevated, adding some risk to this week's pricing."
    return "AQI is comparatively stable, so pollution risk is limited right now."


def _experience_explanation(experience_months: float) -> str:
    if experience_months >= 24:
        return "Your riding experience helps soften the premium despite external risks."
    if experience_months >= 12:
        return "Your steady work history provides some balance against zone-level disruption risk."
    return "Limited riding history means the premium leans more on current external conditions."
