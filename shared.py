"""
shared.py — Common constants, math utilities, and collision helpers.
All values are in world pixels (background.jpg scaled by MAP_ZOOM).
"""
import math

# ── Window & timing ──────────────────────────────────────────────────────────
WIDTH  = 1200
HEIGHT = 800
FPS    = 60
TICKRATE = 30           # Server broadcast frequency (Hz)

# ── Network ───────────────────────────────────────────────────────────────────
SERVER_URL = "wss://chasmic-liam-undealable.ngrok-free.dev"

# ── Map ───────────────────────────────────────────────────────────────────────
MAP_ZOOM = 8.0          # background.jpg is scaled by this factor
# Start position in world-space (near finish line on the main straight)
START_X  = 12205
START_Y  = 9382

# ── Physics ───────────────────────────────────────────────────────────────────
CAR_RADIUS      = 18    # Circular hitbox radius (world pixels)
MAX_SPEED       = 20
MAX_SPEED_OFFTRACK = 2.5  # Speed cap when driving on grass/gravel
ACCELERATION    = 0.15
FRICTION        = 0.05
ROTATION_SPEED  = 2.8   # Degrees per frame
REVERSE_MAX     = 4.0
OFFTRACK_FRICTION_MULT = 3.0  # Extra friction when off road

# ── Bot colours (used for default bot skin) ──────────────────────────────────
BOT_COLORS = [
    (220,  50,  50),   # red
    ( 50, 150, 220),   # blue
    (240, 160,  30),   # orange
    ( 60, 200,  80),   # green
    (200, 200,  50),   # yellow
    (200,  80, 200),   # magenta
    (  0, 200, 200),   # cyan
    (180,  90,  30),   # brown
    (150, 150, 150),   # grey
    (255, 130, 180),   # pink
]

# ── Bot waypoints — world-space coordinates tracing the circuit ───────────────
# Approximate positions measured from the image (zoom=8).
# Edit freely to improve bot path quality.
BOT_WAYPOINTS = [
    (12205, 9382),
    (11200, 9350),
    (10200, 9200),
    ( 9300, 8900),
    ( 8600, 8300),
    ( 8100, 7600),
    ( 8000, 6800),
    ( 8200, 6100),
    ( 8700, 5500),
    ( 9500, 5100),
    (10400, 4950),
    (11300, 5000),
    (12200, 5200),
    (13000, 5600),
    (13500, 6300),
    (13700, 7100),
    (13500, 7900),
    (13100, 8600),
    (12700, 9100),
    (12400, 9350),
]

# ── Bot spawn offsets (relative to START_X/Y) ────────────────────────────────
BOT_SPAWN_OFFSETS = [
    (-80, 0), (-160, 0), (-240, 0), (-320, 0),
    (-80, 40), (-160, 40), (-240, 40), (-320, 40),
    (-80, -40), (-160, -40),
]


# ── Math helpers ──────────────────────────────────────────────────────────────

def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def lerp_angle(a: float, b: float, t: float) -> float:
    """Interpolate between two angles taking the shortest arc."""
    diff = (b - a + 180) % 360 - 180
    return (a + diff * t) % 360


def angle_diff(a: float, b: float) -> float:
    """Signed shortest difference (degrees): b - a."""
    return (b - a + 180) % 360 - 180


def circle_collision(
    x1: float, y1: float,
    x2: float, y2: float,
    r1: float = CAR_RADIUS,
    r2: float = CAR_RADIUS,
):
    """
    Detect circle-circle collision.
    Returns (colliding: bool, overlap: float, nx: float, ny: float)
    where (nx, ny) is the unit normal pointing FROM object-1 TO object-2.
    """
    dx = x2 - x1
    dy = y2 - y1
    dist_sq = dx * dx + dy * dy
    min_dist = r1 + r2

    if dist_sq < min_dist * min_dist and dist_sq > 1e-9:
        dist = math.sqrt(dist_sq)
        nx   = dx / dist
        ny   = dy / dist
        overlap = min_dist - dist
        return True, overlap, nx, ny

    return False, 0.0, 0.0, 0.0


def clamp(val: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, val))
