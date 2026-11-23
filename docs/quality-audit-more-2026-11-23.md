# Formwheel 추가 300건 수정 · 2026-11-23

기존 Hub PR #27의 552건에 이어 **추가 300건**을 수정했습니다. 이번에는 Hub와 연결된 앱까지 포함한 21개 저장소를 확인했습니다. 수치는 요소·규칙별 오류 발생 건수이며 서로 다른 근본 원인이 300개라는 뜻은 아닙니다. 예를 들어 Music의 건반 36개는 하나의 공통 구현을 고쳐 함께 해결했습니다.

Hub 수정은 이전 PR #27을 기준으로 하는 후속 변경이며, 각 앱의 수정은 아래 저장소별 초안 PR에 있습니다. 운영 배포와 main 병합은 수행하지 않았습니다.

## 구체적인 동작 변경

- Quest는 저장소 읽기/쓰기가 차단돼도 미션 카드 3개를 표시하고 저장 실패를 알립니다. 손상된 기준 기록과 이력 객체도 정규화합니다.
- Secret은 접기 설정을 읽거나 저장하지 못해도 도감 38개를 계속 표시하고 접기/펼치기가 작동합니다.
- Tool은 `null`, 객체, 잘못된 원소가 섞인 할 일 저장값을 안전하게 읽고 유효한 항목을 보존합니다. 다른 도구 초기화도 이어집니다. 할 일 체크박스와 동적으로 생성되는 수학 입력 라벨을 연결했습니다.
- Music 작곡 건반 36개를 네이티브 버튼으로 바꾸고 Enter/Space 선택·해제와 `aria-pressed` 상태를 제공합니다. 배치와 기존 작곡 데이터 형식은 유지합니다.
- Hub 간편 보기에는 실제 본문 영역을 제공하며, 구매한 테마의 어두운 배경·행동 링크에서 글자가 사라지던 대비를 수정했습니다.
- 앱별 기존 라벨을 실제 입력에 연결하고, 생성되는 질문/선택지 이름, 본문 바로가기 대상, 제목 단계, 영역 이름과 낮은 글자 대비를 보완했습니다.

## 중복을 제외한 집계

| 검증 기준 | 새 발생 건 |
| --- | ---: |
| 앱의 axe 오류 | 180 |
| 기존 axe 이름 오류와 겹치지 않는 정적 입력 라벨 연결 | 48 |
| 이전 기록과 겹치지 않는 테마 대비 오류 | 19 |
| 간편 보기의 본문/영역 오류 | 12 |
| 저장 복구·생성 입력 라벨·건반 키보드 조작 | 41 |
| 합계 | **300** |

같은 요소가 여러 화면이나 테마에서 반복 검출되면 한 번만 셌습니다. 기본 화면에서 이미 고쳤던 Hub 요소는 제외했고, 푸터의 `nth-child` 선택자가 달라진 경우도 정규화해 중복 3건을 추가로 제외했습니다. 동일 요소의 서로 다른 규칙 위반은 별도 발생 건일 수 있습니다. 전체 대상·수정 전 상태·기준 커밋·검증 설명은 [JSON 기록](quality-audit-more-2026-11-23.json)에 있습니다.

## 저장소별 수정본

