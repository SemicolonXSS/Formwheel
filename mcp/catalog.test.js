import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCatalog, searchProjects, chooseProject } from './catalog.js';

const markdown = `### 🎮 게임
| 프로젝트 | 소개 | 실행 |
| --- | --- | --- |
| Reflex | 반응 속도 | [열기](https://semicolonxss.github.io/Formwheel_Reflex/) |
| Casino | 미니게임 | [열기](https://semicolonxss.github.io/Formwheel_Casino/) |
| Offsite | Fake | [열기](https://example.com/) |
### 🛠️ 제작 도구 · 앱
| Wheel | 랜덤 선택 | [열기](https://semicolonxss.github.io/Formwheel_Wheel/) |
`;
test('parses official game and tool links only and excludes restricted projects', () => {
  const result = parseCatalog(markdown);
  assert.deepEqual(result.map(p => p.name), ['Reflex', 'Wheel']);
  assert.equal(searchProjects(result, '반응')[0].name, 'Reflex');
  assert.equal(searchProjects(result, '', 'tool').length, 1);
  assert.equal(chooseProject([], 'all'), null);
});
