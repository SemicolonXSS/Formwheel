# Formwheel 보안 백엔드 준비 코드

상태: **코드 및 로컬 핵심 로직 테스트 준비됨. Firebase 운영 배포, App Check 설정, Rules Emulator 검증 및 기존 화면 전환은 아직 완료하지 않음.**

이 폴더의 Rules는 `/formwheelV2` 신규 스키마와 테스트용 기본 거부 정책입니다. 기존 모든 게임을 포함한 운영 Rules의 대체 파일로 즉시 배포하면 기존 경로가 차단됩니다. 현재 운영 Rules를 확보한 뒤 앱별 전환과 함께 통합하세요. 상위 경로에 `read/write: true`가 남아 있으면 하위 거부 Rules로 제한할 수 없습니다.

## 준비된 내용

- Firebase Auth UID 기반 사용자·방·지갑 경로, 사용자별 AI와 설문 응답 접근 모델.
- 퀴즈/배틀 정답은 `privateRooms`에 보관; callable 서버에서만 판정·점수·중복 제출 처리.
- 서버가 배정한 Spy 역할과 시민 제시어는 `privatePlayers/방/UID`만 읽도록 분리.
- 서버 투표 집계, 방장 시작/라운드 전환, 지갑 일일 지급·구매·장착·서버 추첨 동전 게임.
- Producer는 DB의 role 문자열이 아닌 Admin SDK가 발급한 `auth.token.producer` custom claim 검사. 클라이언트에서 claim 발급 불가.
- App Check 강제, 인증·참가자 검사 및 일부 요청 속도 제한. 정식 게임 전체 이동 검증과 모든 카지노 게임 서버화는 후속 전환 필요.

## 검증

```sh
node tests/core.test.cjs
npm install
npm run test:rules
```

첫 명령은 여기서 통과한 의존성 없는 핵심 로직 테스트입니다. 둘째·셋째는 Firebase Emulator 테스트이며 이 작업 환경에서는 실행하지 않았습니다. 테스트는 demo-formwheel 프로젝트와 127.0.0.1을 사용합니다. Java 및 Firebase CLI 요구사항을 설치 환경에서 확인하세요.

## 실제 적용 순서

1. 운영 데이터와 Rules를 백업하고 별도 staging 프로젝트를 준비합니다. 기존 공개 계정의 평문 비밀번호를 클라이언트로 재배포하지 않습니다.
2. staging에서 Email/Password·Google·Anonymous 제공자를 필요한 앱별로 켜고 GitHub Pages 도메인을 허용합니다. App Check 사이트 등록과 token 공급을 완료합니다.
3. functions 폴더에서 의존성을 설치하고 staging에 Functions와 Rules를 배포합니다. Producer claim은 신뢰할 수 있는 관리자 도구에서만 발급합니다.
4. 클라이언트를 신규 경로와 callable 응답으로 전환합니다. 현재 출시 화면은 legacy 또는 casinoV2 경로를 사용하므로 이 폴더만 배포해서는 보안이 적용되지 않습니다.
5. Rules Emulator에서 비회원·타 UID·방 외 사용자·위조 점수·이중 지급·역할 위조를 모두 검증합니다. 두 기기에서 중복/재접속 테스트를 진행합니다.
6. 운영 단계에서 앱별 경로를 옮긴 뒤 루트 공개 권한과 legacy 비밀번호 데이터를 닫습니다. 기존 Casino 계정은 소유 확인 후 서버에서 1회 이전하고, 검증 완료 후에만 비밀번호를 제거합니다. 자동 삭제나 자동 코인 이전은 수행하지 않았습니다.
7. 운영 검증이 끝난 항목만 Formwheel_Check에서 완료로 표시합니다.

## 공식 자료

- https://firebase.google.com/docs/database/security/core-syntax
- https://firebase.google.com/docs/database/security/rules-conditions
- https://firebase.google.com/docs/rules/unit-tests
- https://firebase.google.com/docs/functions/local-emulator
