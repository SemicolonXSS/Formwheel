# Formwheel 추가 500건 요청 · 523건 수정

목표 500건을 넘겨 **523건의 요소·규칙 발생 사례**를 수정했습니다. Hub와 앱 46개의 현재 수정본을 기준으로 검사했습니다. 실제 소스 변경은 Hub와 앱 17개 저장소에 있으며, 여러 앱은 Hub 공용 CSS/JavaScript 수정으로 함께 해소됩니다.

## 집계와 범위

| 종류 | 발생 수 |
|---|---:|
| 글자 대비 | 135 |
| 입력칸 경계 대비 | 235 |
| 활성 게임판 칸 경계 대비 | 145 |
| 튜토리얼에 가려지는 공유 버튼 | 7 |
| 키보드 접근이 빠진 스크롤 영역 | 1 |
| 합계 | **523** |

독립적인 로직 버그 523개라는 뜻은 아닙니다. 하나의 공통 원인이 여러 요소에 적용될 수 있습니다. 저장소·파일·규칙·대상 요소가 같은 사례는 테마, 반복 화면과 뷰포트가 달라도 한 번만 셌습니다. 앞선 세 보고서와 같은 규칙·대상도 집계에서 제외했습니다. 재검사 중 보완한 GCrown 데스크톱 제목과 포커스 링은 새 건수에 더하지 않았습니다.

axe의 WCAG 관련 검사 143건과 추가 경계 대비 검사 380건을 구분합니다. 경계 검사는 배경과 섞이는 작성자 지정 입력칸, 활성 보드 칸을 3:1 기준으로 확인합니다. 입력칸의 채움 또는 테두리 중 하나가 주변 배경과 구별되면 통과합니다. 보드 칸은 이웃 칸 색 차이나 공유 경계선이 양쪽 채움과 구별되는지 확인하며, 여러 변이 실패해도 한 칸당 한 번만 셉니다. 브라우저 기본 inset/outset 모양, 비활성/읽기 전용 요소, 그림자·그라데이션처럼 이 계산으로 단정하기 어려운 사례는 제외했습니다.

## 실제 변경

- 공용 입력칸 스타일로 동적으로 생성되는 필드까지 경계를 보강하고, 기존 outline 제거 규칙이 있어도 키보드 포커스가 보이게 했습니다.
- 체스와 Sudoku는 판 크기와 조작 방식을 유지하면서 칸 사이 선을 구별하기 쉽게 했습니다.
- 미획득 업적 카드의 본문까지 흐리게 하던 투명도를 제거했습니다. 잠금/미획득 표시는 유지합니다.
- 테마의 어두운 바깥 배경 위에 검은 제목이 놓이던 앱에 읽을 수 있는 콘텐츠 면을 적용했습니다. 어두운 동영상 미리보기 영역은 자체 글자색을 사용합니다.
- 기존 공유 버튼과 튜토리얼 버튼을 한 빠른 동작 영역에 배치해 가림을 해소했습니다. 버튼의 기존 이벤트 처리와 키보드 실행을 보존합니다.
- Pixel War 스크롤 영역에 이름과 키보드 진입점을 추가했습니다.

## 검증 결과

- 기본 페이지 139개, Tool 내부 화면 25개, 테마를 지원하는 앱 29개 × 3개 테마 = **251개 상태**.
- 1280px와 390px에서 총 **502회** 검사: axe 위반 0, 추가 경계 검사 실패 0, 페이지 오류 0. 데스크톱 전체 실행에서 발견한 GCrown 제목은 기본 화면과 3개 테마를 재검사해 모두 통과했습니다.
- 320/390/1280px에서 실제 공유 버튼 클릭 영역·Enter 실행·튜토리얼 배치, 픽셀 보드 방향키 스크롤, 입력칸 키보드 포커스 등 **26개 조작 상태** 통과.
- 앱 회귀 테스트 **19개 파일**, Hub 회귀 테스트 **11개 파일** 통과. Hub 구문·자산·카탈로그·본문 이동·현지화/테마·보안 코어 및 규칙 구조 검사 통과.
- 새 준비 스크립트로 앱 **46개 고정 커밋**과 공개 SDK **35개 파일**을 실제로 다시 내려받았습니다. SDK 바이트는 검증에 사용한 캐시와 모두 같습니다.
- 앱 17개의 공개된 PR 트리가 로컬 검사 소스와 일치함을 확인했습니다. 모바일 체스판·타이머·테마 화면도 시각적으로 확인했습니다.

SNS 이동용 페이지 4개는 도착 화면과 중복되어 별도 집계하지 않습니다. Secret 제작소의 사용자가 작성하는 격리 iframe 내용은 axe에서 제외하며, 주변 제작소 UI와 필드는 검사합니다. 테스트 브라우저는 외부 HTTP·WebSocket과 서비스 워커를 차단하고, 로컬 자산 및 캐시한 공개 SDK만 사용합니다. 실제 로그인·온라인 대전·운영 데이터베이스 검증이나 배포를 수행한 것은 아닙니다.

## 저장소별 결과

