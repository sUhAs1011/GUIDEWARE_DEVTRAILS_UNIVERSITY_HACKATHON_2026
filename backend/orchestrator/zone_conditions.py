from __future__ import annotations

from datetime import datetime, timezone


_ZONE_BASELINES: dict[str, dict[str, float | str]] = {
    "BLR_INDIRANAGAR": {"rainfall_mm": 18.0, "aqi": 118.0, "strike_intensity": 8.0, "updated_at": ""},
    "BLR_KORAMANGALA": {"rainfall_mm": 24.0, "aqi": 142.0, "strike_intensity": 12.0, "updated_at": ""},
    "BLR_WHITEFIELD": {"rainfall_mm": 27.0, "aqi": 165.0, "strike_intensity": 14.0, "updated_at": ""},
    "BLR_HSR": {"rainfall_mm": 14.0, "aqi": 102.0, "strike_intensity": 7.0, "updated_at": ""},
    "BLR_JAYANAGAR": {"rainfall_mm": 12.0, "aqi": 96.0, "strike_intensity": 6.0, "updated_at": ""},
    "BLR_MALLESHWARAM": {"rainfall_mm": 16.0, "aqi": 108.0, "strike_intensity": 5.0, "updated_at": ""},
    "BLR_ECITY": {"rainfall_mm": 29.0, "aqi": 176.0, "strike_intensity": 15.0, "updated_at": ""},
    "BLR_BELLANDUR": {"rainfall_mm": 36.0, "aqi": 228.0, "strike_intensity": 18.0, "updated_at": ""},
    "BLR_SARJAPUR": {"rainfall_mm": 31.0, "aqi": 188.0, "strike_intensity": 16.0, "updated_at": ""},
    "BLR_JPNAGAR": {"rainfall_mm": 15.0, "aqi": 104.0, "strike_intensity": 7.0, "updated_at": ""},
    "BLR_MARATHAHALLI": {"rainfall_mm": 28.0, "aqi": 194.0, "strike_intensity": 13.0, "updated_at": ""},
    "BLR_HEBBAL": {"rainfall_mm": 22.0, "aqi": 154.0, "strike_intensity": 11.0, "updated_at": ""},
}


def _bounded_variation(zone: str, factor: int, modulus: int) -> int:
    checksum = sum((index + 1) * ord(character) for index, character in enumerate(zone))
    now = datetime.now(timezone.utc)
    request_slot = now.minute + now.second + (now.microsecond // 1000)
    return ((checksum + factor + request_slot) % modulus) - (modulus // 2)


def get_simulated_zone_conditions(zone: str) -> dict[str, float | str]:
    normalized_zone = zone.strip().upper() if zone else "BLR_INDIRANAGAR"
    base = _ZONE_BASELINES.get(normalized_zone, _ZONE_BASELINES["BLR_INDIRANAGAR"]).copy()

    rainfall = max(0.0, float(base["rainfall_mm"]) + float(_bounded_variation(normalized_zone, 7, 5)))
    aqi = max(40.0, float(base["aqi"]) + float(_bounded_variation(normalized_zone, 11, 11)))
    strike_intensity = max(0.0, float(base["strike_intensity"]) + float(_bounded_variation(normalized_zone, 13, 5)))

    base["rainfall_mm"] = round(rainfall, 1)
    base["aqi"] = round(aqi, 1)
    base["strike_intensity"] = round(strike_intensity, 1)
    base["updated_at"] = datetime.now(timezone.utc).isoformat()
    return base
