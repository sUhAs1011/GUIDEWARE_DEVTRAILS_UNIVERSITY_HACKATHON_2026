# ShiftGuard - Master Handoff

Last updated: 2026-04-04 (Phase 7 Finalized - Auth, Persistence, Advocacy, 12-Zone Bangalore Expansion, Demo Logging, Dynamic Premium Explainability, Claim Activity Audit Trail, Pollution Trigger Simulation, Visible Coverage Info UI, Fraud/Viability Explainability UI, Popup Overlay Info Modals, and Frontend UI Polish Pass)
Repository root: `c:\Users\Shreyas S\OneDrive\Desktop\DevTrails`

## Project Goal
Hackathon prototype for AI parametric insurance focused on food delivery partners, solving the "Income Volatility" problem through automated weekly pricing, claims orchestration, and fraud-aware decisioning.

The product is intended to be city-agnostic. The current prototype uses Bengaluru zone simulation data for demo purposes.

## Non-Negotiable Constraints
1. **Coverage Scope**: LOSS OF INCOME ONLY from external disruptions (Weather, Pollution, Strikes).
2. **Exclusions**: Health, Life, Accidents, Vehicle repairs.
3. **Pricing Basis**: STRICTLY WEEKLY.
4. **Stack**: Python (FastAPI/LangGraph), Next.js (Tailwind/Lucide), Supabase (PostgreSQL).

## Product Framing
- **Hackathon / Team Name**: `DevTrails`
- **Product Name**: `ShiftGuard`
- **Primary Persona**: Food delivery partners
- **Target Worker Type**: Swiggy/Zomato-style 2-wheeler delivery workers
- **Demo Geography**: Bengaluru zone simulation
- **Scalability Positioning**: Extendable to any city with localized disruption and zone-risk inputs

## Canonical Rider Schema
```json
{
  "rider_id": "RIDER_8023",
  "profile": { "name": "Ravi Kumar", "phone": "+91-9876543210", "vehicle_type": "2_WHEELER", "primary_zone": "BLR_INDIRANAGAR" },
  "real_time_state": { "status": "ONLINE", "current_location": { "lat": 12.9784, "lon": 77.6408 }, "last_ping_timestamp": "2026-03-16T20:54:00Z" },
  "daily_performance": { "orders_completed_today": 14, "daily_target": 18, "incentive_at_risk": 250.00, "earnings_today": 650.00 },
  "insurance_profile": { "policy_active": true, "weekly_premium_paid": 22.50, "risk_score": 0.85 },
  "fraud_telemetry": { "current_speed_kmph": 0.0, "is_mock_location_enabled": false, "battery_level": 45 }
}
```

## Current Implementation Status

### 1) Auth & Onboarding (Phase 4-5)
- **Rider Login**: Secure Glassmorphic login by `rider_id` (e.g., `RIDER_8023`).
- **Self-Service Signup**: `POST /signup` allows new riders to join. Initializes state with standard defaults (Active policy, 0.85 risk score).
- **Persistence**: `PATCH /rider/{rider_id}` permanently syncs earnings (INR 250 approvals) back to Supabase.
- **Account Management**: Dashboard includes a "Danger Zone" with a `DELETE` resignation feature.
- **Persona Focus**: Positioned for food delivery partners rather than generic gig workers.

### 2) Database Schema (Supabase)
- **public.riders**: Stores JSONB profile sections + strict columns for `primary_zone`, `rider_status`, `policy_active`, and `risk_score`.
- **public.claims**: Stores claim history with Monday-aligned weeks and unique constraints on `(rider_id, disruption_type, coverage_week_start)`.
- **public.claim_attempts**: Additive audit table storing every claim evaluation attempt, including duplicates and denied attempts.

### 3) Detailed Decision Logic (LangGraph)
The orchestrator (`backend/orchestrator/graph.py`) executes these gates:
1. **Parametric Gate**: 
   - `Rainfall > 15.0mm` (Extreme Weather)
   - `AQI > 200.0` (Severe Pollution)
   - `Strike Intensity > 0.6` (Local Strike)
2. **Fraud Gate (LLM)**: 
   - Denies if `is_mock_location_enabled` is true.
   - Denies if `current_speed_kmph > 15.0` (indicates vehicle use during a "work-stop" claim).
3. **Risk Gate (HGBR)**: 
   - Predicts event risk using the Gradient Boosting model.
   - `Risk > 0.95` triggers `MANUAL_REVIEW`.
4. **Advocacy Gate**:
   - Overturns rejections ONLY for GPS/Speed anomalies if `trust_score > 90%`.

### 3.1) Demo Logging Layer
- Added minimal structured backend logging for demo clarity.
- Every claim request now gets a short `trace_id` so logs can be followed node-by-node in terminal.
- Claim flow logs now cover:
  - request received
  - rider fetch start/success/failure
  - parametric pass/fail
  - fraud check via Ollama or deterministic fallback
  - HGBR event risk score
  - final decision prepared
  - Supabase claim persistence success/failure
