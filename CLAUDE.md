# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@requirements.md

## Project Overview

**입대곡 추천 시스템** (Military Enlistment Song Recommendation System) — given a Korean military enlistment date `D`, recommend the K-pop songs that define that soldier's "era" (이병 시절). Chart rank alone is insufficient; the algorithm weights songs by temporal proximity to `D`, genre (girl group dance songs get a military-exposure bonus), music broadcast wins, and chart persistence during the 이병 period.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js** (App Router) |
| Language | **TypeScript** (strict mode) |
| Backend / Data | **Supabase** (PostgreSQL) |

## Architecture Layers

```
app / components  →  application  →  domain  ←  infrastructure
(Presentation)       (Use Cases)    (Pure Logic)  (Supabase queries)
```

- `src/domain/` — pure functions only; no side effects, no Supabase imports
- `src/application/` — orchestrates data load → domain scoring → output DTO
- `src/infrastructure/supabase/` or `src/lib/db/` — all Supabase queries
- `src/app/`, `src/components/` — UI; no business logic

## Domain Terminology

| Symbol / Term | Definition |
|---|---|
| `D` | Enlistment date (`enlistment_date`, YYYY-MM-DD) |
| `P` | Song release date |
| **Golden Window** | `D-14 ≤ P ≤ D+30` — Temporal_Weight = 1.5 |
| **Silver Window** | `P < D-14` AND ≥10 days TOP 20 in `[D-30, D-1]` — Temporal_Weight = 1.0 |
| **Exposure Score** | Days in TOP 10 during `[D, D+100]` (이병 구간) |
| **Win_Count** | Music broadcast 1st-place wins in `[D-90, D+100]` (지상파 3사 + Mnet) |
| **Base_Rank** | `21 - best_rank` (peak chart position in `[D-14, D+30]`) |
| **Era Label** | e.g. "텔미 세대", "롤린 세대" |

## Core Scoring Formula

```
Total_Score = Rank_Component + Score_exposure + (Win_Count × 5)

Rank_Component  = Base_Rank × Temporal_Weight × Genre_Multiplier
Score_exposure  = (days_in_top10_in_[D, D+100] / 100) × 100
Genre_Multiplier = 1.5 if (걸그룹 AND 댄스), else 1.0
```

See `.claude/rules/algorithm.md` for exception handling, missing-data rules, and stale-chart fallback.

## Key Constraints

- **No hardcoded years** — all date windows are offsets from `D`.
- **Daily chart preferred**; never mix daily and weekly for the same request.
- Algorithm runs in **application code**, not in the database.
- Seed scripts in `scripts/seed.ts`; never in the runtime recommendation path.
- Environment variables follow Next.js `NEXT_PUBLIC_` conventions.
