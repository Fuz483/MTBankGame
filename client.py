"""
client.py — Main game client for MTFormula top-down racer.

Run:
    python client.py                       # default skin
    python client.py --skin my_car.png     # custom skin

For web deployment via pygbag the skin always defaults; pass ?skin=url
in the URL to use a remote PNG (unimplemented here — extend as needed).

Architecture
────────────
• Local physics run at 60 fps (client-authoritative for own car).
• Server receives position updates at 20 Hz and broadcasts the full
  world state (other players + bots) at 30 Hz.
• Received positions are lerp-interpolated to hide network jitter.
• Off-road detection uses green-channel pixel sampling on the track image.
• Car-car collisions are resolved locally against the latest server positions.
"""
import sys
import os
import math
import json
import asyncio
import random

os.chdir(os.path.dirname(os.path.abspath(__file__)))

import pygame

from shared import (
    WIDTH, HEIGHT, FPS, TICKRATE, SERVER_URL,
    MAP_ZOOM, START_X, START_Y,
    CAR_RADIUS, MAX_SPEED, MAX_SPEED_OFFTRACK,
    ACCELERATION, FRICTION, ROTATION_SPEED, REVERSE_MAX,
    OFFTRACK_FRICTION_MULT,
    lerp, lerp_angle, circle_collision, clamp,
)
from skin_loader import get_skin, get_bot_skin, resolve_skin_path

IS_WEB = sys.platform == 'emscripten'

if IS_WEB:
    import js               # type: ignore
    # В Pygbag нет pyodide, функции-колбеки прокидываются напрямую
    create_proxy = lambda x: x
else:
    try:
        import websockets   # type: ignore
    except ImportError:
        websockets = None   # type: ignore


# ── Particle / Effect containers ─────────────────────────────────────────────

class TireMark:
    """A single tire-mark quad drawn on the track."""
    MAX_ALPHA = 160
    FADE_RATE = 0.8   # alpha lost per frame

    def __init__(self, x: float, y: float, angle: float, side: int):
        self.x     = x
        self.y     = y
        self.angle = angle
        self.side  = side    # -1 or +1 (left/right wheel)
        self.alpha = self.MAX_ALPHA

    def update(self):
        self.alpha = max(0, self.alpha - self.FADE_RATE)

    def is_dead(self):
        return self.alpha <= 0

    def draw(self, surface: pygame.Surface, cam_x: float, cam_y: float):
        sx = self.x - cam_x
        sy = self.y - cam_y
        if not (-20 < sx < WIDTH + 20 and -20 < sy < HEIGHT + 20):
            return
        c = (20, 20, 20, int(self.alpha))
        mark = pygame.Surface((4, 8), pygame.SRCALPHA)
        mark.fill(c)
        rot = pygame.transform.rotate(mark, self.angle)
        rad = math.radians(self.angle + 90)
        ox = math.cos(rad) * 14 * self.side
        oy = -math.sin(rad) * 14 * self.side
        surface.blit(rot, rot.get_rect(center=(sx + ox, sy + oy)))


class Spark:
    """One collision spark particle."""

    def __init__(self, x: float, y: float, vx: float, vy: float):
        self.x  = x
        self.y  = y
        self.vx = vx
        self.vy = vy
        self.life = random.uniform(0.3, 0.9)   # seconds
        self.max_life = self.life

    def update(self, dt: float):
        self.x  += self.vx * dt * 60
        self.y  += self.vy * dt * 60
        self.vx *= 0.92
        self.vy *= 0.92
        self.life -= dt

    def is_dead(self):
        return self.life <= 0

    def draw(self, surface: pygame.Surface, cam_x: float, cam_y: float):
        sx = int(self.x - cam_x)
        sy = int(self.y - cam_y)
        if not (0 < sx < WIDTH and 0 < sy < HEIGHT):
            return
        alpha = int(255 * (self.life / self.max_life))
        color = (255, clamp(int(200 * self.life / self.max_life), 0, 255), 0, alpha)
        spark_surf = pygame.Surface((4, 4), pygame.SRCALPHA)
        pygame.draw.circle(spark_surf, color, (2, 2), 2)
        surface.blit(spark_surf, (sx - 2, sy - 2))


