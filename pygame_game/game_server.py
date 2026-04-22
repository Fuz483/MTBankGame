"""
game_server.py — Authoritative WebSocket game server for MTFormula.

Responsibilities
────────────────
• Accept and manage up to 8 simultaneous player connections.
• Run 8 AI bots that follow waypoints and avoid collisions.
• Broadcast the full world state (players + bots) at TICKRATE Hz.
• Resolve bot-bot and bot-player circle collisions on the server side.

Run:
    python game_server.py [--bots N]   # N bots (default 8, max 10)
"""
import asyncio
import json
import sys
import os
import math
import argparse

os.chdir(os.path.dirname(os.path.abspath(__file__)))

try:
    import websockets
except ImportError:
    print("ERROR: Install websockets — pip install websockets")
    sys.exit(1)

from shared import (
    TICKRATE, START_X, START_Y, CAR_RADIUS,
    circle_collision, clamp,
)
from bot_ai import BotCar, create_bots

# ── Player registry ───────────────────────────────────────────────────────────
# { player_id (int): {"ws": websocket, "state": {x,y,angle,speed}} }
_players: dict[int, dict] = {}
_next_id: int = 0
MAX_PLAYERS = 8

# ── Bots ──────────────────────────────────────────────────────────────────────
_bots: list[BotCar] = []


# ── Helper: build a snapshot of all bots as dicts ────────────────────────────

def _bots_snapshot() -> dict:
    return {str(b.bot_id): b.to_dict() for b in _bots}


def _players_snapshot() -> dict:
    return {str(pid): c['state'] for pid, c in _players.items()}


# ── Collision resolution between all server-side objects ─────────────────────

def _resolve_bot_collisions():
    """Push bots apart from each other and from known player positions."""
    n = len(_bots)
    # Bot-bot
    for i in range(n):
        for j in range(i + 1, n):
            a, b = _bots[i], _bots[j]
            col, overlap, nx, ny = circle_collision(a.x, a.y, b.x, b.y)
            if col:
                # Push both apart equally
                a.x -= nx * overlap * 0.5
                a.y -= ny * overlap * 0.5
                b.x += nx * overlap * 0.5
                b.y += ny * overlap * 0.5
                a.speed *= 0.7
                b.speed *= 0.7

    # Bot-player (bots yield to players)
    for bot in _bots:
        for pid, p in _players.items():
            px = p['state'].get('x', START_X)
            py = p['state'].get('y', START_Y)
            col, overlap, nx, ny = circle_collision(bot.x, bot.y, px, py)
            if col:
                # Only push bot away; player physics is client-side
                bot.x -= nx * overlap * 0.8
                bot.y -= ny * overlap * 0.8
                bot.speed *= 0.6


# ── World tick ────────────────────────────────────────────────────────────────

async def _world_loop():
    dt = 1.0 / TICKRATE

    # Build list of "car-like" objects for bot avoidance
    def _all_cars():
        cars = list(_bots)
        for p in _players.values():
            cars.append(p['state'])
        return cars

    while True:
        await asyncio.sleep(dt)

        # Update each bot
        all_cars = _all_cars()
        for bot in _bots:
            # Pass list excluding self for avoidance
            others = [c for c in all_cars if c is not bot]
            bot.update(dt, others)

        # Resolve inter-object collisions
        _resolve_bot_collisions()

        # Broadcast world state to all connected players
        if _players:
            msg = json.dumps({
                'type':    'update',
                'players': _players_snapshot(),
                'bots':    _bots_snapshot(),
            })
            dead = []
            for pid, p in _players.items():
                try:
                    await p['ws'].send(msg)
                except Exception:
                    dead.append(pid)
            for pid in dead:
                _players.pop(pid, None)


# ── Connection handler ────────────────────────────────────────────────────────

async def _player_handler(websocket):
    global _next_id
    player_id = _next_id
    _next_id += 1

    if len(_players) >= MAX_PLAYERS:
        await websocket.send(json.dumps({'type': 'error', 'msg': 'server_full'}))
        await websocket.close()
        return

    print(f"[+] Player {player_id} connected. Total: {len(_players) + 1}")

    _players[player_id] = {
        'ws':    websocket,
        'state': {
            'x':     float(START_X),
            'y':     float(START_Y),
            'angle': 180.0,
            'speed': 0.0,
        },
    }

    try:
        # Send the player their assigned ID and initial bot info
        await websocket.send(json.dumps({
            'type': 'init',
            'id':   player_id,
            'bots': _bots_snapshot(),
        }))

        async for raw in websocket:
            try:
                data = json.loads(raw)
                # Sanitise incoming values to prevent abuse
                _players[player_id]['state'] = {
                    'x':     clamp(float(data.get('x',     START_X)), 0, 200000),
                    'y':     clamp(float(data.get('y',     START_Y)), 0, 200000),
                    'angle': float(data.get('angle', 180)) % 360,
                    'speed': clamp(float(data.get('speed', 0)), -10, 20),
                }
            except Exception:
                pass  # Ignore malformed messages

    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        print(f"[-] Player {player_id} disconnected. Total: {len(_players) - 1}")
        _players.pop(player_id, None)


# ── Entry point ───────────────────────────────────────────────────────────────

async def main(num_bots: int = 8):
    global _bots
    _bots = create_bots(num_bots)
    print(f"MTFormula server — {num_bots} bots — tickrate {TICKRATE} Hz")
    print("Listening on ws://0.0.0.0:5555")

    asyncio.create_task(_world_loop())

    port = int(os.environ.get("PORT", 5555))
    async with websockets.serve(_player_handler, '0.0.0.0', port):
        await asyncio.Future()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='MTFormula game server')
    parser.add_argument('--bots', type=int, default=8,
                        help='Number of bots (0-10, default 8)')
    args = parser.parse_args()
    asyncio.run(main(num_bots=clamp(args.bots, 0, 10)))
