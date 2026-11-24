# Formwheel 추가 300건 수정 · 2026-11-24

앞선 PR #27·#28과 겹치지 않는 앱 25개를 점검하고, 수정이 필요한 22개 저장소에 초안 PR을 만들었습니다. Hub의 공용 배지 제목 구조도 함께 수정했습니다.

## 집계 기준

300건은 **저장소·파일·규칙·대상 요소 기준의 발생 건수**입니다. 공통 원인이 여러 요소에 적용되는 항목을 포함하며, 독립적인 로직 버그 300개라는 뜻은 아닙니다. 반복 모드와 데스크톱/모바일의 같은 요소는 한 번만 셌습니다. ARIA 탭의 active 선택자는 실제 data-tab으로 정규화했습니다.

- axe WCAG 관련 요소/규칙 259건: 대비 199, 표시 글자와 접근성 이름 불일치 25, 이름 없는 버튼 20, select 이름 5, 잘못된 ARIA 9, 베팅 입력 이름 1.
- 정적 폼 레이블 연결 31건: 원래 34건 중 axe와 중복되는 Spy select 3건 제외.
- 이름을 붙일 수 없는 일반 요소의 의미 구조 7건: region/group/img로 올바르게 노출.
- GCrown 모드 카드 키보드 조작 2건, Button 손상된 업적 값 복구 1건.

본문 랜드마크·공지 영역·제목 순서 등 best-practice 보조 개선과 Reflex의 오래된 테스트 목 수정은 300건에 넣지 않았습니다. 허용되는 canvas 이름에 대한 정적 도구의 권고 2건은 남겼고 수정 건수에서 제외했습니다.

## 주요 동작

Button은 업적 저장값이 null·배열·숫자·불리언·문자열이어도 결과 처리를 마치고 정상 업적 객체로 저장합니다. 기존 gold 업적은 보존합니다. GCrown은 두 모드 카드를 Enter/Space로 열 수 있고, 튜토리얼 빈 칸은 좌표와 내용으로 읽힙니다. AQS는 좌우 화살표·Home·End로 선택 탭과 패널 제목·포커스가 함께 바뀝니다. Territory와 Glitch 칸의 이름에는 표시 숫자를 포함했습니다.

## 검증

- 68개 UI 상태 × 1280px/390px = **136회 검사**, axe 위반 0·페이지 오류 0.
- 65개 수정 전 상태의 실패와 300개별 근거는 [JSON 목록](quality-audit-third-2026-11-24.json)에 기록.
- 정적 폼 누락 이름 **34 → 0**. 변경 앱 JavaScript 30개 블록/파일 구문 및 diff 공백 검사 통과.
- 앱 회귀 테스트 11개 파일 통과: Casino 경제·멱등성, Marble 물리/배틀, Button 저장값, GCrown 보드·점수, Spy 참가/탭 정체성, Clicker 순위, Time 재시작, Bomb 만료, Reflex 참가·재입장·호스트 인계.
- Button 새 테스트는 수정 전 함수에서 TypeError로 실패하고 수정 후 통과. 기존 업적 보존 및 저장소 읽기/쓰기 거부도 확인.
- Hub 구문/카탈로그/키보드 본문 이동, 11개 회귀 테스트 파일, 현지화·테마 및 보안 코어 검사 통과.
- 브라우저는 루프백 파일과 캐시한 공개 Firebase SDK만 사용했습니다. 외부 HTTP·WebSocket·서비스 워커를 차단했습니다. 서버 권한과 실시간 온라인 대전 검증은 이번 UI 검사의 범위 밖입니다.

## 저장소별 결과

