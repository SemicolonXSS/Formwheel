# PEAK WITNESS C · 배포 체크리스트

GitHub 코드 반영만으로 Firebase Cloud Functions와 Realtime Database Rules가 배포되지는 않습니다.

## 동작
- `functions/index.js`: `awardPeakWitness` RTDB 트리거가 `formwheelV2/liveHubSessions/{uid}` 변화를 확인합니다.
- 접속자의 Firebase UID를 중복 없이 집계하고 최근 5분 내 heartbeat를 유효하게 처리합니다.
- 서버가 이전 최고 기록(초기 기준 4명)을 초과한 경우에만 `formwheelV2/peakWitness/record`를 갱신합니다.
- 신기록 시점의 활성 UID별로 `formwheelV2/peakWitness/users/{uid}`에 일반 배지와 5/10/20/50/100명 특별 배지를 저장합니다.
- Hub와 AQS는 `assets/peak-witness.js`를 통해 읽기 전용 배지 기록을 표시합니다.
- 새 배지는 과거 기록에 소급 지급되지 않습니다. 게스트 기록은 익명 Firebase UID에 남으며 정식 계정 자동 병합은 아직 없습니다.

## 실제 활성화 전
1. **운영 Realtime Database Rules를 먼저 백업**하고 운영 경로와 대조합니다. 저장소의 `database.rules.json`은 다른 기능 경로를 포함하지 않는 제한적인 초안일 수 있으므로 **파일 전체를 그대로 배포하면 안 됩니다.**
2. 운영 규칙에 아래 신규 노드만 기존 정책을 보존하며 병합합니다. `record`는 공개 읽기/클라이언트 쓰기 금지, `users/$uid`는 본인 읽기/클라이언트 쓰기 금지입니다.
3. `liveHubSessions` 쓰기 권한이 로그인한 본인의 UID에만 제한되어 있는지 검증합니다. 그렇지 않으면 접속자 수를 위조할 수 있습니다.
4. Firebase Emulator에서 4→5→6명, 다중 탭, 중복 이벤트, 접속 종료, Rules의 타인 배지 쓰기 거부, 게스트, 5→10명 경계 상황을 검사합니다.
5. 검증 후 `awardPeakWitness` Cloud Function과 **병합한** Rules를 배포합니다. Functions 사용 가능 여부와 과금/쿼터는 Firebase 프로젝트 설정에 따라 달라집니다.
6. 실제 브라우저에서 Hub와 AQS 배지 표시 및 신기록 알림을 확인합니다.

## 주의
- 기록의 정확성은 Firebase Auth/Presence Rules와 서버 배포 상태에 의존합니다.
- 기존 클라이언트의 `livePeak` 표시는 그대로 유지됩니다. 새로운 배지 판정은 서버 소유의 `peakWitness/record`를 사용합니다.
- AQS에는 별도 배지 섹션으로 표시됩니다. 프로필 대표 배지 선택 및 게스트→정식 계정 이전은 후속 연동 사항입니다.
