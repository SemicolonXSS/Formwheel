# Formwheel Social / Invite backend (배포 전 준비)

Cloud Functions callable API: claimHandle, findFriend, friendAction, createInviteRoom, sendInvite, respondInvite, mergeGuestPreview, awardVerifiedAchievement.

**중요**: 이 폴더는 커밋만 했으며 Firebase에 배포되지 않았습니다. Firebase 프로젝트의 기존 Realtime Database 규칙을 모르므로 **database.rules.json을 그대로 배포하면 기존 게임이 중단됩니다.** 반드시 현재 전체 규칙을 내보내고 social 하위 규칙만 병합한 뒤 에뮬레이터 검증을 수행하세요. 실제 운영에는 App Check, 요청 속도 제한, 보안·동시성·차단·익명 계정·로그아웃 테스트가 추가로 필요합니다.

- `inviteRooms`는 Formwheel Invite 전용 대기실이며 Spy, Battle 등의 실제 방과 아직 연동되지 않습니다.
- 경쟁 업적은 서버 검증 연동 전까지 의도적으로 지급이 차단됩니다.
- 게스트 병합은 소유권 증명을 구현하기 전까지 preview 전용입니다.
- 실제 Firebase Auth 사용자에게 친구/초대 알림 UI를 연결하는 프런트엔드 작업이 추가로 필요합니다.
- 새로운 Firebase rules 파일은 완성된 기존 전체 규칙이 아니며 병합 예시입니다.
