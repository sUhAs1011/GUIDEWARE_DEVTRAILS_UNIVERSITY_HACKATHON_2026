# 🛡️ ShiftGuard – AI-Powered Parametric Insurance for the Gig Economy

ShiftGuard is an **AI-driven parametric insurance platform** designed to protect gig workers from temporary loss of income caused by external disruptions such as extreme weather, severe air pollution, and labor strikes.

Instead of requiring lengthy manual claims processing, ShiftGuard leverages **AI agents**, **dynamic risk pricing**, and **automated claims evaluation** to provide transparent, explainable, and near-instant insurance decisions.

Although the current prototype uses **Bengaluru** as its demonstration geography, the platform is designed to scale to any city through localized risk modeling.

---

# ✨ Features

* 🤖 AI-powered automated claim evaluation using LangGraph
* ⚖️ Explainable AI appeal workflow powered by Llama 3
* 📍 Hyper-local risk assessment across simulated city zones
* 💰 Dynamic weekly premium calculation
* 📊 Real-time risk dashboard and disruption simulator
* 👤 Complete rider lifecycle management
* 📝 Persistent earnings and policy management using Supabase
* 📜 Claim activity timeline with full audit history
* 🚨 Fraud detection and abuse prevention mechanisms

---

# 🏗️ System Architecture

ShiftGuard combines AI agents, machine learning, and parametric insurance principles into an end-to-end claims automation pipeline.

## Workflow

```text id="hbln9g"
Gig Worker
     │
     ▼
Policy Enrollment
     │
     ▼
Risk Pricing Engine
     │
     ▼
Weekly Premium
     │
     ▼
External Disruption
(Weather / AQI / Strike)
     │
     ▼
LangGraph Claim Agent
     │
     ├──────────────┐
     ▼              ▼
Fraud Checks   Eligibility Check
     │              │
     └──────┬───────┘
            ▼
Claim Decision
            │
            ▼
Appeal Agent (LLM)
            │
            ▼
Final Outcome
```

---

# 💼 Coverage

ShiftGuard focuses exclusively on **income protection** for gig workers.

### Covered Events

* 🌧️ Extreme weather disruptions
* 🌫️ Severe air pollution
* 🚧 Local strikes and public disruptions

### Not Covered

* Health insurance
* Life insurance
* Vehicle damage
* Accident claims
* Medical expenses

The platform currently supports **weekly parametric insurance policies**.

---

# 👥 Target Users

ShiftGuard is designed for workers whose income depends on daily operations, including:

* 🍔 Food delivery partners
* 🛵 Two-wheeler delivery executives
* 🚚 Last-mile logistics workers
* 📦 Gig economy delivery professionals

While Bengaluru is used as the demonstration city, the architecture supports expansion to other regions using localized risk inputs.

---

# 🧠 AI Components

## 📋 Claims Evaluation Agent

Built using **LangGraph**, this agent automatically evaluates claims by analyzing disruption events, policy rules, and rider information.

---

## ⚖️ Appeal Agent

Powered by **Llama 3 (Ollama)**, the appeal agent explains rejected claims and provides transparent reasoning for every decision.

---

## 📈 Risk Pricing Engine

Calculates weekly insurance premiums using an **HGBR-based machine learning model** that considers:

* Rainfall intensity
* Air Quality Index (AQI)
* Strike severity
* Seasonal factors
* Rider experience
* Historical disruption patterns

Premiums automatically adapt to local operating conditions.

---

# 🛡️ Fraud & Abuse Protection

ShiftGuard incorporates multiple safeguards to reduce fraudulent claims.

* GPS spoofing detection
* Speed anomaly detection
* Duplicate claim prevention
* One official claim per disruption type per week
* Complete claim audit trail
* Manual review for high-risk scenarios

---

# 🛠️ Tech Stack

| Category             | Technologies         |
| -------------------- | -------------------- |
| **Backend**          | FastAPI              |
| **AI Framework**     | LangGraph, LangChain |
| **Language Models**  | Ollama, Llama 3      |
| **Machine Learning** | Scikit-learn (HGBR)  |
| **Frontend**         | Next.js 15           |
| **Styling**          | Tailwind CSS         |
| **UI Components**    | Lucide React         |
| **Database**         | Supabase PostgreSQL  |

---

# 🚀 Getting Started

## Clone the Repository

```bash id="b3qwb0"
git clone <repository-url>
cd <repository-folder>
```

---

## Configure Environment

Create a `.env` file:

```env id="5kpaj9"
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your_secret_key
```

---

## Start the Backend

```bash id="dmyqoq"
cd backend
pip install -r ../requirements.txt
uvicorn orchestrator.main:app --reload
```

Backend runs at:

```text id="jlwm9i"
http://localhost:8000
```

---

## Start the Frontend

```bash id="sg0q4v"
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text id="0b9jpc"
http://localhost:3000
```

---

## Start the LLM

```bash id="t8qjy0"
ollama run llama3
```

---

## Configure Supabase

Run the following SQL scripts inside the Supabase SQL Editor:

1. `supabase/schema_hackathon.sql`
2. `supabase/claim_attempts.sql`

---

# 🎬 Demo Workflow

1. Sign up or log in as a rider.
2. Generate a personalized weekly insurance quote.
3. View the premium breakdown and risk explanation.
4. Simulate disruption events such as:

   * 🌧️ Extreme Rain
   * 🌫️ Severe Pollution
   * ☀️ Clear Weather
   * 📍 GPS Spoofing
5. Review claim history and audit logs.
6. Submit an appeal for rejected claims.
7. Observe AI-generated explanations and final decisions.

---

# 📂 Project Structure

```text id="v4um86"
backend/
├── AI Agents
├── Claim Orchestration
├── Pricing Engine

frontend/
├── Next.js Dashboard
├── Risk Simulator
├── Claim Interface

supabase/
├── Database Schema
├── Claim Tables

AGENTS.md
```

---

# 🚀 Future Roadmap

* Live weather API integration
* Real-time AQI monitoring
* Multi-city deployment
* Mobile application
* Blockchain-based claim verification
* Personalized insurance recommendations
* Reinforcement learning for dynamic pricing
* Integration with payment gateways

---

# 🏆 Hackathon Project

ShiftGuard was developed as a hackathon project to demonstrate how **Artificial Intelligence**, **Machine Learning**, and **Parametric Insurance** can work together to provide fast, transparent, and automated financial protection for gig economy workers.

---

# 📄 License

This project was developed for hackathon purposes by the **DevTrails Team**.

---

⭐ If you found this project interesting, consider giving the repository a star!
