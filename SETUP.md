# 로컬 실행 안내

이 저장소는 기존 서비스의 공개용 소스 복사본입니다. 원본 서비스의 데이터와 결제 키, Git 이력은 포함하지 않습니다. Node.js 24 LTS를 권장합니다(테스트에서 node:sqlite와 TypeScript 직접 실행 사용).

## 설치와 무료 기능 실행

저장소 폴더에서:

```sh
npm ci
npx wrangler d1 migrations apply DB --local --config wrangler.local.json
npm run dev
```

화면에 표시된 localhost 주소로 접속합니다. 로컬 DB는 실행 후 새로 만들어집니다. 로컬에서 만든 지도는 공개 서비스와 연결되지 않습니다.

## 선택: 테스트 결제

`.dev.vars.example`을 `.dev.vars`로 복사하고, 본인 토스페이먼츠 상점의 API 개별 연동 테스트 키를 입력한 뒤 서버를 다시 시작합니다. 키가 없으면 결제 기능은 비활성입니다. `.dev.vars`는 업로드하지 않습니다.

## 테스트

외부 결제와 개발 서버 없이 실행하는 분석·결제 테스트:

```sh
node --test tests/analysis.test.mjs tests/pair-analysis.test.mjs tests/payment.test.mjs tests/payment-routes.test.mjs
```

HTTP 테스트는 앞의 마이그레이션과 개발 서버 실행 후 별도 터미널에서 실행합니다. 테스트용 지도/친구 데이터가 로컬에 만들어질 수 있습니다.

```sh
node --test tests/maps.test.mjs tests/friends.test.mjs tests/management.test.mjs tests/payment-http.test.mjs
```

타입 검사와 빌드:

```sh
npx tsc --noEmit --allowImportingTsExtensions
npm run build
```

## 배포와 검증 범위

`.openai/hosting.json`에는 로컬 DB 바인딩만 남겼습니다. 원본 사이트의 project_id는 제거했습니다. 다른 환경에서 배포하려면 본인의 Sites 프로젝트 및 런타임 설정이 필요합니다. GitHub에 코드를 올리는 것만으로 서비스가 새로 배포되지는 않습니다.

기존 프로젝트에서의 테스트 기록은 README에 정리했습니다. 이 복사본을 대상으로 새 의존성 설치와 전체 실행을 다시 수행한 것은 아닙니다. 설치 도구의 버전·플랫폼 정책에 따른 추가 설정이 필요할 수 있습니다.
