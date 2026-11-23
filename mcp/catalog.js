// Read-only public project discovery sourced from the official Formwheel README.
// Do not execute Hub JavaScript, access Firebase or trust user-supplied URLs.
const SOURCE = 'https://raw.githubusercontent.com/SemicolonXSS/Formwheel/main/README.md';
const HUB = 'https://semicolonxss.github.io/Formwheel/';
const ALLOWED = /^https:\/\/semicolonxss\.github\.io\/Formwheel(?:_[a-zA-Z0-9]+)?\/$/;
const EXCLUDED = new Set(['casino', 'risk']);
let cache = null;
let expiry = 0;

export function parseCatalog(markdown) {
  const rows = [];
  let category = null;
  for (const line of markdown.split(/\r?\n/)) {
    if (/^### 🎮 게임/.test(line)) category = 'game';
    else if (/^### 🛠️ 제작 도구/.test(line)) category = 'tool';
    else if (/^### 🆕 확장 프로젝트/.test(line)) category = 'app';
    else if (/^### /.test(line)) category = null;
    if (!category || !line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map(x => x.trim());
    if (cells.length < 3 || !cells[0] || cells[0] === '프로젝트' || /^-+$/.test(cells[0])) continue;
    const link = cells[2].match(/\]\((https:\/\/[^)]+)\)/);
    if (!link) continue;
    let url;
    try { url = new URL(link[1]); } catch { continue; }
    if (!ALLOWED.test(url.href)) continue;
    if (EXCLUDED.has(cells[0].toLowerCase())) continue;
    rows.push({ name: cells[0], description: cells[1], category, url: url.href });
  }
  return rows;
}

export async function getCatalog() {
  if (cache && Date.now() < expiry) return cache;
  try {
    const response = await fetch(SOURCE, { headers: { 'Accept': 'text/plain' }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('Catalog unavailable');
    const result = parseCatalog(await response.text());
    if (!result.length) throw new Error('Catalog empty');
    cache = result;
    expiry = Date.now() + 15 * 60 * 1000;
    return result;
  } catch (error) {
    if (cache) return cache;
    throw error;
  }
}

export const hubUrl = HUB;
export function searchProjects(projects, query = '', category = 'all') {
  const q = String(query).trim().toLocaleLowerCase();
  return projects.filter(p => (category === 'all' || p.category === category) &&
    (!q || (p.name + ' ' + p.description).toLocaleLowerCase().includes(q)));
}
export function chooseProject(projects, category = 'all') {
  const pool = searchProjects(projects, '', category);
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}
