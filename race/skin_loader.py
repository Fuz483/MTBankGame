"""
skin_loader.py — Load, resize, and cache car skin images.

Priority for skin selection:
  1. --skin <path>  CLI argument  (desktop)
  2. Default skin generated programmatically (fallback for web / missing file)
"""
import os
import sys
import math
import pygame
from typing import Optional

# Cache: path -> pygame.Surface
_cache: dict[str, pygame.Surface] = {}

# Desired rendered size of the car sprite (pixels)
CAR_W = 54*5
CAR_H = 84*5


def _make_default_skin(color: tuple = (220, 40, 40)) -> pygame.Surface:
    """Draw a simple top-down car shape programmatically."""
    surf = pygame.Surface((CAR_W, CAR_H), pygame.SRCALPHA)
    surf.fill((0, 0, 0, 0))

    r, g, b = color

    # Body
    body_rect = pygame.Rect(4, 8, CAR_W - 8, CAR_H - 16)
    pygame.draw.rect(surf, (r, g, b), body_rect, border_radius=6)

    # Windshield (front)
    wind_rect = pygame.Rect(7, 10, CAR_W - 14, 12)
    pygame.draw.rect(surf, (180, 220, 255, 200), wind_rect, border_radius=3)

    # Rear window
    rear_rect = pygame.Rect(7, CAR_H - 22, CAR_W - 14, 10)
    pygame.draw.rect(surf, (140, 180, 220, 180), rear_rect, border_radius=3)

    # Wheels (four corners)
    wheel_color = (30, 30, 30)
    wheel_w, wheel_h = 8, 14
    positions = [
        (0, 6),
        (CAR_W - wheel_w, 6),
        (0, CAR_H - 6 - wheel_h),
        (CAR_W - wheel_w, CAR_H - 6 - wheel_h),
    ]
    for wx, wy in positions:
        pygame.draw.rect(surf, wheel_color, (wx, wy, wheel_w, wheel_h), border_radius=2)

    # Headlights
    pygame.draw.ellipse(surf, (255, 255, 180), (6,  4, 8, 5))
    pygame.draw.ellipse(surf, (255, 255, 180), (CAR_W - 14, 4, 8, 5))

    # Taillights
    pygame.draw.ellipse(surf, (255, 60, 60), (6,  CAR_H - 9, 8, 5))
    pygame.draw.ellipse(surf, (255, 60, 60), (CAR_W - 14, CAR_H - 9, 8, 5))

    return surf


def _load_from_file(path: str) -> pygame.Surface:
    surf = pygame.image.load(path).convert_alpha()
    # Preserve aspect ratio, fit inside CAR_W x CAR_H
    w, h = surf.get_size()
    scale = min(CAR_W / w, CAR_H / h)
    new_w = max(1, int(w * scale))
    new_h = max(1, int(h * scale))
    surf = pygame.transform.smoothscale(surf, (new_w, new_h))
    # Centre on a CAR_W x CAR_H canvas
    canvas = pygame.Surface((CAR_W, CAR_H), pygame.SRCALPHA)
    canvas.fill((0, 0, 0, 0))
    canvas.blit(surf, ((CAR_W - new_w) // 2, (CAR_H - new_h) // 2))
    return canvas


def get_skin(path: Optional[str] = None, color: tuple = (220, 40, 40)) -> pygame.Surface:
    """
    Return a pygame.Surface for the given skin path (or the default skin).
    Results are cached by path.
    """
    key = path or f"__default_{color}"
    if key in _cache:
        return _cache[key]

    if path and os.path.isfile(path):
        try:
            surf = _load_from_file(path)
            _cache[key] = surf
            return surf
        except Exception as e:
            print(f"[skin_loader] Failed to load {path}: {e}")

    surf = _make_default_skin(color)
    _cache[key] = surf
    return surf


def get_bot_skin(color: tuple) -> pygame.Surface:
    """Return a default skin tinted with the given color."""
    return get_skin(None, color)


def resolve_skin_path() -> Optional[str]:
    """
    Parse --skin <path> from sys.argv.
    Returns None if not provided or on web platform.
    """
    if sys.platform == 'emscripten':
        return None

    args = sys.argv[1:]
    for i, arg in enumerate(args):
        if arg == '--skin' and i + 1 < len(args):
            path = args[i + 1]
            if os.path.isfile(path):
                return path
            print(f"[skin_loader] Skin file not found: {path}")
    return None


def list_numbered_asset_skins(assets_dir: str = "assets") -> list[str]:
    """
    Return asset skin paths where filename is a plain number, e.g. 1.png, 12.png.
    Sorted by numeric index.
    """
    if not os.path.isdir(assets_dir):
        return []

    numbered = []
    for name in os.listdir(assets_dir):
        base, ext = os.path.splitext(name)
        if not base.isdigit():
            continue
        if ext.lower() not in {".png", ".jpg", ".jpeg", ".webp"}:
            continue
        numbered.append((int(base), os.path.join(assets_dir, name)))

    numbered.sort(key=lambda item: item[0])
    return [path for _, path in numbered]
