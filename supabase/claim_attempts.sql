-- Additive audit trail for every claim evaluation attempt.
-- Run this after schema_hackathon.sql or schema.sql.

create table if not exists public.claim_attempts (
    attempt_id text primary key,
    claim_id text null references public.claims(claim_id) on delete set null,
    rider_id text not null references public.riders(rider_id) on delete cascade,
    disruption_type text,
    attempt_status text not null check (
        attempt_status in ('APPROVED', 'DENIED', 'FRAUD_FLAGGED', 'MANUAL_REVIEW')
    ),
    payout_amount numeric(10, 2) not null default 0 check (payout_amount >= 0),
    reason text,
    evidence_snapshot jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint claim_attempts_evidence_snapshot_object check (
        jsonb_typeof(evidence_snapshot) = 'object'
    )
);

create index if not exists idx_claim_attempts_rider_id on public.claim_attempts (rider_id);
create index if not exists idx_claim_attempts_created_at on public.claim_attempts (created_at desc);
create index if not exists idx_claim_attempts_attempt_status on public.claim_attempts (attempt_status);
create index if not exists idx_claim_attempts_disruption_type on public.claim_attempts (disruption_type);

drop trigger if exists trg_claim_attempts_set_updated_at on public.claim_attempts;
create trigger trg_claim_attempts_set_updated_at
before update on public.claim_attempts
for each row
execute function public.set_updated_at();
