# ScanOps 프론트엔드

스캔 요청, 진행 상태, 취약점 리포트를 보여주는 React + TypeScript 대시보드입니다.
현재 Java 분석은 **Joern CPG + Qwen3.8-Max 앙상블**, 기존 비Java 분석은 **Qwen3.5-9B QLoRA** 경로를 사용합니다.

## 프로젝트 확인

| 자료 | 링크 |
|---|---|
| 현재 CPG + LLM 구현 | [scanops-model](https://github.com/26Graduation/scanops-model#readme) |
| 기존 파인튜닝 모델·실제 가중치 | [모델 카드](https://github.com/26Graduation/scanops-model/blob/main/docs/FINETUNED_MODEL.md) |
| 언어별 라우팅·결과 저장 | [백엔드](https://github.com/26Graduation/scanops-backend#readme) |
| 서비스 실행 설정 | [인프라](https://github.com/26Graduation/scanops-infra#readme) |

모델 인증키와 Java/비Java 라우팅은 백엔드에서 설정합니다. 프론트에 모델 API 키를 넣지 않습니다.

## 로컬 실행

```sh
npm ci
cp .env.example .env.local
# .env.local의 VITE_API_BASE_URL을 백엔드 주소로 설정
npm run dev
```

```sh
npm run build
```

의존성과 스크립트는 [package.json](package.json), 화면은 `src/pages/`, API 통신은 `src/shared/api/`에서 확인합니다.
2026-09-08 사이트에서는 Java 취약 파일의 원본 라인·탐지 출처·공격 시나리오·수정 방법 표시를 확인했습니다.
해당 소규모 시험의 성공을 전체 저장소 정확도 검증으로 해석하지 않습니다.

[이전 README](docs/history/README-before-20260914.md)는 초기 화면·API 구조 참고용으로 보존합니다.
