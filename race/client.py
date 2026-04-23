import os, asyncio, random, pygame
import shared
from shared import *
from skin_loader import get_skin, list_numbered_asset_skins
from bot_ai import create_bots

os.chdir(os.path.dirname(os.path.abspath(__file__)))


def draw_text_with_bg(surface, text, font, pos, text_col=(255, 255, 255), bg_col=(0, 0, 0, 160)):
    txt_surf = font.render(text, True, text_col)
    bg_rect = txt_surf.get_rect(topleft=pos).inflate(20, 10)
    bg_surf = pygame.Surface(bg_rect.size, pygame.SRCALPHA)
    pygame.draw.rect(bg_surf, bg_col, bg_surf.get_rect(), border_radius=8)
    surface.blit(bg_surf, bg_rect.topleft)
    surface.blit(txt_surf, (pos[0] + 10, pos[1] + 5))


class Minimap:
    def __init__(self, track_assets, sw, sh):
        self.size = (200, 140)
        self.surface = pygame.Surface(self.size, pygame.SRCALPHA)
        full_map = pygame.Surface((sw * 2, sh * 2))
        full_map.blit(track_assets[0], (0, 0))
        full_map.blit(track_assets[1], (sw, 0))
        full_map.blit(track_assets[2], (0, sh))
        full_map.blit(track_assets[3], (sw, sh))
        self.bg = pygame.transform.smoothscale(full_map, self.size)
        self.scale_x = self.size[0] / (sw * 2)
        self.scale_y = self.size[1] / (sh * 2)

    def draw(self, screen, player, bots):
        rect = pygame.Rect(WIDTH - 220, 20, 200, 140)
        pygame.draw.rect(screen, (0, 0, 0, 100), rect.inflate(10, 10), border_radius=10)
        screen.blit(self.bg, rect.topleft)

        px, py = player.world_x * self.scale_x, player.world_y * self.scale_y
        pygame.draw.circle(screen, (255, 255, 0), (rect.x + px, rect.y + py), 4)

        for b in bots:
            bx, by = b.x * self.scale_x, b.y * self.scale_y
            pygame.draw.circle(screen, (255, 50, 50), (rect.x + bx, rect.y + by), 3)


