import urllib.request
import json
import sys

urls = [
    ("Frontend /live", "http://localhost:3000/live"),
    ("Frontend /settings", "http://localhost:3000/settings"),
    ("Frontend /transcripts", "http://localhost:3000/transcripts"),
    ("Frontend /evidence", "http://localhost:3000/evidence"),
    ("Backend /health", "http://127.0.0.1:8000/health"),
    ("Backend /api/models/status", "http://127.0.0.1:8000/api/models/status"),
    ("Backend /api/benchmark/results", "http://127.0.0.1:8000/api/benchmark/results"),
    ("Backend /api/transcripts", "http://127.0.0.1:8000/api/transcripts"),
    ("Backend /api/vocabulary", "http://127.0.0.1:8000/api/vocabulary")
]

passed = 0
failed = 0

print("=== Verifying Resonance Endpoints ===")
for name, url in urls:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "ResonanceVerifier/1.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            status = resp.status
            content = resp.read(256)
            print(f"[PASS] {status} - {name} ({url})")
            passed += 1
    except Exception as e:
        print(f"[FAIL] {name} ({url}): {e}")
        failed += 1

print(f"\nResult: {passed} passed, {failed} failed out of {len(urls)} endpoints.")
if failed > 0:
    sys.exit(1)
