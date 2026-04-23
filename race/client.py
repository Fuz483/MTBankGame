import os
import math
import asyncio
import random
import pygame

os.chdir(os.path.dirname(os.path.abspath(__file__)))

import shared
from shared import (
    WIDTH, HEIGHT, FPS, ACCELERATION,
    FRICTION, ROTATION_SPEED, SCALE_FACTOR,
    clamp, angle_diff, lerp, circle_collision
)
from skin_loader import get_skin, list_numbered_asset_skins
from bot_ai import create_bots

# Настройки гонки
OFFLINE_BOT_COUNT = 7  # 7 ботов + 1 игрок = 8 машин на старте
TOTAL_LAPS = 2
FINISH_RECT = (6477, 6192, 6664, 6514)  # Зона свободного проезда (старт/финиш)

SPARKS_PER_COLLISION = 6
CAR_SPRITE_ROTATION_OFFSET = 0.0


class Spark:
    def __init__(self, x, y, vx, vy):
        self.x, self.y, self.vx, self.vy = x, y, vx, vy
        self.life = self.max_life = random.uniform(0.3, 0.8)

    def update(self, dt):
        self.x += self.vx * dt * 60
        self.y += self.vy * dt * 60
        self.vx *= 0.92
        self.vy *= 0.92
        self.life -= dt

    def draw(self, surface, cx, cy):
        alpha = max(0, min(255, int(255 * (self.life / self.max_life))))
        pygame.draw.circle(surface, (255, 150, 0, alpha), (int(self.x - cx), int(self.y - cy)), 2)


