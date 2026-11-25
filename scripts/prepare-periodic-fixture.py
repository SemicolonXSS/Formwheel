"""Cache the pinned public dataset used by the periodic-table UI regression."""
from pathlib import Path
import hashlib, json, sys, urllib.request
URL = 'https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/a4859536499c2cb7ddf2666d8273e4ec98084d0a/PeriodicTableJSON.json'
SHA256 = 'e34d5ea4c20c3fd5c51cef52360d1527e4fbdcaebc141f3b74f4dabd3d910638'
path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / '.qa-fixtures/periodic-table.json'
path.parent.mkdir(parents=True, exist_ok=True)
data = path.read_bytes() if path.exists() else urllib.request.urlopen(URL, timeout=30).read()
if hashlib.sha256(data).hexdigest() != SHA256:
    raise RuntimeError('Periodic-table fixture integrity mismatch')
assert len(json.loads(data)['elements']) >= 118
path.write_bytes(data)
print('Prepared verified periodic-table fixture:', path)