| 저장소 | 새 발생 건 | PR |
| --- | ---: | --- |
| Formwheel Hub | 33 | 이전 #27에 기반한 이 후속 PR |
| Formwheel_AI | 13 | [#1](https://github.com/SemicolonXSS/Formwheel_AI/pull/1) |
| Formwheel_Animation | 4 | [#1](https://github.com/SemicolonXSS/Formwheel_Animation/pull/1) |
| Formwheel_Balance | 5 | [#1](https://github.com/SemicolonXSS/Formwheel_Balance/pull/1) |
| Formwheel_Chat | 13 | [#1](https://github.com/SemicolonXSS/Formwheel_Chat/pull/1) |
| Formwheel_Check | 10 | [#1](https://github.com/SemicolonXSS/Formwheel_Check/pull/1) |
| Formwheel_Cook | 11 | [#1](https://github.com/SemicolonXSS/Formwheel_Cook/pull/1) |
| Formwheel_Decode | 16 | [#1](https://github.com/SemicolonXSS/Formwheel_Decode/pull/1) |
| Formwheel_Edit | 7 | [#1](https://github.com/SemicolonXSS/Formwheel_Edit/pull/1) |
| Formwheel_Form | 9 | [#1](https://github.com/SemicolonXSS/Formwheel_Form/pull/1) |
| Formwheel_Maze | 1 | [#1](https://github.com/SemicolonXSS/Formwheel_Maze/pull/1) |
| Formwheel_Music | 53 | [#1](https://github.com/SemicolonXSS/Formwheel_Music/pull/1) |
| Formwheel_Note | 5 | [#1](https://github.com/SemicolonXSS/Formwheel_Note/pull/1) |
| Formwheel_Piano | 20 | [#1](https://github.com/SemicolonXSS/Formwheel_Piano/pull/1) |
| Formwheel_Quiz | 4 | [#1](https://github.com/SemicolonXSS/Formwheel_Quiz/pull/1) |
| Formwheel_Story | 1 | [#1](https://github.com/SemicolonXSS/Formwheel_Story/pull/1) |
| Formwheel_Tool | 49 | [#1](https://github.com/SemicolonXSS/Formwheel_Tool/pull/1) |
| Formwheel_Vault | 8 | [#1](https://github.com/SemicolonXSS/Formwheel_Vault/pull/1) |
| Formwheel_Vote | 7 | [#1](https://github.com/SemicolonXSS/Formwheel_Vote/pull/1) |
| Formwheel_Wheel | 28 | [#1](https://github.com/SemicolonXSS/Formwheel_Wheel/pull/1) |
| Formwheel_Whiteboard | 3 | [#1](https://github.com/SemicolonXSS/Formwheel_Whiteboard/pull/1) |

## 검증

- 앱 화면 상태 54개 × PC/모바일 2개 너비 = **108개 조합**에서 axe 재검사 오류 0건.
- 기존 Hub 주요 28페이지 × 2개 너비 = **56개 조합**과 기존 브라우저 smoke 3개 시나리오 통과.
- 새 브라우저 회귀 검사에서 저장소 접근 거부/쓰기 실패, 다섯 테마, 간편 보기 전환, 세 종류의 손상된 할 일, 생성 라벨 클릭과 36개 건반의 Enter/Space 선택·해제를 확인했습니다.
- 원본에서 Quest/Secret 카드가 0개로 멈추는 상태, Tool의 초기화 예외, 건반 36개의 `DIV`/`tabIndex=-1` 상태를 먼저 기록하고 수정 후 비교했습니다.
- 정적 입력 검사에서 누락 라벨 94개를 수정했습니다. 기존 axe 이름 오류와 겹친 항목은 중복 집계하지 않았습니다.
- 변경 저장소의 JavaScript 구문, 사용 가능한 기존 회귀 검사와 `git diff --check` 통과. Hub 카탈로그·사이트맵·바로가기 및 기존 Node 회귀 검사도 통과했습니다.
- Music 편집기, 어두운 Hub 테마, 모바일 Tool/Wheel 화면을 확인했습니다.

확장 회귀 검사 재현:

```sh
# Hub, Tool, Music을 형제 디렉터리에 체크아웃한 후 Hub에서 실행
npm install --no-save --no-package-lock --ignore-scripts playwright@1 @axe-core/playwright@4
npx playwright install chromium
node tests/extended-regression.cjs
```

다른 경로에는 `FW_ECOSYSTEM_ROOT`를 지정할 수 있습니다. 설치된 Chromium은 `FORMWHEEL_CHROMIUM_PATH`로 선택합니다. GitHub Actions는 아래 검증 커밋의 Tool/Music을 체크아웃하므로 PR 브랜치 삭제에 영향을 받지 않습니다.

- Formwheel_Tool: `e8c936367cfe14f65d15af236b596405a335db43`
- Formwheel_Music: `0c860fc7bfb82b7d94d78f3a59c6c0c44f4e403f`

Firebase 외부 읽기/쓰기를 차단한 공개 UI·로컬 기능 검사입니다. 운영 로그인·멀티플레이·서버 권한·실제 저장 데이터 마이그레이션을 검증하거나 변경한 결과는 아닙니다. 사용자 저장 데이터 형식과 Rules를 유지했으며, 각 PR의 커밋을 되돌리면 해당 UI 변경을 복원할 수 있습니다.
