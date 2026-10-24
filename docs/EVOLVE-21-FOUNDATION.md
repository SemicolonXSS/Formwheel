# EVOLVE 21 — FOUNDATION (안전 도입 설계)

상태: 개발 준비용 문서 / 운영 Firebase Rules 및 데이터 **변경 없음**.

## 확정 원칙
- 기본 MY SPACE 방 1개, 최대 3개를 초기 목표로 제안(추가 확정 필요).
- 추가 방: Evolve 레벨 충족 + Rapid 정식 결제 검증 후 영구 해금(잠정 기본안).
- 공식 성장 XP는 서버에서 검증된 고유 이벤트만 지급; 기존 AQS XP는 유지.
- 방에서 가구 제거 시 개별 소유권을 유지하고 배치 참조만 제거.
- CREATOR는 작성자 초안 관리, 승인/게시 전환은 관리자 서버만.

## 기존 시스템의 주의점
- `shared/account-rapid-sync.js`: beta 지갑을 클라이언트 기준 '최고 잔액'으로 동기화. 공식 구매·보상 계산에 신뢰할 수 없음.
- `shared/rapid-extras.js`: 브라우저 저장을 사용하는 베타 꾸미기 아이템. 소유권을 곧바로 공식 인벤토리로 인정하지 않음.
- `party.html`: `formwheelParty/v1/rooms`에 클라이언트 트랜잭션; 서버 Rules 확인 및 별도 권한 검증 필요.
- AQS `aqs/v1/users/{uid}`: 기존 데이터 및 버전 보존. XP 자동 이관/재계산 금지.
- 기존 로컬/클라우드 값 병합 전 원본 별도 백업. 동일 키를 임의 덮어쓰지 않음.

## 제안 데이터 영역 (운영 생성 금지)
```text
evolve/v1/users/{uid}/spaces/room_1
 evolve/v1/users/{uid}/inventory/{instanceId}
 evolve/v1/users/{uid}/unlockLedger/{unlockId}
evolve/v1/progression/{uid}/totalXp
evolve/v1/progression/{uid}/mastery/{projectId}
evolve/v1/processedEvents/{uid}/{eventId}
evolve/v1/creatorDrafts/{uid}/{draftId}
evolve/v1/published/{contentId}
```
실제 규칙은 서버 측 권한 처리 방식에 맞춰 재설계. 위 경로는 구현 약속이나 배포된 DB가 아님.

## 필수 보안 체크리스트
- [ ] 운영 Rules 원문 관리자 권한으로 조회하여 SHA-256 및 읽기 전용 백업
- [ ] 운영 데이터 내 주요 경로 샘플을 개인 정보 최소화 방식으로 백업; 복구 절차 검증
- [ ] Firebase Emulator 격리 환경 구성 (운영 DB 연결 금지)
- [ ] 비로그인 / 익명 / 소유자 / 타인 / 관리자 권한 분리 테스트
- [ ] 클라이언트가 XP, Rapid 잔액, 구매·아이템 소유권 및 관리자 권한을 임의 조작하면 거부
- [ ] MY SPACE 인벤토리 소유권과 배치 좌표·회전·충돌·80개 제한 검증
- [ ] 중복 eventId 재처리, 네트워크 재시도, 동시 구매에 대한 원자성 및 중복 차감 방지
- [ ] 승인되지 않은 사용자 제작 콘텐츠의 공개/승인 변경 차단
- [ ] 기존 AQS·Hub·Battle·Clicker·Party 기능의 읽기/쓰기 회귀 테스트
- [ ] 테스트 통과 후 작은 범위 단계적 적용, 오류 모니터링 및 롤백 준비

## 21탄 종료 게이트
보안 검증 결과, 실제 운영 규칙과의 호환, 데이터 복원 실험이 확인되기 전 **운영 Rules 변경 금지**. 본 문서는 첫 단계이며, Emulator 검증 결과를 대신하지 않음.
