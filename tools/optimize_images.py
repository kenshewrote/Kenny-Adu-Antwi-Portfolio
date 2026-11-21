"""Compress site images into web-ready WebP files.

Run from the project root:   python tools/optimize_images.py
Requires Pillow:              pip install pillow

Inputs (originals, not deployed):
  assets/character/*.png   -> assets/character/webp/*.webp   (sprite frames, alpha kept)
  _source/projects/*       -> assets/img/projects/*.webp      (project thumbnails, 720px wide)
  _source/photos/*         -> assets/img/photos/{full,thumb}/  (photography gallery)
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent


def save_webp(im, out, quality, **kw):
    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out, "WEBP", quality=quality, method=6, **kw)
    return out.stat().st_size


def fit(im, max_w=None, max_edge=None):
    w, h = im.size
    scale = 1.0
    if max_w and w > max_w:
        scale = max_w / w
    if max_edge and max(w, h) * scale > max_edge:
        scale = max_edge / max(w, h)
    if scale < 1:
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    return im


def main():
    total_in = total_out = 0

    # Sprites: keep the 420x640 canvas so every frame stays aligned on the ground line.
    for src in sorted((ROOT / "assets/character").glob("*.png")):
        im = Image.open(src).convert("RGBA")
        out = ROOT / "assets/character/webp" / (src.stem + ".webp")
        total_in += src.stat().st_size
        total_out += save_webp(im, out, quality=88, alpha_quality=90)

    for src in sorted((ROOT / "_source/projects").glob("*")):
        im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        out = ROOT / "assets/img/projects" / (src.stem + ".webp")
        total_in += src.stat().st_size
        total_out += save_webp(fit(im, max_w=720), out, quality=80)

    photos = sorted((ROOT / "_source/photos").glob("*"))
    for i, src in enumerate(photos, 1):
        im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        name = f"photo-{i:02d}.webp"
        total_in += src.stat().st_size
        total_out += save_webp(fit(im, max_edge=1800), ROOT / "assets/img/photos/full" / name, quality=78)
        total_out += save_webp(fit(im, max_edge=560), ROOT / "assets/img/photos/thumb" / name, quality=72)

    print(f"in: {total_in/1e6:.1f} MB  ->  out: {total_out/1e6:.1f} MB")


if __name__ == "__main__":
    main()
