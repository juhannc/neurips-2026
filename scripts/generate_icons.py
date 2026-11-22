#!/usr/bin/env python3
"""Generate PWA / iOS home screen assets from the official NeurIPS media-kit logo.

Source: https://neurips.cc/public/MediaKit
The conference logo is not original artwork of this project.
"""
from pathlib import Path
from io import BytesIO
from urllib.request import Request, urlopen
from PIL import Image

SOURCE = "https://neurips.cc/media/Press/NeurIPS_logo_stacked.png"
ASSETS = Path("assets")
ASSETS.mkdir(exist_ok=True)
request = Request(SOURCE, headers={"User-Agent": "NeurIPS-2026-PWA/1.0"})
with urlopen(request, timeout=35) as response:
    raw = response.read()
original = Image.open(BytesIO(raw)).convert("RGBA")
if original.width < 400 or original.height < 400:
    raise RuntimeError("Unexpected logo dimensions, refusing to overwrite icons")
for size in (180, 192, 512):
    image = original.copy()
    image.thumbnail((size, size), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), "white")
    canvas.alpha_composite(image, ((size - image.width) // 2, (size - image.height) // 2))
    canvas.convert("RGB").save(ASSETS / f"icon-{size}.png", optimize=True)
# A separate official vector wordmark for the app header avoids stale PWA icon caches.
SVG_SOURCE = "https://neurips.cc/media/Press/NeurIPS_logo.svg"
with urlopen(Request(SVG_SOURCE, headers={"User-Agent": "NeurIPS-2026-PWA/1.0"}), timeout=35) as response:
    vector = response.read()
if b"<svg" not in vector[:4096]:
    raise RuntimeError("Official NeurIPS vector logo was not an SVG")
(ASSETS / "neurips-official-header-2026.svg").write_bytes(vector)
print(f"Created official NeurIPS PWA icons and vector header logo")

