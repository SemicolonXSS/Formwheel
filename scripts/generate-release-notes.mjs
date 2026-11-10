#!/usr/bin/env node
/**
 * Formwheel release note draft generator.
 * Read-only: reads local git history and prints Markdown to stdout.
 * Usage: node scripts/generate-release-notes.mjs [base-ref] [head-ref]
 */
import { execFileSync } from 'node:child_process';

const [base, head = 'HEAD'] = process.argv.slice(2);
const safeRef = (ref) => /^[A-Za-z0-9_./^~@{}-]+$/.test(ref) && !ref.startsWith('-');
if ((base && !safeRef(base)) || !safeRef(head)) {
  console.error('Invalid git ref');
  process.exitCode = 2;
} else {
  try {
    const range = base ? `${base}..${head}` : head;
    const log = execFileSync('git', ['log', '--no-merges', '--format=%s', '-n', '100', range], { encoding: 'utf8', maxBuffer: 1024 * 1024 });
    const commits = [...new Set(log.split(/\r?\n/).map(s => s.trim()).filter(Boolean))];
    const sections = { '새 기능': [], '버그 수정': [], '개선': [], '기타 변경': [] };
    for (const message of commits) {
      const normalized = message.replace(/^(feat|fix|perf|refactor|docs|test|chore)(\([^)]*\))?!?:\s*/i, '');
      const type = /^feat(\(|:|!)/i.test(message) ? '새 기능'
        : /^fix(\(|:|!)/i.test(message) ? '버그 수정'
        : /^(perf|refactor)(\(|:|!)/i.test(message) ? '개선' : '기타 변경';
      sections[type].push(normalized.replace(/[<>]/g, ''));
    }
    console.log('# Formwheel 업데이트 초안\n');
    console.log('> Git 커밋 메시지 기반 자동 초안입니다. 공개 전에 변경 내용을 검토하세요.\n');
    if (!commits.length) console.log('선택한 범위에 커밋이 없습니다.\n');
    for (const [title, entries] of Object.entries(sections)) {
      if (entries.length) console.log(`## ${title}\n${entries.map(x => '- ' + x).join('\n')}\n`);
    }
    console.log('---\n홍보 문구 초안: Formwheel이 업데이트됐어요! 새로워진 기능을 확인해 보세요. https://semicolonxss.github.io/Formwheel/');
  } catch (error) {
    console.error('Git 기록을 읽지 못했습니다:', error.message);
    process.exitCode = 1;
  }
}
