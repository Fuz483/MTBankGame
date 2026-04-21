import pygame
import asyncio
import json
import sys
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Импорты из твоей папки sprites
from sprites.track import Background
from sprites.cars import Car

WIDTH = 1280
HEIGHT = 720
FPS = 60
SERVER_URL = "ws://localhost:5555"

# --- СТЕЛС-ИМПОРТ ДЛЯ БРАУЗЕРА ---
IS_WEB = sys.platform == 'emscripten'
if IS_WEB:
    js = __import__('js')
    pyo_ffi = __import__('pyo' + 'dide.ffi')
    create_proxy = getattr(pyo_ffi, 'create_proxy')

pygame.init()
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("MTFormula - Web")
clock = pygame.time.Clock()


def draw_remote_car(surface, x, y, angle, camera_x, camera_y, original_image):
    """Отрисовка машин других игроков"""
    rotated_image = pygame.transform.rotate(original_image, angle)
    rect = rotated_image.get_rect(center=(int(x), int(y)))
    rect.x -= camera_x
    rect.y -= camera_y
    surface.blit(rotated_image, rect)


async def main():
    background = Background(zoom=8.0)
    player_car = Car(1250, 840)

    other_players = {}
    ws = None

    if IS_WEB:
        try:
            ws = js.WebSocket.new(SERVER_URL)

            def on_message(event):
                nonlocal other_players
                other_players = json.loads(event.data)

            ws.onmessage = create_proxy(on_message)
            print("Ожидание подключения к мультиплееру...")
        except Exception as e:
            print("Игра оффлайн. Ошибка сети:", e)

    running = True
    while running:
        clock.tick(FPS)
        keys = pygame.key.get_pressed()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        dx, dy = player_car.update(keys)
        player_car.move(dx, dy)

        # Выезд на траву
        check_x = max(0, min(int(player_car.world_x), background.rect.width - 1))
        check_y = max(0, min(int(player_car.world_y), background.rect.height - 1))
        color_under = background.image.get_at((check_x, check_y))

        if color_under.g > color_under.r + 20 and color_under.g > color_under.b + 20:
            player_car.move(-dx, -dy)
            player_car.speed = 0

            # Отправка координат
        if IS_WEB and ws and getattr(ws, 'readyState', 0) == 1:
            payload = {"x": player_car.world_x, "y": player_car.world_y, "angle": player_car.angle}
            ws.send(json.dumps(payload))

        camera_x = player_car.world_x - WIDTH // 2
        camera_y = player_car.world_y - HEIGHT // 2

        # Отрисовка
        screen.fill((0, 0, 0))
        background.draw(screen, camera_x, camera_y)

        for pid, pdata in other_players.items():
            draw_remote_car(
                screen, pdata['x'], pdata['y'], pdata['angle'],
                camera_x, camera_y, player_car.original_image
            )

        player_car.draw(screen, camera_x, camera_y)
        pygame.display.update()

        # Тик для WebAssembly
        await asyncio.sleep(0)


if __name__ == "__main__":
    asyncio.run(main())