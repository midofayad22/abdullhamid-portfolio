#!/usr/bin/env python3
"""
Generate the optimized WebP derivatives used by the site.

  assets/images/photoN.jpg   (originals, never modified)
    -> assets/images/thumb/photoN.webp   480 x 640   gallery grid
    -> assets/images/full/photoN.webp    960 x 1280  lightbox + grid on dense screens

  profile.jpg
    -> assets/images/profile-640.webp
    -> assets/images/profile-960.webp

Usage (needs Pillow):
  python3 scripts/optimize-images.py

To add a photo: drop photo55.jpg into assets/images/, run this script,
then add one <li> to gallery.html (copy the last one and bump the numbers).
"""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "images"
THUMB = SRC / "thumb"
FULL = SRC / "full"

THUMB_SIZE = (480, 640)
FULL_SIZE = (960, 1280)


def save_webp(img: Image.Image, target: Path, size: tuple[int, int], quality: int) -> None:
    out = img.convert("RGB")
    out.thumbnail(size, Image.LANCZOS)
    target.parent.mkdir(parents=True, exist_ok=True)
    out.save(target, "WEBP", quality=quality, method=6)
    print(f"{target.relative_to(ROOT)}  {out.size[0]}x{out.size[1]}  {target.stat().st_size // 1024} KB")


def main() -> None:
    photos = sorted(SRC.glob("photo*.jpg"), key=lambda p: int(p.stem.replace("photo", "")))
    for path in photos:
        with Image.open(path) as img:
            save_webp(img, THUMB / f"{path.stem}.webp", THUMB_SIZE, quality=76)
            save_webp(img, FULL / f"{path.stem}.webp", FULL_SIZE, quality=82)

    profile = ROOT / "profile.jpg"
    if profile.exists():
        with Image.open(profile) as img:
            save_webp(img, SRC / "profile-640.webp", (640, 721), quality=80)
            save_webp(img, SRC / "profile-960.webp", (960, 1082), quality=80)


if __name__ == "__main__":
    main()
