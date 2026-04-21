import pygame
import asyncio
import json
import sys
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

from sprites.track import Background
from sprites.cars import Car

WIDTH = 1280
HEIGHT = 720
FPS = 60
SERVER_URL = "ws://localhost:5555"

IS_WEB = sys.platform == 'emscripten'
if IS_WEB:
    import pyodide
    import js

    create_proxy = pyodide.ffi.create_proxy

pygame.init()
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("MTFormula - Web")
clock = pygame.time.Clock()


# --- МАТЕМАТИКА ИНТЕРПОЛЯЦИИ ---
def lerp(a, b, t):
    """Линейная интерполяция координат"""
    return a + (b - a) * t


def lerp_angle(a, b, t):
    """Интерполяция углов по кратчайшему пути (чтобы не крутило через весь круг)"""
    diff = (b - a + 180) % 360 - 180
    return (a + diff * t) % 360


def draw_remote_car(surface, x, y, angle, camera_x, camera_y, original_image):
    rotated_image = pygame.transform.rotate(original_image, angle)
    rect = rotated_image.get_rect(center=(int(x), int(y)))
    rect.x -= camera_x
    rect.y -= camera_y
    surface.blit(rotated_image, rect)


async def main():
    background = Background(zoom=8.0)
    player_car = Car(12205, 9382)

    # other_players будет хранить: { "id": {"current": {...}, "target": {...}} }
    other_players = {}
    my_id = None
    ws = None

    if IS_WEB:
        try:
            ws = js.WebSocket.new(SERVER_URL)

            def on_message(event):
                nonlocal other_players, my_id
                data = json.loads(event.data)

                # Инициализация (сервер выдал нам ID)
                if data.get("type") == "init":
                    my_id = str(data["id"])

                # Пришел тик с сервера
                elif data.get("type") == "update":
                    players_data = data.get("players", {})
                    for pid, pdata in players_data.items():
                        if pid == my_id:
                            continue  # Себя не интерполируем и не рисуем дважды

                        if pid not in other_players:
                            # Новый игрок
                            other_players[pid] = {
                                "current": pdata.copy(),
                                "target": pdata.copy()
                            }
                        else:
                            # Обновляем целевую точку для интерполяции
                            other_players[pid]["target"] = pdata

                    # Очистка отключившихся игроков
                    disconnected = set(other_players.keys()) - set(players_data.keys())
                    for pid in disconnected:
                        del other_players[pid]

            ws.onmessage = create_proxy(on_message)
            print("Ожидание подключения к мультиплееру...")
        except Exception as e:
            print("Игра оффлайн. Ошибка сети:", e)

    # Таймер отправки данных (чтобы не спамить 60 раз в секунду)
    last_send_time = 0
    SEND_INTERVAL = 1000 // 20  # Отправляем 20 раз в секунду (каждые 50мс)

    running = True
    while running:
        current_time = pygame.time.get_ticks()
        clock.tick(FPS)
        keys = pygame.key.get_pressed()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        # --- ЛОГИКА ИГРОКА ---
        dx, dy = player_car.update(keys)
        player_car.move(dx, dy)

        check_x = max(0, min(int(player_car.world_x), background.rect.width - 1))
        check_y = max(0, min(int(player_car.world_y), background.rect.height - 1))
        color_under = background.image.get_at((check_x, check_y))

        if color_under.g > color_under.r + 20 and color_under.g > color_under.b + 20:
            player_car.move(-dx, -dy)
            player_car.speed = 0

        # --- СЕТЬ: ОТПРАВКА ---
        if IS_WEB and ws and getattr(ws, 'readyState', 0) == 1:
            if current_time - last_send_time > SEND_INTERVAL:
                payload = {
                    "x": player_car.world_x,
                    "y": player_car.world_y,
                    "angle": player_car.angle
                }
                ws.send(json.dumps(payload))
                last_send_time = current_time

        # --- СЕТЬ: ИНТЕРПОЛЯЦИЯ ОППОНЕНТОВ ---
        # Сглаживаем движение на 20% каждый кадр (подбирается экспериментально)
        lerp_factor = 0.2
        for pid, pdata in other_players.items():
            curr = pdata["current"]
            targ = pdata["target"]

            curr["x"] = lerp(curr["x"], targ["x"], lerp_factor)
            curr["y"] = lerp(curr["y"], targ["y"], lerp_factor)
            curr["angle"] = lerp_angle(curr["angle"], targ["angle"], lerp_factor)

        # --- КАМЕРА И ОТРИСОВКА ---
        camera_x = player_car.world_x - WIDTH // 2
        camera_y = player_car.world_y - HEIGHT // 2

        screen.fill((0, 0, 0))
        background.draw(screen, camera_x, camera_y)

        for pid, pdata in other_players.items():
            curr = pdata["current"]
            draw_remote_car(
                screen, curr['x'], curr['y'], curr['angle'],
                camera_x, camera_y, player_car.original_image
            )

        player_car.draw(screen, camera_x, camera_y)
        pygame.display.update()

        await asyncio.sleep(0)


if __name__ == "__main__":
    asyncio.run(main())