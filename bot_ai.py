"""
bot_ai.py — Server-side bot state and steering logic.

Each BotCar follows a cyclic list of waypoints and applies simple
avoidance when another car is directly ahead.  Physics is authoritative
on the server so clients just interpolate the received positions.
"""
import math
from typing import List, Optional

from shared import (
    BOT_WAYPOINTS, BOT_SPAWN_OFFSETS, BOT_COLORS,
    MAX_SPEED, ACCELERATION, FRICTION, ROTATION_SPEED,
    CAR_RADIUS, START_X, START_Y,
    angle_diff, clamp, circle_collision,
)


class BotCar:
    """Represents one AI-controlled car running on the server."""

    WAYPOINT_REACH_DIST = 120   # pixels — advance to next waypoint when this close
    BOT_MAX_SPEED       = 5.5
    BOT_ACCEL           = 0.12
    BOT_FRICTION        = 0.05
    BOT_ROTATION        = 2.5   # degrees/tick

    def __init__(self, bot_id: int):
        self.bot_id  = bot_id
        self.color   = BOT_COLORS[bot_id % len(BOT_COLORS)]

        # Spawn slightly behind the start line so bots don't pile up
        ox, oy = BOT_SPAWN_OFFSETS[bot_id % len(BOT_SPAWN_OFFSETS)]
        self.x     = float(START_X + ox)
        self.y     = float(START_Y + oy)
        self.angle = 180.0    # Facing left (same as player default)
        self.speed = 0.0

        # Start at different waypoints so they spread out immediately
        self.wp_index = (bot_id * 3) % len(BOT_WAYPOINTS)

    # ── Internal helpers ─────────────────────────────────────────────────────

    def _current_waypoint(self):
        return BOT_WAYPOINTS[self.wp_index]

    def _advance_waypoint(self):
        self.wp_index = (self.wp_index + 1) % len(BOT_WAYPOINTS)

    def _angle_to(self, tx: float, ty: float) -> float:
        """Return the angle (degrees, pygame convention) from self to (tx, ty)."""
        dx = tx - self.x
        dy = ty - self.y
        # math.atan2 gives angle in standard coords; pygame rotates CCW and uses degrees
        return math.degrees(math.atan2(-dy, dx)) % 360

    # ── Main update (called every server tick) ───────────────────────────────

    def update(self, dt: float, all_cars: list):
        """
        dt  — seconds per tick (1 / TICKRATE)
        all_cars — list of all BotCar + player state dicts with 'x','y' keys
        """
        wx, wy = self._current_waypoint()

        # Distance to current waypoint
        dist_to_wp = math.hypot(wx - self.x, wy - self.y)
        if dist_to_wp < self.WAYPOINT_REACH_DIST:
            self._advance_waypoint()
            wx, wy = self._current_waypoint()

        # Desired heading
        target_angle = self._angle_to(wx, wy)

        # Check for cars directly ahead — if very close, steer away slightly
        avoidance_offset = self._avoidance_steer(all_cars)
        target_angle = (target_angle + avoidance_offset) % 360

        # Steer towards target
        turn = angle_diff(self.angle, target_angle)
        turn = clamp(turn, -self.BOT_ROTATION, self.BOT_ROTATION)
        self.angle = (self.angle + turn) % 360

        # Speed: slow down on tight turns, accelerate on straights
        turn_factor = 1.0 - min(abs(turn) / 30.0, 0.6)
        desired_speed = self.BOT_MAX_SPEED * turn_factor

        if self.speed < desired_speed:
            self.speed = min(self.speed + self.BOT_ACCEL, desired_speed)
        else:
            self.speed = max(self.speed - self.BOT_FRICTION, desired_speed)

        self.speed = clamp(self.speed, 0.0, self.BOT_MAX_SPEED)

        # Move
        rad = math.radians(self.angle)
        self.x += math.cos(rad) * self.speed
        self.y -= math.sin(rad) * self.speed   # pygame Y is inverted

    def _avoidance_steer(self, all_cars: list) -> float:
        """
        Returns a small angle offset (±degrees) to nudge the bot away from
        cars that are close ahead.
        """
        LOOK_AHEAD   = CAR_RADIUS * 5
        AVOID_DEGREES = 25.0
        offset = 0.0

        rad = math.radians(self.angle)
        fwd_x = math.cos(rad)
        fwd_y = -math.sin(rad)

        for car in all_cars:
            # Если это словарь (игрок), берем по ключу. Если объект (бот) - как атрибут.
            if isinstance(car, dict):
                cx = car['x']
                cy = car['y']
            else:
                cx = car.x
                cy = car.y

            dx = cx - self.x
            dy = cy - self.y
            dist = math.hypot(dx, dy)

            if dist < 1 or dist > LOOK_AHEAD:
                continue

            # Project onto forward vector
            along = dx * fwd_x + dy * fwd_y
            if along < 0:
                continue   # Behind us

            # Lateral offset (positive = right of forward)
            lateral = dx * fwd_y - dy * fwd_x
            if abs(lateral) < CAR_RADIUS * 2:
                # Car is directly ahead — nudge away from it
                side = -1 if lateral >= 0 else 1
                weight = 1.0 - (dist / LOOK_AHEAD)
                offset += side * AVOID_DEGREES * weight

        return clamp(offset, -AVOID_DEGREES, AVOID_DEGREES)

    # ── Push-apart resolution (called after all updates) ─────────────────────

    def resolve_collision(self, other_x: float, other_y: float,
                          other_r: float = CAR_RADIUS):
        """Push self away from another circular object."""
        colliding, overlap, nx, ny = circle_collision(
            self.x, self.y, other_x, other_y, CAR_RADIUS, other_r
        )
        if colliding:
            # Move bot half the overlap away
            self.x -= nx * overlap * 0.5
            self.y -= ny * overlap * 0.5
            # Bleed speed on impact
            self.speed *= 0.7

    def to_dict(self) -> dict:
        return {
            'x':     self.x,
            'y':     self.y,
            'angle': self.angle,
            'speed': self.speed,
            'color': list(self.color),
            'is_bot': True,
            'bot_id': self.bot_id,
        }


def create_bots(count: int = 8) -> List[BotCar]:
    return [BotCar(i) for i in range(min(count, 10))]
