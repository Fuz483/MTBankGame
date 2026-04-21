import asyncio
import websockets
import json

clients = {}  # {player_id: {"ws": websocket, "state": {...}}}
current_id = 0
TICKRATE = 20  # раз в секунду


async def broadcast_loop():
    """Независимый цикл сервера, который рассылает состояние мира всем клиентам."""
    while True:
        if clients:
            # Собираем актуальные состояния всех игроков
            world_state = {
                "type": "update",
                "players": {str(pid): c["state"] for pid, c in clients.items()}
            }
            msg = json.dumps(world_state)

            # Рассылаем всем активным клиентам
            tasks = [c["ws"].send(msg) for c in clients.values() if not c["ws"].closed]
            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)

        await asyncio.sleep(1 / TICKRATE)


async def game_handler(websocket):
    global current_id
    player_id = current_id
    current_id += 1

    print(f"[+] Игрок {player_id} присоединился.")
    clients[player_id] = {
        "ws": websocket,
        "state": {"x": 12205, "y": 9382, "angle": 180}
    }

    try:
        # Отправляем клиенту его ID при подключении
        await websocket.send(json.dumps({"type": "init", "id": player_id}))

        async for message in websocket:
            data = json.loads(message)
            # Обновляем состояние игрока на сервере.
            # Не шлем ответ сразу! Этим занимается broadcast_loop.
            clients[player_id]["state"] = data

    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        print(f"[-] Игрок {player_id} покинул трассу.")
        if player_id in clients:
            del clients[player_id]


async def main():
    print(f"Сервер MTFormula запущен. Tickrate: {TICKRATE}Hz")
    # Запускаем цикл рассылки параллельно серверу
    asyncio.create_task(broadcast_loop())
    async with websockets.serve(game_handler, "0.0.0.0", 5555):
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())