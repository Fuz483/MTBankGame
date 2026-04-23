import random
from typing import List
import shared


class BotCar:
    def __init__(self, bot_id: int):
        self.bot_id = bot_id
        offset_idx = (bot_id + 1) % len(shared.BOT_SPAWN_OFFSETS)
        ox, oy = shared.BOT_SPAWN_OFFSETS[offset_idx]

        self.x, self.y = float(shared.START_X + ox), float(shared.START_Y + oy)
        self.angle, self.speed = 180.0, 0.0
        self.path_index = 0
        self.lane_offset = random.uniform(-8.0, 8.0)

        self.lap = 0
        self.passed_half = False
        self.finished = False
        self.max_speed_limit = shared.MAX_SPEED

    def update_logic(self, dt):
        if self.finished:
            self.speed *= 0.95
            return

        # Проверка чекпоинта (середина пути)
        if not self.passed_half and self.path_index > len(shared.BOT_WAYPOINTS) * 8:
            self.passed_half = True


def create_bots(count: int = 4) -> List[BotCar]:
    return [BotCar(i) for i in range(count)]