| 저장소 | 발생 수 | 반영 위치 |
|---|---:|---|
| Formwheel | 344 | 이 Hub 통합 PR |
| Formwheel_AI | 4 | [초안 PR](https://github.com/SemicolonXSS/Formwheel_AI/pull/2) |
| Formwheel_Animation | 3 | [초안 PR](https://github.com/SemicolonXSS/Formwheel_Animation/pull/2) |
| Formwheel_Balance | 3 | Hub 공용 수정 |
| Formwheel_Battle | 2 | Hub 공용 수정 |
| Formwheel_Bomb | 5 | Hub 공용 수정 |
| Formwheel_Casino | 4 | [초안 PR](https://github.com/SemicolonXSS/Formwheel_Casino/pull/2) |
| Formwheel_Chat | 2 | Hub 공용 수정 |
| Formwheel_Check | 5 | Hub 공용 수정 |
| Formwheel_Clicker | 8 | [초안 PR](https://github.com/SemicolonXSS/Formwheel_Clicker/pull/2) |
| Formwheel_Cook | 4 | [초안 PR](https://github.com/SemicolonXSS/Formwheel_Cook/pull/2) |
| Formwheel_Decode | 6 | Hub 공용 수정 |
| Formwheel_DiceDuel | 2 | Hub 공용 수정 |
| Formwheel_Fate | 3 | Hub 공용 수정 |
| Formwheel_Form | 8 | Hub 공용 수정 |
| Formwheel_GCrown | 1 | Hub 공용 수정 |
| Formwheel_LEEHWMROF | 1 | [초안 PR](https://github.com/SemicolonXSS/Formwheel_LEEHWMROF/pull/2) |
| Formwheel_Marble | 4 | [초안 PR](https://github.com/SemicolonXSS/Formwheel_Marble/pull/2) |
| Formwheel_Maze | 2 | [초안 PR](https://github.com/SemicolonXSS/Formwheel_Maze/pull/2) |
| Formwheel_Music | 7 | [초안 PR](https://github.com/SemicolonXSS/Formwheel_Music/pull/2) |
| Formwheel_Note | 5 | [초안 PR](https://github.com/SemicolonXSS/Formwheel_Note/pull/2) |
| Formwheel_PVP | 5 | [초안 PR](https://github.com/SemicolonXSS/Formwheel_PVP/pull/1) |
| Formwheel_Paint | 3 | [초안 PR](https://github.com/SemicolonXSS/Formwheel_Paint/pull/2) |
| Formwheel_Piano | 2 | Hub 공용 수정 |
| Formwheel_Quiz | 4 | [초안 PR](https://github.com/SemicolonXSS/Formwheel_Quiz/pull/2) |
| Formwheel_Reflex | 1 | Hub 공용 수정 |
| Formwheel_Risk | 5 | Hub 공용 수정 |
| Formwheel_Spy | 6 | Hub 공용 수정 |
| Formwheel_Sync | 3 | Hub 공용 수정 |
| Formwheel_Territory | 3 | [초안 PR](https://github.com/SemicolonXSS/Formwheel_Territory/pull/2) |
| Formwheel_Time | 1 | Hub 공용 수정 |
| Formwheel_Tool | 37 | Hub 공용 수정 |
| Formwheel_Vault | 4 | Hub 공용 수정 |
| Formwheel_Vote | 4 | Hub 공용 수정 |
| Formwheel_Wheel | 17 | [초안 PR](https://github.com/SemicolonXSS/Formwheel_Wheel/pull/2) |
| Formwheel_WheelB | 1 | Hub 공용 수정 |
| Formwheel_Whiteboard | 3 | [초안 PR](https://github.com/SemicolonXSS/Formwheel_Whiteboard/pull/2) |
| Formwheel_Wiki | 1 | [초안 PR](https://github.com/SemicolonXSS/Formwheel_Wiki/pull/2) |

앱 PR은 각 이전 수정 브랜치를 기준으로 쌓았습니다. **Hub의 공용 스타일/스크립트를 먼저 반영한 뒤 앱 PR을 함께 반영**해야 합니다. 기준 커밋, 수정 커밋·트리 및 523개 사례의 수정 전 증거는 [JSON 목록](quality-audit-500-2026-11-24.json)에 있습니다.

## 재실행

```sh
python3 scripts/prepare-expanded-audit.py ecosystem-expanded
FW_ECOSYSTEM_ROOT="$PWD/ecosystem-expanded" node tests/expanded-audit.cjs
FW_ECOSYSTEM_ROOT="$PWD/ecosystem-expanded" FW_VIEWPORT=390 node tests/expanded-audit.cjs
FW_ECOSYSTEM_ROOT="$PWD/ecosystem-expanded" node tests/floating-actions.cjs
```

Node 22+, Python 3, Playwright 및 @axe-core/playwright와 Chromium이 필요합니다. CI는 1280px/390px 매트릭스로 같은 검사를 실행합니다. 이 Hub PR은 #29 브랜치 위에 쌓았으며 운영 배포는 수행하지 않았습니다.

개별 수정 전 근거: [FW500-001–FW500-100](quality-audit-500-2026-11-24-part1.json) · [FW500-101–FW500-200](quality-audit-500-2026-11-24-part2.json) · [FW500-201–FW500-300](quality-audit-500-2026-11-24-part3.json) · [FW500-301–FW500-400](quality-audit-500-2026-11-24-part4.json) · [FW500-401–FW500-500](quality-audit-500-2026-11-24-part5.json) · [FW500-501–FW500-523](quality-audit-500-2026-11-24-part6.json)

CI 후속 보완(추가 건수 제외): Ubuntu 26.04/Chrome 159에서 프로필의 두 접기 제목이 21px로 렌더링되어 조작 영역 검사에 실패했습니다. 제목의 최소 높이를 32px로 보장하도록 수정했습니다.
