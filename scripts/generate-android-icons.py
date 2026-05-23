from pathlib import Path
import sys

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
RES_DIR = ROOT / "android" / "app" / "src" / "main" / "res"
DENSITIES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}
SAFE_ART_RATIO = 0.72


def rounded_square(image, radius_ratio=0.22):
    mask = Image.new("L", image.size, 0)
    draw = ImageDraw.Draw(mask)
    radius = int(image.size[0] * radius_ratio)
    draw.rounded_rectangle((0, 0, image.size[0], image.size[1]), radius=radius, fill=255)
    result = Image.new("RGBA", image.size, (0, 0, 0, 0))
    result.paste(image, (0, 0), mask)
    return result


def circle(image):
    mask = Image.new("L", image.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, image.size[0] - 1, image.size[1] - 1), fill=255)
    result = Image.new("RGBA", image.size, (0, 0, 0, 0))
    result.paste(image, (0, 0), mask)
    return result


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/generate-android-icons.py <source-png>")

    source = Path(sys.argv[1])
    if not source.exists():
        raise SystemExit(f"Icon source does not exist: {source}")

    base = Image.open(source).convert("RGBA")
    side = min(base.size)
    left = (base.width - side) // 2
    top = (base.height - side) // 2
    base = base.crop((left, top, left + side, top + side))

    for folder, size in DENSITIES.items():
        target_dir = RES_DIR / folder
        target_dir.mkdir(parents=True, exist_ok=True)
        canvas = Image.new("RGBA", (size, size), (181, 223, 242, 255))
        art_size = int(size * SAFE_ART_RATIO)
        art = base.resize((art_size, art_size), Image.Resampling.LANCZOS)
        offset = ((size - art_size) // 2, (size - art_size) // 2)
        canvas.alpha_composite(art, offset)
        canvas.save(target_dir / "ic_launcher_foreground.png")
        rounded_square(canvas).save(target_dir / "ic_launcher.png")
        circle(canvas).save(target_dir / "ic_launcher_round.png")

    print(f"Generated Android launcher icons from {source}")


if __name__ == "__main__":
    main()
