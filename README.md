# Milsong

입대일을 기준으로 그 시기의 집단 기억에 가장 가까운 입대곡 Top 3를 추천하는 Next.js 앱입니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하면 됩니다.

## 환경 변수

`.env.local`에 아래 값을 채워주세요.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 주요 구조

- `src/app`: App Router 페이지와 API
- `src/components`: 입력과 결과 UI
- `src/application`: 추천 유스케이스
- `src/domain`: 점수 계산과 결과 문구
- `src/infrastructure/supabase`: Supabase 저장소 구현
- `src/ingest`: 차트, 메타데이터, 음악방송 1위 적재

## 검증

- `npm test`
- `npm run lint`
- `npx tsc --noEmit`

## 데이터 적재

- 먼저 Supabase에 [0002_ingest_support.sql](/D:/projects/milsong/supabase/migrations/0002_ingest_support.sql)을 적용합니다.
- 차트 전체 백필: `npm run ingest:bugs -- --mode=backfill --from=2019-01-01 --to=2020-12-31`
- 최근 누락분 증분 동기화: `npm run ingest:bugs:sync`
- 메타데이터 보강: `npm run ingest:bugs:enrich`
- 음악방송 1위 반영: `npm run ingest:wins -- --from-year=2019 --to-year=2020`

## 운영 추천

- 초기 1회는 원하는 전체 기간에 대해 백필을 돌립니다.
- 이후 GitHub Actions [bugs-chart-sync.yml](/D:/projects/milsong/.github/workflows/bugs-chart-sync.yml)이 매주 일요일 오전 3:20(KST)에 자동으로 실행됩니다.
- 자동 실행 순서는 `ingest:bugs:sync -> ingest:bugs:enrich -> ingest:wins` 입니다.
- 전체 연도를 다시 맞추고 싶으면 workflow dispatch로 `mode`, `from`, `to`, `wins_from_year`, `wins_to_year`를 넣어 수동 실행하면 됩니다.
