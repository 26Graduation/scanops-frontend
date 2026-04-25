# scanops-frontend

ScanOps 프론트엔드 — React TS + Vite + Tailwind CSS

## 기술 스택

- React 18 + TypeScript
- Vite (빌드 툴)
- Tailwind CSS v4 (`@tailwindcss/vite`)
- React Router v6
- Recharts (차트)
- FSD(Feature-Sliced Design) 아키텍처

## 폴더 구조 (FSD)

```
src/
├── app/            ← 라우터
├── pages/          ← 슬라이스별 페이지 (landing, scan, scan-status, report, reports)
├── widgets/        ← 복합 UI 블록 (vuln-table, vuln-chart)
├── features/       ← 유저 액션 (scan-request)
├── entities/       ← 비즈니스 엔티티 (scan, vulnerability)
└── shared/         ← 공통 (api/httpClient, ui/CvssGauge)
```

## 로컬 실행

```bash
npm install
cp .env.example .env.local
# .env.local 에서 VITE_API_BASE_URL 수정 (백엔드 주소)
npm run dev
```

## Vercel 배포

1. [vercel.com](https://vercel.com) → New Project → Import `scanops-frontend`
2. Framework Preset: **Vite** (자동 감지)
3. 환경변수 설정:
   ```
   VITE_API_BASE_URL = https://your-backend.up.railway.app
   ```
4. Deploy → 완료

> `vercel.json`의 rewrites 설정으로 SPA 라우팅(React Router)이 정상 동작합니다.

## 환경변수

| 변수 | 설명 |
|------|------|
| `VITE_API_BASE_URL` | 백엔드 API 베이스 URL |
