"""Prepare pinned public app checkouts and public Firebase SDK files for UI QA."""
from pathlib import Path
import concurrent.futures, json, re, subprocess, sys, urllib.request, urllib.parse
root = Path(__file__).resolve().parents[1]
report = json.loads((root / 'docs/quality-audit-third-2026-11-24.json').read_text())
siblings = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root / 'ecosystem-third'
siblings.mkdir(parents=True, exist_ok=True)
def checkout(meta):
    name, ref = meta['repo'], meta.get('fixedCommit', meta['baseline'])
    assert re.fullmatch(r'Formwheel_[A-Za-z0-9_]+', name)
    assert re.fullmatch(r'[a-f0-9]{40}', ref)
    dest = siblings / name
    if not dest.exists():
        subprocess.run(['git', 'init', '-q', str(dest)], check=True)
        subprocess.run(['git', 'remote', 'add', 'origin', 'https://github.com/SemicolonXSS/' + name + '.git'], cwd=dest, check=True)
    subprocess.run(['git', 'fetch', '-q', '--depth=1', 'origin', ref], cwd=dest, check=True)
    subprocess.run(['git', 'checkout', '-q', '--detach', 'FETCH_HEAD'], cwd=dest, check=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(checkout, report['repositories']))
cache = siblings / '.third-audit-sdk'
cache.mkdir(exist_ok=True)
queue = []
for repo in [root] + [siblings / m['repo'] for m in report['repositories']]:
    for p in repo.rglob('*'):
        if '.git' in p.parts or 'node_modules' in p.parts or p.suffix not in ['.js', '.html'] or not p.is_file():
            continue
        queue.extend(re.findall(r'https://www\.gstatic\.com/firebasejs/[^\s\"\']+\.js', p.read_text()))
seen = {}
while queue:
    url = queue.pop()
    if url in seen or not url.startswith('https://www.gstatic.com/firebasejs/'):
        continue
    relative = url.split('/firebasejs/', 1)[1]
    assert re.fullmatch(r'[A-Za-z0-9./_-]+\.js', relative) and '..' not in relative.split('/')
    p = cache / relative
    p.parent.mkdir(parents=True, exist_ok=True)
    if not p.exists():
        p.write_bytes(urllib.request.urlopen(url, timeout=30).read())
    seen[url] = str(p)
    for dep in re.findall(r'(?:from\s*|import\s*)[\"\']([^\"\']+)[\"\']', p.read_text()):
        resolved = urllib.parse.urljoin(url, dep)
        if resolved.startswith('https://www.gstatic.com/firebasejs/'):
            queue.append(resolved)
(cache / 'map.json').write_text(json.dumps(seen))
print('Prepared', len(report['repositories']), 'pinned apps and', len(seen), 'public SDK files')
