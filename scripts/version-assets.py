"""Fingerprint local JS/CSS references after edits; run from any Formwheel repo."""
from pathlib import Path
import hashlib,re,sys
root=Path(sys.argv[1] if len(sys.argv)>1 else '.').resolve()
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()[:12]
for _ in range(8):
 changed=False
 for path in root.rglob('*.js'):
  if 'node_modules' in path.parts:continue
  text=path.read_text()
  def replace_import(match):
   target=(path.parent/match[2]).resolve()
   return match[1]+match[2]+'?v='+digest(target)+match[3] if target.is_file() else match[0]
  next_text=re.sub(r'((?:from\s*|import\s*)[\"\'])(\.{1,2}/[^\"\'?#]+)(?:\?[^\"\']*)?([\"\'])',replace_import,text)
  if next_text!=text:path.write_text(next_text);changed=True
 if not changed:break
for path in root.rglob('*.html'):
 text=path.read_text()
 def replace_asset(match):
  target=(path.parent/match[2]).resolve()
  return match[1]+match[2]+'?v='+digest(target)+match[3] if target.is_file() and target.suffix in ['.js','.css'] else match[0]
 path.write_text(re.sub(r'((?:src|href)=\")(\./[^\"?#]+)(?:\?[^\"]*)?(\")',replace_asset,text))
