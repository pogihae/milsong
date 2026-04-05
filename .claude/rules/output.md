# Output Rules

Response structure, tone, analytics, and era-label generation.

## JSON Schema

```json
{
  "title": "string — page/card heading",
  "main_song": { "artist": "string", "title": "string" },
  "candidates": [
    {
      "rank": 1,
      "artist": "string",
      "title": "string",
      "total_score": 0,
      "breakdown": {
        "rank_component": 0,
        "exposure": 0,
        "wins": 0
      }
    }
  ],
  "analytics": ["근거 문장 1", "근거 문장 2"],
  "era_label": "당신은 확실한 [○○○] 세대입니다.",
  "stale_mode": false
}
```

- `candidates`: array of up to 3 items, sorted by `total_score` descending.
- `stale_mode`: set `true` when the stale-chart exception was triggered.
- `breakdown.wins`: omit (or set `null`) when `Win_Count` data was unavailable.

## `tone` Parameter

| Value | Style |
|---|---|
| `t_plus` | Military slang, concise reporting voice. Use "귀하", "관물대", "자대", "자대 배치", "일병 꺾이기" etc. |
| `nostalgic` | Sentimental, reminiscent; warm and unhurried prose. |

Apply the chosen tone to all strings in `title`, `analytics`, and `era_label`.

## Analytics Sentence Rules

Each item in `analytics` corresponds to one trigger condition. Generate a sentence only when the condition is met.

| Trigger | Content direction |
|---|---|
| Golden Window | 입대 직전·직후 신곡으로 차트에 강하게 노출된 곡임을 언급 |
| Silver Window | 입대 전부터 이미 상위권을 유지하던 롱런 곡임을 언급 |
| 걸그룹·댄스 bonus | 휴게실·TV 노출 맥락에서 두드러진 장르임을 언급 |
| `Win_Count > 0` | 음방 N관왕 달성 언급; omit entirely if `Win_Count` data is missing |
| Exposure | 이병 기간 TOP 10 체류 일수 및 비율 언급 |

## Era Label Generation

1. Look up `main_song` ID in the **alias mapping table** (maintained in `src/domain/eraAliases.ts` or equivalent).
   - Example mappings: `"텔미"` for *Tell Me*, `"롤린"` for *Rollin'*.
2. Append `" 세대"` to the alias.
3. **Fallback** (no alias found): strip parentheses and subtitles from the song title, take the first meaningful N characters, append `" 세대"`.

Full `era_label` string template: `"당신은 확실한 [ALIAS] 세대입니다."`
