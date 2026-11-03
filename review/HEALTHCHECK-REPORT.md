# FORMWHEEL — Firebase Rules 1차 건강검진 (검토 전용)

검사일: 2026-11-03
대상: Formwheel III 전체 Rules, Formwheel IV 전체 Rules, GitHub main database.rules.json.
경고: **이 파일은 미배포 후보이며 운영에 바로 적용하면 안 됩니다.**
원본 GitHub 파일은 그대로 유지되었습니다. 데이터베이스 기록을 조회/삭제/변경하지 않았습니다.

## 확인된 사실
- III 및 IV: 최상위 경로 57개, formwheelV2 25개 하위 섹션
- GitHub main: 최상위 경로 7개, formwheelV2 8개 섹션
- GitHub main에는 III/IV의 최상위 경로 50개와 formwheelV2의 섹션 17개가 누락
- 역으로 GitHub main의 syncRooms/$code 및 boardRooms/$code 세부 규칙은 III/IV에 없음
- GitHub main clickerLeaderboardSeason3 규칙은 IV와 달라 제출 간격·형식 검증 차이가 있음
- IV는 III에 비해 8개 유효성 검증 리프를 추가하고 3개 규칙을 변경
- 이번 후보는 IV 전체를 베이스로, GitHub의 syncRooms 및 boardRooms 섹션만 복원
- 사회 기능 socialFree에서는 GitHub/IV의 다수 쓰기 규칙이 다르므로 자동으로 합치지 않고 IV 유지
- Rapid 서버 지갑은 기존대로 client write=false로 보존. 별도 서버 전환 검증 필요
- 실시간 최고 동시접속 livePeak는 client write=false로 보존. 클라이언트의 갱신 시도는 계속 거부될 수 있음
- 공개 카운터는 관리자 또는 별도 신뢰 가능한 서버 자동화만 업데이트하는 정책 유지

## 배포 전 차단 조건
1. Firebase Emulator Rules unit 테스트: 익명/일반/관리자 경로별 허용·거부 시나리오 검증.
2. 모의 데이터 및 백업에서 기존 수십 개 프로젝트 읽기/쓰기 호환성 확인.
3. syncRooms/boardRooms 신규 개방 규칙의 동작 및 권한 경계 테스트.
4. socialFree handles/handleByUid/requests/sent 상호 참조 제약 테스트.
5. 클릭커 리더보드, 테마 동기화, 방문자 기록, 친구 요청 회귀 테스트.
6. 실제 운영 규칙과 현재 운영 데이터는 확인하지 않았으므로, 배포 전 운영 Rules 내보내기 후 차분 검사.
7. 데이터 전체 백업과 롤백 계획 준비.

## 정책
- 공개 전체 쓰기 금지.
- UID별 데이터는 본인 읽기/쓰기 원칙을 유지.
- 경제/보상 관련 신뢰 연산은 클라이언트에서 임의 수정 금지.
- 본 후보는 실제 운영 배포 또는 GitHub main 교체를 수행하지 않음.
