from __future__ import annotations

import json
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from .config import OrchestratorSettings
from .logging_config import get_logger


logger = get_logger("orchestrator.repository")


class SupabaseRepository:
    def __init__(self, settings: OrchestratorSettings) -> None:
        if not settings.supabase_url or not settings.supabase_service_role_key:
            raise RuntimeError(
                "Missing SUPABASE_URL or SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY environment variables."
            )

        self.base_url = settings.supabase_url.rstrip("/")
        self.rest_base_url = f"{self.base_url}/rest/v1"
        self.api_key = settings.supabase_service_role_key
        self.timeout_seconds = 20

    def fetch_rider_by_id(self, rider_id: str) -> dict[str, Any] | None:
        logger.info("supabase fetch rider rider_id=%s", rider_id)
        params = {
            "select": "*",
            "rider_id": f"eq.{rider_id}",
            "limit": "1",
        }
        data = self._request(
            method="GET",
            path="/riders",
            params=params,
        )
        if isinstance(data, list) and data:
            logger.info("supabase fetch rider hit rider_id=%s", rider_id)
            return data[0]
        logger.warning("supabase fetch rider miss rider_id=%s", rider_id)
        return None

    def fetch_claims_by_rider(self, rider_id: str, limit: int = 5) -> list[dict[str, Any]]:
        logger.info("supabase fetch claims rider_id=%s limit=%s", rider_id, limit)
        params = {
            "select": "*",
            "rider_id": f"eq.{rider_id}",
            "order": "created_at.desc",
            "limit": str(limit),
        }
        data = self._request(
            method="GET",
            path="/claims",
            params=params,
        )
        if isinstance(data, list):
            logger.info("supabase fetch claims complete rider_id=%s count=%s", rider_id, len(data))
            return data
        return []

    def fetch_claim_attempts_by_rider(self, rider_id: str, limit: int = 10) -> list[dict[str, Any]]:
        logger.info("supabase fetch claim attempts rider_id=%s limit=%s", rider_id, limit)
        params = {
            "select": "*",
            "rider_id": f"eq.{rider_id}",
            "order": "created_at.desc",
            "limit": str(limit),
        }
        data = self._request(
            method="GET",
            path="/claim_attempts",
            params=params,
        )
        if isinstance(data, list):
            logger.info("supabase fetch claim attempts complete rider_id=%s count=%s", rider_id, len(data))
            return data
        return []

    def insert_claim_decision(self, claim_row: dict[str, Any]) -> dict[str, Any]:
        logger.info(
            "supabase insert claim claim_id=%s rider_id=%s status=%s disruption_type=%s",
            claim_row.get("claim_id"),
            claim_row.get("rider_id"),
            claim_row.get("status"),
            claim_row.get("disruption_type"),
        )
        data = self._request(
            method="POST",
            path="/claims",
            payload=claim_row,
            return_representation=True,
        )
        if isinstance(data, list) and data:
            logger.info("supabase insert claim success claim_id=%s", claim_row.get("claim_id"))
            return data[0]

    def insert_claim_attempt(self, attempt_row: dict[str, Any]) -> dict[str, Any]:
        logger.info(
            "supabase insert claim attempt attempt_id=%s rider_id=%s status=%s disruption_type=%s",
            attempt_row.get("attempt_id"),
            attempt_row.get("rider_id"),
            attempt_row.get("attempt_status"),
            attempt_row.get("disruption_type"),
        )
        data = self._request(
            method="POST",
            path="/claim_attempts",
            payload=attempt_row,
            return_representation=True,
        )
        if isinstance(data, list) and data:
            logger.info("supabase insert claim attempt success attempt_id=%s", attempt_row.get("attempt_id"))
            return data[0]
    def insert_rider(self, rider_data: dict[str, Any]) -> dict[str, Any]:
        logger.info("supabase insert rider rider_id=%s", rider_data.get("rider_id"))
        data = self._request(
            method="POST",
            path="/riders",
            payload=rider_data,
            return_representation=True,
        )
        if isinstance(data, list) and data:
            logger.info("supabase insert rider success rider_id=%s", rider_data.get("rider_id"))
            return data[0]
        return data if isinstance(data, dict) else {}

    def update_rider(self, rider_id: str, rider_data: dict[str, Any]) -> dict[str, Any]:
        logger.info("supabase update rider rider_id=%s fields=%s", rider_id, ",".join(sorted(rider_data.keys())))
        params = {
            "rider_id": f"eq.{rider_id}",
        }
        data = self._request(
            method="PATCH",
            path="/riders",
            params=params,
            payload=rider_data,
            return_representation=True,
        )
        if isinstance(data, list) and data:
            logger.info("supabase update rider success rider_id=%s", rider_id)
            return data[0]
        return data if isinstance(data, dict) else {}

    def delete_rider(self, rider_id: str) -> bool:
        logger.info("supabase delete rider rider_id=%s", rider_id)
        params = {
            "rider_id": f"eq.{rider_id}",
        }
        self._request(
            method="DELETE",
            path="/riders",
            params=params,
        )
        logger.info("supabase delete rider success rider_id=%s", rider_id)
        return True




    def _request(
        self,
        method: str,
        path: str,
        params: dict[str, str] | None = None,
        payload: dict[str, Any] | None = None,
        return_representation: bool = False,
    ) -> Any:
        query = f"?{urlencode(params)}" if params else ""
        url = f"{self.rest_base_url}{path}{query}"

        headers = {
            "apikey": self.api_key,
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
        if return_representation:
            headers["Prefer"] = "return=representation"

        body = None
        if payload is not None:
            body = json.dumps(payload).encode("utf-8")

        request = Request(
            url=url,
            data=body,
            headers=headers,
            method=method.upper(),
        )

        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                raw = response.read().decode("utf-8")
                if not raw:
                    return {}
                return json.loads(raw)
        except HTTPError as exc:
            error_body = exc.read().decode("utf-8", errors="replace")
            logger.error(
                "supabase rest error method=%s path=%s status=%s body=%s",
                method.upper(),
                path,
                exc.code,
                error_body,
            )
            raise RuntimeError(
                f"Supabase REST error {exc.code} on {method.upper()} {path}: {error_body}"
            ) from exc
        except URLError as exc:
            logger.error(
                "supabase network error method=%s path=%s error=%s",
                method.upper(),
                path,
                exc,
            )
            raise RuntimeError(
                f"Supabase REST network error on {method.upper()} {path}: {exc}"
            ) from exc
