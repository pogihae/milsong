# Milsong

입대일을 기준으로 군 생활의 집단 기억에 가장 가까운 입대곡 Top 3를 추천하는 Next.js 앱입니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 됩니다.

## 환경 변수

`.env.example`을 참고해 `.env.local`을 만들고 아래 값을 채워 주세요.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 주요 구조

- `src/app`: App Router 페이지와 API 라우트
- `src/components`: 입력 폼과 결과 UI
- `src/application`: 추천 유스케이스 오케스트레이션
- `src/domain`: 점수 계산과 결과 문구 생성
- `src/infrastructure/supabase`: Supabase 저장소 구현

## 검증

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

## 차트 적재

- 먼저 Supabase에 `supabase/migrations/0002_ingest_support.sql`까지 적용합니다.
- 2019~2020 백필: `npm run ingest:bugs:backfill`
- 최근 증분 동기화: `npm run ingest:bugs:sync`

현재 1차 구현은 Bugs 일간 차트 기준으로 `songs`, `charts`, `sync_runs`, `sync_checkpoints`를 채웁니다. 장르, 그룹 타입, 발매일, 음방 1위는 후속 enrichment 단계에서 보강할 수 있게 `songs.source_*` 컬럼과 실행 이력을 함께 저장합니다.
