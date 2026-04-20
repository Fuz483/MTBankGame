import asyncio
import websockets
import json

clients = {}
current_id = 0


async def game_handler(websocket):
    global current_id
    player_id = current_id
    current_id += 1

    print(f"[+] Игрок {player_id} присоединился к гонке.")

    # Стартовые координаты (можно изменить)
    clients[player_id] = {"x": 1250, "y": 840, "angle": 0}

    try:
        async for message in websocket:
            # Получаем данные от этого игрока
            data = json.loads(message)
            clients[player_id] = data

            # Собираем данные всех ОСТАЛЬНЫХ игроков
            others_data = {
                str(pid): pdata
                for pid, pdata in clients.items()
                if pid != player_id
            }

            # Отправляем обновленную картину мира обратно
            await websocket.send(json.dumps(others_data))

    except websockets.exceptions.ConnectionClosed:
        print(f"[-] Игрок {player_id} покинул трассу.")
    finally:
        # Удаляем игрока при отключении
        if player_id in clients:
            del clients[player_id]


async def main():
    print("Сервер MTFormula запущен на ws://localhost:5555")
    # Для игры по локальной сети или интернету замени "localhost" на "0.0.0.0"
    async with websockets.serve(game_handler, "localhost", 5555):
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())