def emit_sparks(x: float, y: float, nx: float, ny: float, count: int = 8) -> list:
    sparks = []
    for _ in range(count):
        angle = math.atan2(ny, nx) + random.uniform(-1.0, 1.0)
        speed = random.uniform(1.5, 4.0)
        sparks.append(Spark(x, y, math.cos(angle) * speed, math.sin(angle) * speed))
    return sparks


# ── Background / Track ───────────────────────────────────────────────────────

class TrackMap:
    """Loads the track image, scales it, and provides off-road detection."""

    def __init__(self, zoom: float = MAP_ZOOM):
        path = os.path.join('', 'assets/background.jpg')
        raw  = pygame.image.load(path).convert()
        w    = int(raw.get_width()  * zoom)
        h    = int(raw.get_height() * zoom)
        self.image  = pygame.transform.scale(raw, (w, h))
        self.width  = w
        self.height = h
        # Down-scaled version for fast pixel sampling
        self.sample = pygame.transform.scale(raw, (raw.get_width(), raw.get_height()))
        self.zoom   = zoom

    def is_offroad(self, wx: float, wy: float) -> bool:
        """Return True when the world position is on grass/gravel."""
        # Sample the un-zoomed image for speed
        ix = int(clamp(wx / self.zoom, 0, self.sample.get_width()  - 1))
        iy = int(clamp(wy / self.zoom, 0, self.sample.get_height() - 1))
        c = self.sample.get_at((ix, iy))
        # Green (grass) detection: G significantly exceeds R and B
        return c.g > c.r + 18 and c.g > c.b + 18

    def draw(self, surface: pygame.Surface, cam_x: float, cam_y: float):
        surface.blit(self.image, (-cam_x, -cam_y))


# ── Local player car ─────────────────────────────────────────────────────────

class PlayerCar:
    """Client-side authoritative physics for the local player."""

    def __init__(self, x: float, y: float, skin_surface: pygame.Surface):
        self.world_x   = float(x)
        self.world_y   = float(y)
        self.angle     = 180.0
        self.speed     = 0.0
        self.on_road   = True

        self.original  = skin_surface
        self.image     = skin_surface

        # For tire mark emission
        self._mark_timer = 0

    def update(self, keys, dt: float) -> tuple:
        """Apply controls and return (dx, dy) movement vector."""
        # Accelerate / brake
        if keys[pygame.K_w] or keys[pygame.K_UP]:
            self.speed += ACCELERATION
        elif keys[pygame.K_s] or keys[pygame.K_DOWN]:
            self.speed -= ACCELERATION
        else:
            drag = FRICTION * (OFFTRACK_FRICTION_MULT if not self.on_road else 1.0)
            if self.speed > 0:
                self.speed = max(0.0, self.speed - drag)
            elif self.speed < 0:
                self.speed = min(0.0, self.speed + drag)

        top = MAX_SPEED_OFFTRACK if not self.on_road else MAX_SPEED
        self.speed = clamp(self.speed, -REVERSE_MAX, top)

        # Steering (only when moving)
        if abs(self.speed) > 0.1:
            direction = 1 if self.speed > 0 else -1
            if keys[pygame.K_a] or keys[pygame.K_LEFT]:
                self.angle = (self.angle + ROTATION_SPEED * direction) % 360
            if keys[pygame.K_d] or keys[pygame.K_RIGHT]:
                self.angle = (self.angle - ROTATION_SPEED * direction) % 360

        # Rotate sprite
        self.image = pygame.transform.rotate(self.original, self.angle)

        rad = math.radians(self.angle)
        dx  = math.cos(rad) * self.speed
        dy  = -math.sin(rad) * self.speed
        return dx, dy

    def push_apart(self, ox: float, oy: float):
        """Push self away from another car at (ox, oy)."""
        col, overlap, nx, ny = circle_collision(self.world_x, self.world_y, ox, oy)
        if col:
            self.world_x -= nx * overlap * 0.55
            self.world_y -= ny * overlap * 0.55
            self.speed   *= 0.65
            return True, overlap, nx, ny
        return False, 0, 0, 0

    def get_tire_marks(self, speed_prev: float) -> list:
        """Return tire marks when hard braking or drifting."""
        marks = []
        self._mark_timer += 1
        if abs(self.speed) > 1.0 and self._mark_timer % 3 == 0:
            for side in (-1, 1):
                marks.append(TireMark(self.world_x, self.world_y, self.angle, side))
        return marks

    def draw(self, surface: pygame.Surface, cam_x: float, cam_y: float):
        rect = self.image.get_rect(center=(
            int(self.world_x - cam_x),
            int(self.world_y - cam_y),
        ))
        surface.blit(self.image, rect)


