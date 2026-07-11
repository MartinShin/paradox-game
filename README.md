# 선택의 역설 (Paradox Game)

알레의 역설(Allais Paradox)과 엘즈버그의 역설(Ellsberg Paradox)을 직접 체험해보는 의사결정 게임.

- Stage 1: 알레의 역설 - 두 번의 복권 선택 후, 선택의 모순을 시각적으로 해설
- Stage 2: 엘즈버그의 역설 - 두 항아리 내기 후, 모호성 회피를 시각적으로 해설
- 전체 참여자의 선택 분포를 실시간 집계해서 보여줌 (Upstash Redis)

## 기술 스택

- Next.js (App Router), basePath `/paradox`
- Upstash Redis (선택 집계)
- 배포: Vercel → https://www.shinhocheol.com/paradox

## 개발

```bash
npm install
npm run dev
# http://localhost:3000/paradox
```

집계 기능을 쓰려면 `.env.local`에 `UPSTASH_REDIS_REST_URL`+`UPSTASH_REDIS_REST_TOKEN`
(또는 `KV_REST_API_URL`+`KV_REST_API_TOKEN`) 설정.

- `/paradox/stats`: 프로젝터용 실시간 집계 현황판 (5초 자동 갱신)
- `/paradox/api/reset?key=<관리키>`: 집계 초기화 (키의 SHA-256 지문을 코드에서 대조)
