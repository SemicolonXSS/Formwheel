#!/usr/bin/env node
/**
 * Formwheel diagnostic log classifier (offline, read-only).
 * Usage: node scripts/diagnose-logs.mjs path/to/log.txt
 * Never upload logs containing personal information.
 */
import { readFileSync } from 'node:fs';

const rules = [
  {pattern:/permission_denied|permission denied/i, category:'Firebase 권한', advice:'Firebase Rules, 로그인 상태, 데이터 경로와 쓰기 권한을 확인하세요.'},
  {pattern:/SyntaxError|Unexpected token|Unexpected keyword/i, category:'JavaScript 문법', advice:'오류 파일의 줄 번호를 확인하고 node --check로 문법을 검사하세요.'},
  {pattern:/Failed to fetch|NetworkError|ERR_NETWORK/i, category:'네트워크', advice:'네트워크 상태, 요청 URL, CORS 설정을 확인하세요.'},
  {pattern:/404|Not Found/i, category:'리소스 누락', advice:'배포 경로와 파일명 대소문자를 확인하세요.'},
  {pattern:/QuotaExceeded|quota exceeded/i, category:'저장 공간', advice:'브라우저 저장 공간 또는 서비스 할당량을 확인하세요.'}
];
const path = process.argv[2];
if (!path || process.argv.length !== 3) {
  console.error('Usage: node scripts/diagnose-logs.mjs <log-file>');
  process.exitCode = 2;
} else {
  try {
    const content = readFileSync(path, 'utf8');
    const lines = content.split(/\r?\n/).slice(0, 10000);
    const summary = rules.map(rule => {
      const hits = lines.filter(line => rule.pattern.test(line));
      return {category:rule.category, count:hits.length, advice:rule.advice};
    }).filter(item => item.count);
    console.log(JSON.stringify({scannedLines:lines.length, findings:summary}, null, 2));
  } catch (error) {
    console.error('Unable to read log:', error.code || 'UNKNOWN');
    process.exitCode = 1;
  }
}
