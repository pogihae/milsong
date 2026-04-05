---
paths:
  - "src/**/*.{ts,tsx}"
---

# TypeScript / Next.js Rules

Applies to all files matching `src/**/*.{ts,tsx}`.

## Language & Compiler

- TypeScript **strict mode** required (`"strict": true` in `tsconfig.json`).
- No `any` without an explicit `// eslint-disable` comment explaining why.

## Layer Dependency Rules

```
app / components  →  application  →  domain  ←  infrastructure
```

- `src/domain/` must contain **pure functions only** — no Supabase client imports, no `fetch`, no side effects.
- `src/application/` orchestrates: load data from infrastructure → call domain functions → assemble output DTO.
- All Supabase queries live exclusively in `src/infrastructure/supabase/` or `src/lib/db/`.
- `src/app/` and `src/components/` hold presentation logic only; no scoring formulas here.
- Infrastructure may import domain types, but must **never** import from `src/app/` or `src/components/`.

## Supabase Usage

- Instantiate the Supabase client once per runtime boundary (server component, Route Handler, or Server Action) using the appropriate helper (`createServerComponentClient`, `createRouteHandlerClient`, etc.).
- Environment variables:
  - Server-only secrets: plain `SUPABASE_*` names (never expose to the browser).
  - Browser-safe values: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Algorithm Implementation

- All scoring logic (`Total_Score`, `Rank_Component`, `Score_exposure`, `Genre_Multiplier`, stale-chart branch) runs in **application code** (`src/domain/` + `src/application/`), not inside SQL or Supabase RPC.
- Date windows are always computed as offsets from `enlistment_date`; no hardcoded years.

## Seed Scripts

- One-off data import scripts belong in `scripts/seed.ts` (or `scripts/` subdirectory).
- Seed scripts must **not** be imported by the runtime recommendation path.