# ── Remote entity (interpolated) ─────────────────────────────────────────────

class RemoteEntity:
    """Stores current + target state and lerps between them each frame."""

    def __init__(self, state: dict, skin: pygame.Surface):
        self.current = dict(state)
        self.target  = dict(state)
        self.skin    = skin

    def apply_update(self, state: dict):
        self.target = dict(state)

    def interpolate(self, t: float = 0.2):
        c, g = self.current, self.target
        c['x']     = lerp(c['x'],     g['x'],     t)
        c['y']     = lerp(c['y'],     g['y'],     t)
        c['angle'] = lerp_angle(c['angle'], g['angle'], t)

    def draw(self, surface: pygame.Surface, cam_x: float, cam_y: float):
        c   = self.current
        img = pygame.transform.rotate(self.skin, c['angle'])
        rect = img.get_rect(center=(
            int(c['x'] - cam_x),
            int(c['y'] - cam_y),
        ))
        surface.blit(img, rect)


# ── HUD ───────────────────────────────────────────────────────────────────────

class HUD:
    def __init__(self):
        self.font_big   = pygame.font.SysFont('Arial', 28, bold=True)
        self.font_small = pygame.font.SysFont('Arial', 18)

    def draw(self, surface: pygame.Surface, speed: float,
             on_road: bool, player_count: int, connected: bool):

        # Speed bar background
        pygame.draw.rect(surface, (20, 20, 20, 180),
                         pygame.Rect(20, HEIGHT - 60, 240, 40), border_radius=8)
        # Speed bar fill
        bar_w = int(clamp(abs(speed) / MAX_SPEED, 0, 1) * 220)
        color = (255, 80, 30) if speed > 0 else (80, 120, 255)
        if bar_w > 0:
            pygame.draw.rect(surface, color,
                             pygame.Rect(30, HEIGHT - 50, bar_w, 20), border_radius=5)

        spd_txt = self.font_big.render(
            f"{int(abs(speed) * 20)} km/h", True, (255, 255, 255))
        surface.blit(spd_txt, (30, HEIGHT - 52))

        # Off-road warning
        if not on_road:
            warn = self.font_big.render("OFF TRACK", True, (255, 220, 30))
            surface.blit(warn, (WIDTH // 2 - warn.get_width() // 2, 20))

        # Player count
        info = self.font_small.render(
            f"Players: {player_count}  {'[ONLINE]' if connected else '[OFFLINE]'}",
            True, (200, 255, 200) if connected else (200, 200, 200))
        surface.blit(info, (WIDTH - info.get_width() - 20, 20))

        # Controls reminder (top-left)
        ctrl = self.font_small.render("WASD / Arrows: drive", True, (180, 180, 180))
        surface.blit(ctrl, (20, 20))


# ── WebSocket layer ───────────────────────────────────────────────────────────
# Wrapped in a class to keep the game loop clean.

class NetworkClient:
    def __init__(self):
        self.ws           = None
        self.my_id: str | None = None
        self.connected    = False
        self._inbox: list = []    # messages received, processed each frame

    # ── Web platform (js.WebSocket) ──────────────────────────────────────────

    def connect_web(self, url: str):
        try:
            # Для Pygbag правильный путь к объектам браузера идет через window
            self.ws = js.window.WebSocket.new(url)

            def on_open(ev):
                self.connected = True

            def on_close(ev):
                self.connected = False

            def on_message(ev):
                self._inbox.append(ev.data)

            self.ws.onopen    = create_proxy(on_open)
            self.ws.onclose   = create_proxy(on_close)
            self.ws.onmessage = create_proxy(on_message)
        except Exception as e:
            print(f"[net] Web WebSocket error: {e}")

    def send_web(self, payload: dict):
        if self.ws and getattr(self.ws, 'readyState', 0) == 1:
            self.ws.send(json.dumps(payload))

    # ── Desktop platform (websockets library) ────────────────────────────────

    async def connect_desktop(self, url: str):
        if websockets is None:
            print("[net] websockets not installed — offline mode")
            return
        try:
            self.ws = await websockets.connect(url, ping_interval=None)
            self.connected = True
            asyncio.create_task(self._recv_loop())
            print("[net] Connected to server")
        except Exception as e:
            print(f"[net] Could not connect: {e}")

    async def _recv_loop(self):
        try:
            async for msg in self.ws:
                self._inbox.append(msg)
        except Exception:
            pass
        self.connected = False
        print("[net] Disconnected")

    async def send_desktop(self, payload: dict):
        if self.ws and self.connected:
            try:
                await self.ws.send(json.dumps(payload))
            except Exception:
                self.connected = False

    # ── Unified API ──────────────────────────────────────────────────────────

    def drain_inbox(self) -> list:
        msgs, self._inbox = self._inbox[:], []
        return msgs


# ── Main game ─────────────────────────────────────────────────────────────────

async def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("MTFormula")
    clock  = pygame.time.Clock()

    # ── Track ────────────────────────────────────────────────────────────────
    track  = TrackMap()

    # ── Skins ────────────────────────────────────────────────────────────────
    skin_path   = resolve_skin_path()
    player_skin = get_skin(skin_path, (220, 40, 40))

    # Pre-loaded bot skins (10 colours, indexed by bot_id)
    from shared import BOT_COLORS
    bot_skins = [get_bot_skin(c) for c in BOT_COLORS]

    # ── Player car ───────────────────────────────────────────────────────────
    player = PlayerCar(START_X, START_Y, player_skin)

    # ── Networking ───────────────────────────────────────────────────────────
    net = NetworkClient()
    if IS_WEB:
        net.connect_web(SERVER_URL)
    else:
        await net.connect_desktop(SERVER_URL)

    # Remote entities: keyed by their server-assigned string ID
    remote: dict[str, RemoteEntity] = {}

    # ── Effects ──────────────────────────────────────────────────────────────
    tire_marks: list[TireMark] = []
    sparks:     list[Spark]    = []
    MAX_MARKS = 400

    # ── Timing ───────────────────────────────────────────────────────────────
    last_send_ms  = 0
    SEND_INTERVAL = 1000 // 20    # 20 Hz to server

    hud = HUD()
    dt  = 1 / FPS

    running = True
    while running:
        clock.tick(FPS)
        now_ms = pygame.time.get_ticks()

        # ── Events ───────────────────────────────────────────────────────────
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
                running = False

        keys = pygame.key.get_pressed()

        # ── Local physics ────────────────────────────────────────────────────
        prev_speed = player.speed
        dx, dy     = player.update(keys, dt)

        # Tentative move
        new_x = player.world_x + dx
        new_y = player.world_y + dy

        # Off-road check
        player.on_road = not track.is_offroad(new_x, new_y)

        if not player.on_road:
            # Allow movement but slow the car; don't hard-block
            player.speed *= (1.0 - 0.06)   # extra drag
            # Update position anyway (car slows, not bounces)

        player.world_x = new_x
        player.world_y = new_y

        # Clamp to map bounds
        player.world_x = clamp(player.world_x, 0, track.width)
        player.world_y = clamp(player.world_y, 0, track.height)

        # ── Car-car collisions (local player vs remotes) ──────────────────
        for eid, entity in remote.items():
            cx = entity.current['x']
            cy = entity.current['y']
            hit, overlap, nx, ny = player.push_apart(cx, cy)
            if hit:
                # Emit sparks at collision point
                mx = player.world_x + nx * CAR_RADIUS
                my = player.world_y + ny * CAR_RADIUS
                sparks.extend(emit_sparks(mx, my, nx, ny, 6))

        # ── Tire marks ───────────────────────────────────────────────────────
        new_marks = player.get_tire_marks(prev_speed)
        tire_marks.extend(new_marks)
        if len(tire_marks) > MAX_MARKS:
            tire_marks = tire_marks[-MAX_MARKS:]

        # ── Network receive ───────────────────────────────────────────────────
        for raw_msg in net.drain_inbox():
            try:
                data = json.loads(raw_msg)
            except Exception:
                continue

            if data.get('type') == 'init':
                net.my_id = str(data['id'])

            elif data.get('type') == 'update':
                players_data = data.get('players', {})
                bots_data    = data.get('bots',    {})

                # Merge all into remote dict (bots use 'b_' prefix)
                server_ids = set()

                for pid, pstate in players_data.items():
                    if pid == net.my_id:
                        continue
                    server_ids.add(pid)
                    skin = player_skin    # could be smarter with per-player skins
                    if pid not in remote:
                        remote[pid] = RemoteEntity(pstate, skin)
                    else:
                        remote[pid].apply_update(pstate)

                for bid, bstate in bots_data.items():
                    key = f'b_{bid}'
                    server_ids.add(key)
                    color = tuple(bstate.get('color', [200, 200, 200]))
                    color_idx = bstate.get('bot_id', 0) % len(bot_skins)
                    skin = bot_skins[color_idx]
                    if key not in remote:
                        remote[key] = RemoteEntity(bstate, skin)
                    else:
                        remote[key].apply_update(bstate)

                # Remove disconnected entities
                gone = set(remote.keys()) - server_ids
                for k in gone:
                    del remote[k]

        # ── Interpolate remote entities ───────────────────────────────────────
        for entity in remote.values():
            entity.interpolate(0.25)

        # ── Network send ──────────────────────────────────────────────────────
        if now_ms - last_send_ms >= SEND_INTERVAL:
            payload = {
                'x':     player.world_x,
                'y':     player.world_y,
                'angle': player.angle,
                'speed': player.speed,
            }
            if IS_WEB:
                net.send_web(payload)
            else:
                await net.send_desktop(payload)
            last_send_ms = now_ms

        # ── Update effects ────────────────────────────────────────────────────
        for m in tire_marks:
            m.update()
        tire_marks = [m for m in tire_marks if not m.is_dead()]

        for s in sparks:
            s.update(dt)
        sparks = [s for s in sparks if not s.is_dead()]

        # ── Camera ───────────────────────────────────────────────────────────
        cam_x = player.world_x - WIDTH  // 2
        cam_y = player.world_y - HEIGHT // 2

        # ── Render ───────────────────────────────────────────────────────────
        screen.fill((20, 30, 20))
        track.draw(screen, cam_x, cam_y)

        # Tire marks (on a per-frame SRCALPHA blit)
        for m in tire_marks:
            m.draw(screen, cam_x, cam_y)

        # Remote cars
        for entity in remote.values():
            entity.draw(screen, cam_x, cam_y)

        # Local player
        player.draw(screen, cam_x, cam_y)

        # Sparks
        for s in sparks:
            s.draw(screen, cam_x, cam_y)

        # HUD
        hud.draw(screen, player.speed, player.on_road,
                 1 + len([k for k in remote if not k.startswith('b_')]),
                 net.connected)

        pygame.display.flip()
        await asyncio.sleep(0)

    pygame.quit()


if __name__ == '__main__':
    asyncio.run(main())
