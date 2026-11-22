#!/usr/bin/env python3
"""Render the official NeurIPS dotted mark as PWA and iOS icons.

The icon artwork is copied from the NeurIPS SVG in assets/neurips-dots.svg.
No dependency on an external server during deployment.
"""
from io import BytesIO
from pathlib import Path

import cairosvg
from PIL import Image

assets = Path("assets")
source = assets / "neurips-dots.svg"
if not source.is_file():
    raise SystemExit("Missing original NeurIPS dotted logo SVG")
for size in (180, 192, 512):
    # Keep a comfortable optical margin and a white iOS Home Screen background.
    symbol_size = round(size * 0.82)
    png = cairosvg.svg2png(url=str(source), output_width=symbol_size, output_height=symbol_size)
    icon = Image.new("RGBA", (size, size), "#ffffff")
    symbol = Image.open(BytesIO(png)).convert("RGBA")
    icon.alpha_composite(symbol, ((size - symbol_size) // 2, (size - symbol_size) // 2))
    icon.convert("RGB").save(assets / f"icon-{size}.png", optimize=True)
print("Created NeurIPS dotted-symbol PWA icons: 180, 192, 512")
