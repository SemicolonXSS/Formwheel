# Formwheel Realtime Database 통합 Rules — 운영 전 검토용

**상태: 초안 (PROPOSED) / Firebase 운영 미배포 / Rules Emulator 동작 검증 미완료.**

- 통합 JSON: [formwheel-combined.PROPOSED.rules.json](./formwheel-combined.PROPOSED.rules.json)
- 프로젝트의 기존 `database.rules.json`은 변경하지 않았습니다.
- Firebase Console의 **현재 운영 Rules를 조회하지 못했으므로**, 운영 규칙을 완전히 보존하는 자동 병합은 불가능합니다.

## 포함한 데이터 경로
- 기존 Github Rules: `formwheelV2/social`, 기념 배지, `questXP`, `hubCreatorSort`, `syncRooms`
- 기존 신규 보안 스키마: UID 기반 `formwheelV2/users`, `hubHomes`, `hubProfiles`, 서버 관리 `wallets` 등
- 계정 선택 UI: `formwheelV2/themePreferences`, `featuredBadges`, `achievementStats`
- `whiteboardRooms`: 생성, 참가 기록, 그리기, 본인 작업 취소, 방장 전체 삭제 및 좌표 검증
- `wikiV1`: 공개 위키, 관리자 UID, 비공개 제안 및 승인
- `aqs/v1/users/$uid`: UID별 동기화. **XP는 클라이언트 값이므로 보상이 서버 인증되었다는 뜻이 아닙니다.**
- `formwheelV2/liveHubSessions`·`visitorStats`: 자기 데이터 열람, 관리자 claim 기반 전체 열람
- `clickerLeaderboardSeason3`: `scoreKey` 인덱스를 사용한 공개 리더보드(상위 20명 쿼리), UID 소유자만 자기 기록 쓰기

## 배포하면 달라지는 동작 (중요)
기본은 `.read: false`, `.write: false`이며 **개별 게임의 이전 경로**(`battle`, `bombRooms`, `reflexRooms`, `spyRooms`, `timeRooms`, `pianoRooms`, `gcrown`, `chatRooms`, `formwheelMusic`, `data`, `quizzes`, `clickerLeaderboard` 등)는 스키마를 검증하지 못해 개방하지 않았습니다. **이 파일을 바로 운영 전체 Rules로 게시하면 해당 기능이 중단될 수 있습니다.**

방문자 전체 목록과 접속자 원시 세션은 개인정보 보호를 위해 다른 이용자에게 열어두지 않았습니다. 따라서 현재 허브의 공개 방문자/동접 카운터는 **서버 집계용 공개 요약 노드로 별도 전환하기 전까지 읽기 오류가 날 수 있습니다.**

Whiteboard는 방 코드가 일종의 초대 식별자일 뿐 강력한 접근 비밀번호가 아닙니다. 코드를 아는 인증 사용자는 방을 읽고 참여할 수 있습니다.

Clicker 시즌 3은 `clickerLeaderboardSeason3` 루트에 `.read: true`가 추가되어 **UID와 닉네임·점수가 공개 열람**됩니다. 주어진 규칙은 문자열 형식·사용자 UID만 검사하므로 **점수 위조, `scoreKey`와 `score` 불일치, 하루 1회 등록 제한 위반을 서버에서 막지 못합니다**. 실제 부정 점수 방지는 서버 판정 또는 검증 가능한 별도 백엔드로 전환해야 합니다.

AQS XP와 테마 선택 등 클라이언트 작성 값은 사용자 소유권만 제한하며 **서버가 정당성을 증명하는 값이 아닙니다**. 구매 소유권·경제 시스템·위조 방지는 서버 측 로직이 별도로 필요합니다.

## 적용 전에 해야 할 일
1. Firebase Console → Realtime Database → Rules의 **현재 전체 규칙을 백업**합니다.
2. 운영과 분리된 **staging 프로젝트**에 JSON을 붙여넣습니다.
3. Firebase Auth Anonymous/Google 및 허용 도메인을 확인합니다.
4. Firebase Rules Emulator에서 권한별 허용/거부 테스트를 수행합니다. 단순 JSON 검사만으로는 검증이 끝난 게 아닙니다.
5. 프로젝트별 과거 데이터 경로를 검토해 **각 게임의 실제 읽기·쓰기 구조와 소유권**에 맞는 규칙을 추가합니다. 무조건 `auth != null`로 전체 쓰기를 허용하지 않습니다.
6. 별도 기기 두 대로 Whiteboard·Wiki·Hub·SYNC와 주요 게임을 처음부터 끝까지 테스트합니다.
7. 정상 작동과 안전성이 확인된 이후에만 **운영 Rules**에 단계적으로 반영합니다.

GitHub Actions는 JSON 및 제한적인 정적 보안 구조만 검사합니다. 실제 Firebase 서버에 Rules를 배포하거나 Firebase Emulator를 실행하지 않습니다.