class StartLights:
    def __init__(self):
        self.timer = 0
        self.state = 0  # 0: Ready, 1: Red1, 2: Red2, 3: Red3, 4: GO
        self.font = pygame.font.SysFont("Arial", 120, bold=True)

    def update(self, dt):
        self.timer += dt
        if self.timer < 1:
            self.state = 1
        elif self.timer < 2:
            self.state = 2
        elif self.timer < 3:
            self.state = 3
        else:
            self.state = 4

    def draw(self, surface):
        if self.timer > 5: return
        colors = [(50, 0, 0), (50, 0, 0), (50, 0, 0)]
        if self.state >= 1: colors[0] = (255, 0, 0)
        if self.state >= 2: colors[1] = (255, 0, 0)
        if self.state >= 3: colors[2] = (255, 0, 0)
        if self.state == 4: colors = [(0, 255, 0)] * 3

        for i, color in enumerate(colors):
            pygame.draw.circle(surface, (20, 20, 20), (WIDTH // 2 - 100 + i * 100, 100), 45)
            pygame.draw.circle(surface, color, (WIDTH // 2 - 100 + i * 100, 100), 40)

        if self.state == 4 and self.timer < 4.5:
            txt = self.font.render("GO!", True, (0, 255, 0))
            surface.blit(txt, (WIDTH // 2 - txt.get_width() // 2, HEIGHT // 2 - 100))


class FixedTrackMap:
    def __init__(self, screen, font):
        screen.fill((20, 20, 20))
        txt = font.render("Загрузка 3D текстур...", True, (255, 255, 255))
        screen.blit(txt, (WIDTH // 2 - txt.get_width() // 2, HEIGHT // 2))
        pygame.display.flip()

        names = ["1_top_left.png", "2_top_right.png", "3_bottom_left.png", "4_bottom_right.png"]
        raw_assets = [pygame.image.load(os.path.join("assets", n)).convert_alpha() for n in names]

        self.orig_w = raw_assets[0].get_width()
        self.orig_h = raw_assets[0].get_height()
        self.sw = self.orig_w * SCALE_FACTOR
        self.sh = self.orig_h * SCALE_FACTOR

        self.assets = [pygame.transform.smoothscale(img, (self.sw, self.sh)) for img in raw_assets]

        shared.WORLD_WIDTH = self.sw * 2
        shared.WORLD_HEIGHT = self.sh * 2

        self.masks = []
        for i, img in enumerate(raw_assets):
            screen.fill((20, 20, 20))
            txt = font.render(f"Создание физики барьеров: {i + 1} из 4...", True, (255, 255, 255))
            screen.blit(txt, (WIDTH // 2 - txt.get_width() // 2, HEIGHT // 2))
            pygame.display.flip()

            m = []
            px = pygame.surfarray.pixels3d(img)
            for y in range(self.orig_h):
                row = bytearray(self.orig_w)
                for x in range(self.orig_w):
                    r, g, b = map(int, px[x][y])
                    is_barrier = (g > r + 30) or (b > r + 40 and b > g + 20) or (r > 200 and g > 200 and b > 200)
                    row[x] = 0 if is_barrier else 1
                m.append(row)
            self.masks.append(m)
            del px

        if not shared.BOT_WAYPOINTS:
            shared.BOT_WAYPOINTS = [(shared.START_X, shared.START_Y)]

        # ИСПРАВЛЕНО: Теперь маршрут состоит исключительно из твоих точек. Без лишней генерации.
        self.centerline = shared.BOT_WAYPOINTS

    def is_offroad(self, wx, wy):
        x1, y1, x2, y2 = FINISH_RECT
        if x1 <= wx <= x2 and y1 <= wy <= y2:
            return False

        if not (0 <= wx < shared.WORLD_WIDTH and 0 <= wy < shared.WORLD_HEIGHT): return True
        idx = int(wx // self.sw) + int(wy // self.sh) * 2
        if idx >= 4: return True

        mask_x = int((wx % self.sw) // SCALE_FACTOR)
        mask_y = int((wy % self.sh) // SCALE_FACTOR)

        if 0 <= mask_y < self.orig_h and 0 <= mask_x < self.orig_w:
            return self.masks[idx][mask_y][mask_x] == 0
        return True

    def draw(self, surface, cx, cy):
        pos = [(0, 0), (self.sw, 0), (0, self.sh), (self.sw, self.sh)]
        for i, p in enumerate(pos):
            screen_x, screen_y = p[0] - cx, p[1] - cy
            if -self.sw < screen_x < WIDTH and -self.sh < screen_y < HEIGHT:
                surface.blit(self.assets[i], (screen_x, screen_y))


class PlayerCar:
    def __init__(self, x, y, skin, num):
        self.world_x, self.world_y = float(x), float(y)
        self.angle, self.speed = 180.0, 0.0
        self.original = skin
        self.image = skin
        self.max_speed = shared.MAX_SPEED + (num * 1.5)
        self.lap = 0
        self.passed_half = False
        self.finished = False
        self.disqualified = False
        self._refresh_image()

    def _refresh_image(self):
        self.image = pygame.transform.rotate(self.original, self.angle + CAR_SPRITE_ROTATION_OFFSET)

    def update(self, keys, dt, track, can_move):
        if self.finished or self.disqualified or not can_move:
            self.speed *= 0.9
            self._refresh_image()
            return

        if keys[pygame.K_w] or keys[pygame.K_UP]:
            self.speed += ACCELERATION
        elif keys[pygame.K_s] or keys[pygame.K_DOWN]:
            self.speed -= ACCELERATION
        else:
            self.speed *= (1 - FRICTION)

        self.speed = clamp(self.speed, -5, self.max_speed)

        if abs(self.speed) > 0.1:
            d = 1 if self.speed > 0 else -1
            if keys[pygame.K_a] or keys[pygame.K_LEFT]: self.angle = (self.angle + ROTATION_SPEED * d) % 360
            if keys[pygame.K_d] or keys[pygame.K_RIGHT]: self.angle = (self.angle - ROTATION_SPEED * d) % 360

        self._refresh_image()

        rad = math.radians(self.angle)
        nx, ny = self.world_x + math.cos(rad) * self.speed, self.world_y - math.sin(rad) * self.speed

        if track.is_offroad(nx, ny):
            self.disqualified = True
            self.speed = 0.0
        else:
            self.world_x, self.world_y = nx, ny


class OfflineWorld:
    def __init__(self, track, bot_count):
        self.track = track
        self.bots = create_bots(bot_count)
        self.path = list(track.centerline)

    def _path_point(self, index, lane_offset):
        if not self.path: return 0, 0
        idx = index % len(self.path)
        next_idx = (index + 1) % len(self.path)
        px, py = self.path[(idx - 1) % len(self.path)]
        nx, ny = self.path[next_idx]
        dx, dy = nx - px, ny - py
        slen = math.hypot(dx, dy) or 1.0
        return self.path[idx][0] + (-dy / slen) * lane_offset, self.path[idx][1] + (dx / slen) * lane_offset

    def update(self, dt, player):
        if not self.path: return []
        for bot in self.bots: self._drive_bot(bot, dt)
        return self._resolve_collisions(player)

    def _drive_bot(self, bot, dt):
        if getattr(bot, 'finished', False):
            bot.speed *= 0.95
            return

        # Целимся в текущую точку
        tx, ty = self._path_point(bot.path_index, bot.lane_offset)

        # Динамический радиус: чем выше скорость, тем раньше бот переключается на следующую точку
        reach_dist = max(180.0, bot.speed * 1.5)

        if math.hypot(bot.x - tx, bot.y - ty) < reach_dist:
            bot.path_index = (bot.path_index + 1) % len(self.path)
            tx, ty = self._path_point(bot.path_index, bot.lane_offset)

        desired_angle = math.degrees(math.atan2(-(ty - bot.y), tx - bot.x)) % 360
        heading_error = angle_diff(bot.angle, desired_angle)

        turn = clamp(heading_error, -3.0 * dt * 60, 3.0 * dt * 60)
        bot.angle = (bot.angle + turn) % 360

        target_speed = bot.max_speed_limit - min(abs(heading_error) * 1.5, bot.max_speed_limit * 0.6)
        target_speed = clamp(target_speed, 5.0, bot.max_speed_limit)

        if bot.speed < target_speed:
            bot.speed = min(bot.speed + ACCELERATION, target_speed)
        else:
            bot.speed = max(bot.speed - FRICTION * 2, target_speed)

        rad = math.radians(bot.angle)
        next_x = bot.x + math.cos(rad) * bot.speed
        next_y = bot.y - math.sin(rad) * bot.speed

        if self.track.is_offroad(next_x, next_y):
            bot.speed *= 0.5
            safe_x, safe_y = self._path_point(bot.path_index, bot.lane_offset)
            bot.x, bot.y = lerp(bot.x, safe_x, 0.1), lerp(bot.y, safe_y, 0.1)
        else:
            bot.x, bot.y = next_x, next_y

    def _resolve_collisions(self, player):
        pts = []
        for bot in self.bots:
            col, over, nx, ny = circle_collision(bot.x, bot.y, player.world_x, player.world_y)
            if col:
                bot.x -= nx * over * 0.5;
                bot.y -= ny * over * 0.5
                player.world_x += nx * over * 0.5;
                player.world_y += ny * over * 0.5
                bot.speed *= 0.8;
                player.speed *= 0.8
                pts.append((bot.x, bot.y))
        return pts


async def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    clock = pygame.time.Clock()

    load_font = pygame.font.SysFont("Arial", 48, bold=True)
    font = pygame.font.SysFont("Arial", 64, bold=True)

    track = FixedTrackMap(screen, load_font)
    lights = StartLights()
    ai_world = OfflineWorld(track, OFFLINE_BOT_COUNT)

    skins = list_numbered_asset_skins()

    player_offset_idx = min(OFFLINE_BOT_COUNT, len(shared.BOT_SPAWN_OFFSETS) - 1)
    px_off, py_off = shared.BOT_SPAWN_OFFSETS[player_offset_idx]
    p_num = int(os.path.basename(skins[0]).split('.')[0]) if skins else 1
    player = PlayerCar(shared.START_X + px_off, shared.START_Y + py_off, get_skin(skins[0] if skins else None), p_num)

    bot_skins = []
    for idx, bot in enumerate(ai_world.bots):
        box_off, boy_off = shared.BOT_SPAWN_OFFSETS[idx % len(shared.BOT_SPAWN_OFFSETS)]
        bot.x = shared.START_X + box_off
        bot.y = shared.START_Y + boy_off

        if skins:
            b_path = skins[(idx + 1) % len(skins)]
            b_num = int(os.path.basename(b_path).split('.')[0])
        else:
            b_path, b_num = None, 1
        bot_skins.append(get_skin(b_path))
        bot.max_speed_limit = shared.MAX_SPEED + (b_num * 1.5)

    finish_order = []
    sparks = []
    running = True

    clock.tick()

    while running:
        dt = clock.tick(FPS) / 1000.0

        for e in pygame.event.get():
            if e.type == pygame.QUIT: running = False
            if e.type == pygame.MOUSEBUTTONDOWN:
                mx, my = pygame.mouse.get_pos()
                cx = clamp(player.world_x - WIDTH // 2, 0, shared.WORLD_WIDTH - WIDTH)
                cy = clamp(player.world_y - HEIGHT // 2, 0, shared.WORLD_HEIGHT - HEIGHT)
                print(f"({int(cx + mx)}, {int(cy + my)}),")

        lights.update(dt)
        can_go = (lights.state == 4)

        player.update(pygame.key.get_pressed(), dt, track, can_go)

        if not player.finished and not player.disqualified:
            if not player.passed_half and player.world_x < shared.WORLD_WIDTH * 0.3:
                player.passed_half = True

            x1, y1, x2, y2 = FINISH_RECT
            if player.passed_half and x1 <= player.world_x <= x2 and y1 <= player.world_y <= y2:
                player.lap += 1
                player.passed_half = False
                if player.lap >= TOTAL_LAPS:
                    player.finished = True
                    finish_order.append("Игрок")

        if can_go:
            col_pts = ai_world.update(dt, player)
            for x, y in col_pts:
                for _ in range(SPARKS_PER_COLLISION): sparks.append(
                    Spark(x, y, random.uniform(-2, 2), random.uniform(-2, 2)))

            for b in ai_world.bots:
                if not getattr(b, 'finished', False):
                    if not getattr(b, 'passed_half', False) and b.x < shared.WORLD_WIDTH * 0.3:
                        b.passed_half = True

                    x1, y1, x2, y2 = FINISH_RECT
                    if getattr(b, 'passed_half', False) and x1 <= b.x <= x2 and y1 <= b.y <= y2:
                        b.lap += 1
                        b.passed_half = False
                        if b.lap >= TOTAL_LAPS:
                            b.finished = True
                            finish_order.append(f"Бот {b.bot_id}")

        cx = clamp(player.world_x - WIDTH // 2, 0, shared.WORLD_WIDTH - WIDTH)
        cy = clamp(player.world_y - HEIGHT // 2, 0, shared.WORLD_HEIGHT - HEIGHT)

        track.draw(screen, cx, cy)

        for idx, b in enumerate(ai_world.bots):
            img = pygame.transform.rotate(bot_skins[idx], b.angle + CAR_SPRITE_ROTATION_OFFSET)
            screen.blit(img, img.get_rect(center=(int(b.x - cx), int(b.y - cy))))

        p_img = player.image
        screen.blit(p_img, p_img.get_rect(center=(int(player.world_x - cx), int(player.world_y - cy))))

        for s in sparks:
            s.update(dt)
            s.draw(screen, cx, cy)
        sparks = [s for s in sparks if s.life > 0]

        lights.draw(screen)

        if player.disqualified:
            msg = font.render("GAME OVER: DISQUALIFIED", True, (255, 50, 50))
            screen.blit(msg, (WIDTH // 2 - msg.get_width() // 2, HEIGHT // 2 - 50))
        elif player.finished:
            pos = finish_order.index("Игрок") + 1
            msg = font.render(f"FINISH! PLACE: {pos}", True, (255, 215, 0))
            screen.blit(msg, (WIDTH // 2 - msg.get_width() // 2, HEIGHT // 2 - 50))

        pygame.display.flip()
        await asyncio.sleep(0)

    pygame.quit()


if __name__ == "__main__":
    asyncio.run(main())