class FixedTrackMap:
    def __init__(self, screen, font):
        draw_text_with_bg(screen, "ЗАГРУЗКА БОЛИДОВ...", font, (WIDTH // 2 - 150, HEIGHT // 2))
        pygame.display.flip()

        names = ["1_top_left.png", "2_top_right.png", "3_bottom_left.png", "4_bottom_right.png"]
        raw = [pygame.image.load(os.path.join("assets", n)).convert_alpha() for n in names]
        self.orig_w, self.orig_h = raw[0].get_size()
        self.sw, self.sh = self.orig_w * SCALE_FACTOR, self.orig_h * SCALE_FACTOR
        self.assets = [pygame.transform.smoothscale(img, (self.sw, self.sh)) for img in raw]

        shared.WORLD_WIDTH = self.sw * 2
        shared.WORLD_HEIGHT = self.sh * 2

        self.masks = []
        for img in raw:
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
            shared.BOT_WAYPOINTS = [(START_X, START_Y)]
        self.centerline = shared.BOT_WAYPOINTS

    def is_offroad(self, wx, wy):
        x1, y1, x2, y2 = FINISH_RECT
        if x1 <= wx <= x2 and y1 <= wy <= y2: return False
        if not (0 <= wx < shared.WORLD_WIDTH and 0 <= wy < shared.WORLD_HEIGHT): return True
        idx = int(wx // self.sw) + int(wy // self.sh) * 2
        lx, ly = int((wx % self.sw) // SCALE_FACTOR), int((wy % self.sh) // SCALE_FACTOR)
        return self.masks[idx][ly][lx] == 0

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
        self.max_speed = MAX_SPEED + (num * 1.2)
        self.lap, self.passed_half, self.finished, self.disqualified = 0, False, False, False
        self.path_index = 0
        self._refresh_image()

    def _refresh_image(self):
        self.image = pygame.transform.rotate(self.original, self.angle)

    def update(self, keys, dt, track, can_move):
        if self.finished or self.disqualified or not can_move:
            self.speed *= 0.95
            self._refresh_image()
            return

        if keys[pygame.K_w] or keys[pygame.K_UP]:
            self.speed += ACCELERATION
        elif keys[pygame.K_s] or keys[pygame.K_DOWN]:
            self.speed -= ACCELERATION
        else:
            self.speed *= (1 - FRICTION)

        self.speed = clamp(self.speed, -5, self.max_speed)

        speed_ratio = abs(self.speed) / self.max_speed if self.max_speed > 0 else 0
        current_turn_speed = ROTATION_SPEED * (0.2 + 0.8 * speed_ratio)

        if abs(self.speed) > 0.1:
            d = 1 if self.speed > 0 else -1
            if keys[pygame.K_a] or keys[pygame.K_LEFT]: self.angle = (self.angle + current_turn_speed * d) % 360
            if keys[pygame.K_d] or keys[pygame.K_RIGHT]: self.angle = (self.angle - current_turn_speed * d) % 360

        self._refresh_image()
        rad = math.radians(self.angle)
        nx, ny = self.world_x + math.cos(rad) * self.speed, self.world_y - math.sin(rad) * self.speed

        if track.is_offroad(nx, ny):
            self.disqualified = True
            self.speed = 0.0
        else:
            self.world_x, self.world_y = nx, ny
            min_d = 999999
            for i, p in enumerate(shared.BOT_WAYPOINTS):
                d = math.hypot(nx - p[0], ny - p[1])
                if d < min_d: min_d, self.path_index = d, i


class OfflineWorld:
    def __init__(self, track, bot_count):
        self.track = track
        self.bots = create_bots(bot_count)
        self.path = shared.BOT_WAYPOINTS

    def update(self, dt, player):
        for bot in self.bots:
            if getattr(bot, 'finished', False) or getattr(bot, 'disqualified', False):
                bot.speed *= 0.95
                continue

            tx, ty = self.path[bot.path_index]
            dist = math.hypot(bot.x - tx, bot.y - ty)

            if dist < 120:
                bot.path_index = (bot.path_index + 1) % len(self.path)
                tx, ty = self.path[bot.path_index]

            desired = math.degrees(math.atan2(-(ty - bot.y), tx - bot.x)) % 360
            diff = angle_diff(bot.angle, desired)

            speed_ratio = abs(bot.speed) / bot.max_speed_limit if bot.max_speed_limit > 0 else 0
            current_turn_speed = ROTATION_SPEED * (0.6 + 1.2 * speed_ratio) * dt * 60

            turn = clamp(diff, -current_turn_speed, current_turn_speed)
            bot.angle = (bot.angle + turn) % 360

            target_s = bot.max_speed_limit - (abs(diff) * 0.12)
            if bot.speed < target_s:
                bot.speed += ACCELERATION
            else:
                bot.speed -= FRICTION

            rad = math.radians(bot.angle)
            nx, ny = bot.x + math.cos(rad) * bot.speed, bot.y - math.sin(rad) * bot.speed

            if self.track.is_offroad(nx, ny):
                bot.disqualified = True
                bot.speed = 0.0
            else:
                bot.x, bot.y = nx, ny

        return self._resolve_collisions(player)

    def _resolve_collisions(self, player):
        pts = []
        all_cars_phys = []

        # Собираем все активные объекты
        if not getattr(player, 'disqualified', False):
            all_cars_phys.append(player)

        for b in self.bots:
            if not getattr(b, 'disqualified', False):
                all_cars_phys.append(b)

        min_dist = CAR_RADIUS * 2.2

        for i in range(len(all_cars_phys)):
            c1 = all_cars_phys[i]
            for j in range(i + 1, len(all_cars_phys)):
                c2 = all_cars_phys[j]

                c1_x = getattr(c1, 'world_x', getattr(c1, 'x', 0))
                c1_y = getattr(c1, 'world_y', getattr(c1, 'y', 0))
                c2_x = getattr(c2, 'world_x', getattr(c2, 'x', 0))
                c2_y = getattr(c2, 'world_y', getattr(c2, 'y', 0))

                dx = c2_x - c1_x
                dy = c2_y - c1_y
                dist = math.hypot(dx, dy)

                if dist < min_dist:
                    # ЖЕСТКАЯ КОЛЛИЗИЯ (выталкивание из текстур)
                    if dist == 0: dist = 0.01
                    overlap = min_dist - dist
                    nx, ny = dx / dist, dy / dist
                    push_x, push_y = nx * (overlap * 0.5), ny * (overlap * 0.5)

                    if hasattr(c1, 'world_x'):
                        c1.world_x -= push_x;
                        c1.world_y -= push_y
                    else:
                        c1.x -= push_x;
                        c1.y -= push_y

                    if hasattr(c2, 'world_x'):
                        c2.world_x += push_x;
                        c2.world_y += push_y
                    else:
                        c2.x += push_x;
                        c2.y += push_y

                    c1.speed *= 0.8
                    c2.speed *= 0.8
                    pts.append(((c1_x + c2_x) / 2, (c1_y + c2_y) / 2))

                # НОВАЯ ФИШКА: Радар препятствий (до 120 пикселей впереди)
                elif dist < 120:
                    nx, ny = dx / dist, dy / dist

                    # Проверяем, куда смотрит c1
                    dir1_x, dir1_y = math.cos(math.radians(c1.angle)), -math.sin(math.radians(c1.angle))
                    dot1 = dir1_x * nx + dir1_y * ny  # > 0.8 значит цель почти прямо по курсу

                    # Проверяем, куда смотрит c2
                    dir2_x, dir2_y = math.cos(math.radians(c2.angle)), -math.sin(math.radians(c2.angle))
                    dot2 = dir2_x * (-nx) + dir2_y * (-ny)

                    # Если c1 - это БОТ (нет 'world_x') и впереди препятствие: ТОРМОЗИТ
                    if dot1 > 0.8 and not hasattr(c1, 'world_x'):
                        c1.speed *= 0.88

                        # Если c2 - это БОТ и впереди препятствие: ТОРМОЗИТ
                    if dot2 > 0.8 and not hasattr(c2, 'world_x'):
                        c2.speed *= 0.88

        return pts


class Spark:
    def __init__(self, x, y, vx, vy):
        self.x, self.y, self.vx, self.vy = x, y, vx, vy
        self.life = self.max_life = random.uniform(0.3, 0.8)

    def update(self, dt):
        self.x += self.vx * dt * 60
        self.y += self.vy * dt * 60
        self.vx *= 0.92;
        self.vy *= 0.92
        self.life -= dt

    def draw(self, surface, cx, cy):
        alpha = max(0, min(255, int(255 * (self.life / self.max_life))))
        pygame.draw.circle(surface, (255, 150, 0, alpha), (int(self.x - cx), int(self.y - cy)), 2)


class StartLights:
    def __init__(self):
        self.timer = 0
        self.state = 0
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


async def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    clock = pygame.time.Clock()
    font = pygame.font.SysFont("Arial", 42, bold=True)
    ui_font = pygame.font.SysFont("Arial", 28, bold=True)

    track = FixedTrackMap(screen, font)
    mmap = Minimap(track.assets, track.sw, track.sh)
    world = OfflineWorld(track, 7)

    skins = list_numbered_asset_skins()
    p_num = int(os.path.basename(skins[0]).split('.')[0]) if skins else 1

    player_offset_idx = min(7, len(shared.BOT_SPAWN_OFFSETS) - 1)
    px_off, py_off = shared.BOT_SPAWN_OFFSETS[player_offset_idx]
    player = PlayerCar(START_X + px_off, START_Y + py_off, get_skin(skins[0] if skins else None), p_num)

    bot_skins = []
    for idx, b in enumerate(world.bots):
        box_off, boy_off = shared.BOT_SPAWN_OFFSETS[idx % len(shared.BOT_SPAWN_OFFSETS)]
        b.x = START_X + box_off
        b.y = START_Y + boy_off

        s_idx = (idx + 1) % len(skins) if skins else 0
        b_path = skins[s_idx] if skins else None
        bot_skins.append(get_skin(b_path))

        bot_num = int(os.path.basename(b_path).split('.')[0]) if b_path else 1
        # ИСПРАВЛЕНО: Резко снижена максимальная скорость ботов по отношению к игроку
        b.max_speed_limit = (MAX_SPEED + bot_num)

    lights = StartLights()
    start_timer = 0
    finish_order = []
    sparks = []
    running = True

    clock.tick()

    while running:
        dt = clock.tick(FPS) / 1000.0
        for e in pygame.event.get():
            if e.type == pygame.QUIT: running = False

        start_timer += dt
        can_go = start_timer > 3.5

        player.update(pygame.key.get_pressed(), dt, track, can_go)
        if can_go:
            col_pts = world.update(dt, player)
            for x, y in col_pts:
                for _ in range(6): sparks.append(Spark(x, y, random.uniform(-2, 2), random.uniform(-2, 2)))

        all_cars = [(player, "Player")] + [(b, f"Bot{b.bot_id}") for b in world.bots]
        all_cars.sort(key=lambda x: (x[0].lap, x[0].path_index), reverse=True)
        player_pos = [c[1] for c in all_cars].index("Player") + 1

        if not player.finished and not player.disqualified:
            if not player.passed_half and player.world_x < shared.WORLD_WIDTH * 0.4: player.passed_half = True
            x1, y1, x2, y2 = FINISH_RECT
            if player.passed_half and x1 <= player.world_x <= x2 and y1 <= player.world_y <= y2:
                player.lap += 1;
                player.passed_half = False
                if player.lap >= TOTAL_LAPS: player.finished = True; finish_order.append("Player")

        for b in world.bots:
            if not getattr(b, 'finished', False) and not getattr(b, 'disqualified', False):
                if not getattr(b, 'passed_half', False) and b.x < shared.WORLD_WIDTH * 0.4: b.passed_half = True
                if getattr(b, 'passed_half', False) and x1 <= b.x <= x2 and y1 <= b.y <= y2:
                    b.lap += 1;
                    b.passed_half = False
                    if b.lap >= TOTAL_LAPS: b.finished = True; finish_order.append(f"Bot{b.bot_id}")

        cx = clamp(player.world_x - WIDTH // 2, 0, shared.WORLD_WIDTH - WIDTH)
        cy = clamp(player.world_y - HEIGHT // 2, 0, shared.WORLD_HEIGHT - HEIGHT)

        track.draw(screen, cx, cy)

        for idx, b in enumerate(world.bots):
            if not getattr(b, 'disqualified', False):
                img = pygame.transform.rotate(bot_skins[idx], b.angle)
                screen.blit(img, img.get_rect(center=(int(b.x - cx), int(b.y - cy))))

        if not getattr(player, 'disqualified', False):
            p_img = player.image
            screen.blit(p_img, p_img.get_rect(center=(int(player.world_x - cx), int(player.world_y - cy))))

        for s in sparks:
            s.update(dt)
            s.draw(screen, cx, cy)
        sparks = [s for s in sparks if s.life > 0]

        lights.update(dt)
        lights.draw(screen)

        mmap.draw(screen, player, world.bots)
        draw_text_with_bg(screen, f"МЕСТО: {player_pos} / 8", ui_font, (20, 20))
        draw_text_with_bg(screen, f"КРУГ: {min(player.lap + 1, TOTAL_LAPS)} / {TOTAL_LAPS}", ui_font, (20, 70))

        if player.disqualified:
            draw_text_with_bg(screen, "ДИСКВАЛИФИКАЦИЯ! ВЫЛЕТ С ТРАССЫ", font, (WIDTH // 2 - 300, HEIGHT // 2),
                              (255, 0, 0))
        elif player.finished:
            final_p = finish_order.index("Player") + 1
            draw_text_with_bg(screen, f"ФИНИШ! ТВОЁ МЕСТО: {final_p}", font, (WIDTH // 2 - 200, HEIGHT // 2),
                              (255, 255, 0))

        pygame.display.flip()
        await asyncio.sleep(0)

    pygame.quit()


if __name__ == "__main__": asyncio.run(main())