- High-level logs were also added for:
  - premium quote requests
  - appeal requests
  - key Supabase rider/claim operations

### 3.2) Fraud & Abuse Controls
- Mock-location telemetry detection
- Speed anomaly detection during disruption claims
- Duplicate official weekly claims blocked at the `claims` table level
- All claim attempts stored in `claim_attempts` for auditability
- High-risk events routed to manual review

### 4) ML Risk & Pricing Engine
- **RandomForest & HGBR Ensemble**: Predicts claim risk and calculates live premiums.
- **`POST /quote_premium`**: Generates a live quote based on rider zone + simulated zone conditions.
- Quote pricing is now dynamically driven by:
  - rider `primary_zone`
  - simulated live `rainfall_mm`
  - simulated live `aqi`
  - simulated live `strike_intensity`
  - rider experience
  - seasonal risk
- Quote response now also returns:
  - `pricing_factors`
  - `pricing_explanation`
- Frontend auto-fetches premium breakdown data after rider login/signup.
- Frontend exposes a "View Premium Breakdown" button that opens the pricing summary inside a modal instead of inline.
- Frontend now includes a Claim Activity section showing recent evaluation attempts with status, reason, payout, and timestamp.
- Frontend also now surfaces a visible `Fraud & Abuse Controls` modal explaining adversarial defenses and financial-viability guardrails.

### 5) Regional Expansion & UI (Phase 7)
- **Bangalore Coverage**: 12 Prominent Zones (Indiranagar, Koramangala, Whitefield, HSR, Jayanagar, Malleshwaram, Electronic City, Bellandur, Sarjapur Road, JP Nagar, Marathahalli, Hebbal).
- **Dynamic Color Pulse**: Heatmap automatically codes zones: **Rose** (Critical), **Amber** (Elevated), **Emerald** (Normal).
- **Geography Note**: Bengaluru is the current demo dataset, not the product boundary.
- **Coverage Info UI**: The coverage card now includes a visible `Coverage Info` button that opens a centered popup overlay modal listing what is covered and not covered.
- **Fraud/Viability UI**: The coverage card now also includes a visible `Fraud & Abuse Controls` button that opens a centered popup overlay modal explaining mock-location checks, speed anomaly detection, duplicate-claim blocking, audit trails, manual review, and bounded-risk pricing guardrails.
- **Simulator Surface**: Frontend simulator now exposes:
  - Extreme Rain
  - Severe Pollution
  - Clear Weather (parametric fail)
  - GPS Spoofing (fraud test)
- **Zone-Aware Simulation**: Simulator payloads now use the logged-in rider's `primary_zone` instead of a hardcoded zone.
- **Frontend Architecture Polish**: The dashboard presentation layer is now split into focused components for the shell, tabs, summary cards, coverage card, insights, claim activity, city pulse, simulation actions, and shared overlay modals.
- **Design System Foundation**: `globals.css` now provides shared glass-panel tokens, motion easing, scrollbar polish, radial background gradients, and consistent press states so the UI feels more intentional without changing backend behavior.

## Endpoint Summary
- `POST /evaluate_claim`: Main claim engine.
- `POST /appeal_claim`: AI-driven advocacy review.
- `GET /claim-attempts/{rider_id}`: Returns recent rider-facing claim activity, including duplicate denied attempts.
- `GET /claims/{rider_id}`: Returns recent persisted claim history for the rider.
- `GET /rider/{rider_id}`: Hydrates profile.
- `PATCH /rider/{rider_id}`: Permanent performance sync.
- `DELETE /rider/{rider_id}`: Account resignation.
- `POST /signup`: New rider registration.
- `POST /quote_premium`: Live ML-driven premium calculation.

## Run Commands

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn orchestrator.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. LLM Setup
Ensure **Ollama** is running locally with the `llama3` model:
```bash
ollama run llama3
```

## Verification Notes
- **Static Analysis**: `py_compile` passed for all orchestrator and ML modules.
- **Logic Validation**: LangGraph node branches (Parametric, Fraud, Risk) verified against hackathon thresholds.
- **Simulator Validation**: Weather and pollution triggers now both flow through the same logged claim pipeline and terminal trace logs.
- **Persistence Check**: `PATCH` and `DELETE` endpoints verified with Supabase REST client.
- **UI Performance**: Glassmorphic dashboard maintains 60fps with 12 active city pulse zones.

## Next Recommended Steps
1. **Multi-Rider Demo**: Authenticate as `RIDER_8023` (Ravi) and `RIDER_1947` (Aditi) to demonstrate data isolation.
2. **Lifecycle Test**: Demonstrate a successful "Resignation" in the Danger Zone to show full CRUD lifecycle.
3. **Regional Stress Test**: Trigger claims in high-risk zones (Bellandur) vs low-risk zones (HSR) to show dynamic AI decision variance.
4. **Analytics Expansion**: (Future) Add filters, grouping, or pagination to the Claim Activity timeline if the dashboard grows.

## Rule For Future Agents
Whenever code changes are made, update this `AGENTS.md` immediately so continuity remains exact.



