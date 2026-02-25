#!/usr/bin/env python3
"""
Generate favicon.ico from a hand-crafted favicon.svg using cairosvg for
accurate rendering (handles strokes, transforms, etc.) and Pillow for ICO.

Requirements:
  pip install cairosvg Pillow

Usage:
  python scripts/generate-favicon.py
"""

import subprocess
import sys

try:
    import cairosvg
    from PIL import Image
    from io import BytesIO
except ImportError:
    print("Installing required packages...")
    subprocess.check_call(
        [sys.executable, "-m", "pip", "install", "cairosvg", "Pillow"]
    )
    import cairosvg
    from PIL import Image
    from io import BytesIO

SVG_PATH = "public/favicon.svg"
ICO_PATH = "public/favicon.ico"
SIZES = [48, 32, 16]


def main():
    with open(SVG_PATH, "r") as f:
        svg_data = f.read()

    images = []
    for size in SIZES:
        png_data = cairosvg.svg2png(
            bytestring=svg_data.encode(), output_width=size, output_height=size
        )
        img = Image.open(BytesIO(png_data))
        images.append(img)
        print(f"  Rendered {size}x{size}")

    images[0].save(
        ICO_PATH, format="ICO", sizes=[(s, s) for s in SIZES], append_images=images[1:]
    )
    print(f"Wrote {ICO_PATH}")


if __name__ == "__main__":
    main()
