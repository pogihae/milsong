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
