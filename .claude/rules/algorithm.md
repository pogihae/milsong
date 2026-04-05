# Algorithm Rules

Detailed scoring rules for the 입대곡 추천 시스템.

## Temporal Windows

| Window | Condition | Temporal_Weight |
|---|---|---|
| **Golden** | `D-14 ≤ P ≤ D+30` | 1.5 |
| **Silver** | `P < D-14` AND ≥10 days TOP 20 in `[D-30, D-1]` | 1.0 |
| Neither | all other cases | 0 (see stale-chart exception) |

Weekly chart fallback for Silver: ≥3 weeks TOP 20 in the 30-day window = equivalent to ≥10 daily days.

## Genre Multiplier

- `걸그룹 (Female Group) AND 댄스 (Dance)` → **1.5**
- All other genres/group types → **1.0**

## Base_Rank

```
best_rank = peak chart position in [D-14, D+30]  (lowest number = best)
Base_Rank = 21 - best_rank
```

If the song never entered the chart in `[D-14, D+30]`: `Base_Rank = 0`.

## Tie-breaking (descending priority)

1. `Score_exposure` (higher is better)
2. `Win_Count` (higher is better)
3. `best_rank` (lower number is better)

## Stale Chart Exception (§6.4)

**Trigger**: No song has TOP 10 history in the Golden Window `[D-14, D+30]`.

Switch to stale formula and set a `stale_mode: true` flag on the response:

```
Total_Score_stale = w_long × days_top20_in_[D-60, D] + Score_exposure + Win_Count × 5
```

`w_long` is a tuning parameter (start at 1.0). This mode must be clearly separated from the normal pipeline.

## Missing Data Handling

| Case | Rule |
|---|---|
| Missing release date `P` | `Temporal_Weight = 0`; keep `Base_Rank` and `Score_exposure` intact |
| Missing `Win_Count` data | Use `Win_Count = 0`; omit the wins line from analytics output |
| Weekly-only chart | Silver: ≥3 weeks → equivalent to ≥10 daily days; Exposure: multiply qualifying weeks × 7 days |

## Hard Constraints

- **No hardcoded years or absolute dates** — every window is expressed as an offset from `D`.
- **Chart source consistency**: choose daily or weekly for the entire request; never mix.
- Daily chart data takes priority over weekly when both are available.
- Top 3 candidates are selected after sorting by `Total_Score` descending.
