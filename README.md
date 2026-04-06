# ShiftGuard 🚀

Final hackathon prototype for an AI parametric insurance product tailored for the gig economy. Our platform provides automated loss-of-income coverage triggered by external disruptions such as extreme weather, severe pollution, and local strikes.

The product is city-agnostic by design. The current prototype demonstrates hyper-local pricing and claims automation using Bengaluru zone simulation data.

## Key Features

- Automated claims evaluation powered by LangGraph
- AI advocate flow for appeals using Ollama / Llama 3
- Bengaluru demo risk pulse dashboard with 12 simulated zones
- Rider lifecycle management: signup, login, update, delete
- Persistent earnings sync with Supabase
- HGBR-driven weekly premium pricing with explanation
- Claim activity timeline showing every evaluation attempt
- Zone-aware disruption simulator with weather, pollution, fraud, and threshold-fail scenarios

## Coverage Scope

- Covers loss of income only from external disruptions
- Weekly pricing basis only
- Excludes health, life, accidents, and vehicle repairs

## Persona Focus

- Food delivery partners
- Swiggy / Zomato-style 2-wheeler delivery workers
- Bengaluru is used as the demo geography, but the framework is designed to extend to other cities with localized zone inputs

## Tech Stack

### Backend
- FastAPI
- LangGraph
- LangChain
- Scikit-learn
- Ollama

### Frontend
- Next.js 15
- Tailwind CSS
- Lucide React

### Database
- Supabase PostgreSQL

## Pricing and Risk Logic

- Weekly premium is dynamically calculated using HGBR-based risk scoring
- Pricing responds to hyper-local simulated factors such as rainfall, AQI, strike intensity, rider experience, and seasonal risk
- Safer operational conditions reduce the weekly premium, while higher disruption risk pushes it upward

## Fraud and Abuse Controls

- Mock-location detection
- Speed anomaly detection
- One official claim per disruption type per week
- Full claim-attempt audit trail
- Manual review for very high-risk events

## Pricing and Viability

- Weekly premiums are bounded rather than open-ended
- Pricing adjusts to hyper-local disruption signals such as rainfall, AQI, strike intensity, rider experience, and seasonal risk
- Safer operating conditions reduce the weekly premium while higher-risk zones pay more
- Payouts are tied to `incentive_at_risk`, which keeps compensation aligned to income disruption rather than unlimited replacement
- Duplicate official claims are blocked and fraud screening reduces payout leakage

## Configuration

Create a root `.env` file:

```env
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_SECRET_KEY="your-supabase-secret-key"
```

Notes:
- `SUPABASE_SECRET_KEY` is the preferred server-side key in this project.
- `SUPABASE_SERVICE_ROLE_KEY` is also supported as a fallback by the backend config.

## Running the Project

### Backend

```bash
cd backend
pip install -r ../requirements.txt
uvicorn orchestrator.main:app --reload
```

Backend API: `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend app: `http://localhost:3000`

### LLM Engine

```bash
ollama run llama3
```

## Supabase Setup

Run these SQL files in Supabase SQL Editor:

1. `supabase/schema_hackathon.sql`
2. `supabase/claim_attempts.sql`

## Demo Flow

1. Login as `RIDER_8023` or sign up a new rider
2. Refresh the premium quote and open the premium breakdown modal
3. Open `Coverage Info` and `Fraud & Abuse Controls` to show explicit insurance scope and adversarial-defense logic
4. Trigger approved / denied / fraud scenarios from the simulator:
   - Extreme Rain
   - Severe Pollution
   - Clear Weather
   - GPS Spoofing
5. Review the Claim Activity section to see every attempt recorded
6. Use the appeal flow for rejected cases

## Project Structure

- `backend/`: FastAPI backend, orchestration, ML pricing engine
- `frontend/`: Next.js dashboard and simulator
- `supabase/`: SQL setup files
- `AGENTS.md`: project handoff and continuity notes

## License

Built for hackathon purposes by the DevTrails team.
