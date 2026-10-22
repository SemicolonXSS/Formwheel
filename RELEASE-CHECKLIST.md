# Formwheel 운영·출시 확인표

목적: 신규 기능을 추가할 때에도 기존 프로젝트와 사용자 데이터가 안전하게 동작하는지 확인한다.
이 문서는 실제 배포 상태를 증명하지 않는다. 확인이 끝나기 전에는 완료로 표시하지 않는다.

## A. GitHub에서 자동 확인되는 항목

- [ ] Hub GitHub Actions의 Formwheel quality checks가 성공했는가?
- [ ] node scripts/check-syntax.cjs (JS 구문 및 상대경로)가 통과했는가?
- [ ] node scripts/check-hub-catalog.cjs (프로젝트 목록·링크·사이트맵)가 통과했는가?
- [ ] node firebase-security/tests/core.test.cjs (보안 핵심 로직 회귀 테스트)가 통과했는가?
- [ ] 변경한 각 독립 저장소에도 구문 검사와 가능한 경우 회귀 테스트를 실행했는가?
- [ ] 프로젝트 소개에 쓰인 규칙·인원·기능이 실제 UI와 일치하는가?

자동 테스트 성공은 Firebase 실서비스 Rules, 실제 멀티플레이, 모바일 호환성을 보장하지 않는다.

## B. 운영자가 Firebase Console에서 직접 확인해야 할 항목

**주의: 현재 운영 Realtime Database Rules 전체를 먼저 백업한다.** 저장소의 database.rules.json이나 개별 프로젝트의 rules.example.json 파일을 그대로 전체 붙여넣기 하면 기존 게임이 중단될 수 있다. 배포된 규칙의 실제 내용은 저장소 파일과 다를 수 있다.

- [ ] Firebase Console → Authentication → Sign-in method에서 사용하는 Anonymous / Google 로그인 방식이 활성화되어 있는가?
- [ ] Authorized domains에 실제 접속 호스트 semicolonxss.github.io가 있는가?
- [ ] Firebase Console → Realtime Database → Rules에서 운영 전체 규칙을 백업·검토했는가?
- [ ] 공개 루트에 광역 read/write 권한이 남아 있지 않은지 검토했는가? (변경 전에 기존 프로젝트 영향을 확인한다.)
- [ ] 타인 프로필·비공개 방·관리자 전용 데이터 등에 비인가 접근이 거절되는가?
- [ ] 정상 소유자는 필요한 데이터만 읽고 쓸 수 있는가?
- [ ] 점수·재화 등 신뢰가 필요한 값이 클라이언트 단독으로 임의 확정되지 않는가?
- [ ] 변경된 규칙은 Firebase Emulator / 별도 테스트 환경에서 검증한 뒤 운영에 적용했는가?

비밀번호나 확인 코드가 브라우저에 표시되지 않는다고 서버 접근이 보호되는 것은 아니다. privacy.html에 안내된 서버 데이터 삭제 요청 창구와 보관 기간도 확정할 필요가 있다.

## C. Whiteboard 공개 설정·2인 테스트

- [ ] GitHub 저장소 Formwheel_Whiteboard → Settings → Pages에서 main 브랜치의 / (root) 배포를 활성화했는가?
- [ ] 실제 페이지 URL https://semicolonxss.github.io/Formwheel_Whiteboard/ 가 열리는가?
- [ ] 해당 README의 whiteboardRooms 규칙을 운영 Rules 전체를 보존한 상태에서 병합·검증했는가?
- [ ] 서로 다른 브라우저/기기에서 같은 초대 링크로 입장해 실제 그림이 동기화되는가?
- [ ] 방장이 아닌 참가자가 허용되지 않은 관리 동작을 할 수 없는가?
- [ ] 새로고침 후 그림이 유지되고 PNG 다운로드가 가능한가?

## D. 최초 방문자 및 회귀 테스트

- [ ] 비로그인 상태의 첫 방문에서 허브가 정상적으로 보이는가?
- [ ] 스마트폰과 PC에서 시작 버튼을 누르면 실제 플레이가 되는가?
- [ ] 핵심 게임을 시작 → 진행 → 결과 → 재시작까지 확인했는가?
- [ ] 온라인 게임은 서로 다른 두 기기로 방 생성·참가·게임 종료·재입장을 확인했는가?
- [ ] 로그인 취소, 네트워크 끊김, 새로고침, 빈 검색결과에서 오류가 숨겨지지 않고 안내되는가?
- [ ] 이전 버전 캐시를 가진 기기에서도 새 화면이 정상 적용되는가?

추천 수동 우선 테스트: Reflex, Cook, Battle, Glitch, Paint. 각각 버그 수와 이탈 지점을 기록한다.

## E. 검색·분석·출시

- [ ] Search Console에서 https://semicolonxss.github.io/Formwheel/sitemap.xml 을 다시 확인했는가?
- [ ] 색인되지 않은 페이지는 페이지 접근·중복·canonical 문제를 확인했는가?
- [ ] 누적 방문자가 UID 기준 집계임을 이해하고, 실제 사람 수와 동일시하지 않는가?
- [ ] 프로젝트 열기 수와 게임 완료 수를 구분했는가?
- [ ] 첫 게임 시작률, 첫 게임 완료율, 일별 신규 방문, 재방문율을 가능한 범위에서 따로 측정하는가?
- [ ] 출시 후 오류 보고와 해결 상태를 기록했는가?

## 완료 기록

| 날짜 | 대상 | 자동 검사 | 실제 브라우저 테스트 | Firebase 운영 Rules 검증 | 담당 |
| --- | --- | --- | --- | --- | --- |
| (기록 필요) | (프로젝트) | (결과) | (결과) | (결과 또는 해당 없음) | (담당) |