| 저장소 | 300건 중 발생 수 | 초안 PR |
|---|---:|---|
| Formwheel_Wiki | 20 | [PR](https://github.com/SemicolonXSS/Formwheel_Wiki/pull/1) |
| Formwheel_Mix | 0 | 수정 불필요 |
| Formwheel_Casino | 10 | [PR](https://github.com/SemicolonXSS/Formwheel_Casino/pull/1) |
| Formwheel_Territory | 13 | [PR](https://github.com/SemicolonXSS/Formwheel_Territory/pull/1) |
| Formwheel_Marble | 13 | [PR](https://github.com/SemicolonXSS/Formwheel_Marble/pull/1) |
| Formwheel_Button | 13 | [PR](https://github.com/SemicolonXSS/Formwheel_Button/pull/1) |
| Formwheel_GCrown | 40 | [PR](https://github.com/SemicolonXSS/Formwheel_GCrown/pull/1) |
| Formwheel_PVP | 0 | 수정 불필요 |
| Formwheel_WheelB | 0 | [PR](https://github.com/SemicolonXSS/Formwheel_WheelB/pull/1) |
| Formwheel_Spotlight | 10 | [PR](https://github.com/SemicolonXSS/Formwheel_Spotlight/pull/1) |
| Formwheel_Battle | 1 | [PR](https://github.com/SemicolonXSS/Formwheel_Battle/pull/1) |
| Formwheel_Scribble | 3 | [PR](https://github.com/SemicolonXSS/Formwheel_Scribble/pull/2) |
| Formwheel_Risk | 2 | [PR](https://github.com/SemicolonXSS/Formwheel_Risk/pull/1) |
| Formwheel_AQS | 76 | [PR](https://github.com/SemicolonXSS/Formwheel_AQS/pull/1) |
| Formwheel_Spy | 12 | [PR](https://github.com/SemicolonXSS/Formwheel_Spy/pull/1) |
| Formwheel_Glitch | 14 | [PR](https://github.com/SemicolonXSS/Formwheel_Glitch/pull/1) |
| Formwheel_Ruletory | 1 | [PR](https://github.com/SemicolonXSS/Formwheel_Ruletory/pull/1) |
| Formwheel_Clicker | 45 | [PR](https://github.com/SemicolonXSS/Formwheel_Clicker/pull/1) |
| Formwheel_Time | 2 | [PR](https://github.com/SemicolonXSS/Formwheel_Time/pull/1) |
| Formwheel_Fate | 3 | [PR](https://github.com/SemicolonXSS/Formwheel_Fate/pull/1) |
| Formwheel_Sync | 0 | 수정 불필요 |
| Formwheel_DiceDuel | 5 | [PR](https://github.com/SemicolonXSS/Formwheel_DiceDuel/pull/1) |
| Formwheel_LEEHWMROF | 2 | [PR](https://github.com/SemicolonXSS/Formwheel_LEEHWMROF/pull/1) |
| Formwheel_Bomb | 6 | [PR](https://github.com/SemicolonXSS/Formwheel_Bomb/pull/1) |
| Formwheel_Reflex | 9 | [PR](https://github.com/SemicolonXSS/Formwheel_Reflex/pull/1) |

WheelB의 0건은 집계에서 제외한 공지 랜드마크 보조 개선만 있는 경우입니다. 모든 수정본의 커밋과 트리는 JSON에 고정했습니다.

## 재실행

```sh
python3 scripts/prepare-third-audit.py ecosystem-third
FW_ECOSYSTEM_ROOT="$PWD/ecosystem-third" node tests/third-accessibility.cjs
FW_ECOSYSTEM_ROOT="$PWD/ecosystem-third" FW_VIEWPORT=390 node tests/third-accessibility.cjs
```

Node 22+, Python 3, Playwright와 @axe-core/playwright 및 Chromium이 필요합니다. 준비 스크립트는 고정 커밋의 공개 저장소와 공개 SDK 코드만 내려받습니다. 새 CI 작업에도 같은 절차를 연결했습니다. 이 PR은 #28의 브랜치를 기반으로 쌓았으며, 운영 배포는 수행하지 않았습니다.
