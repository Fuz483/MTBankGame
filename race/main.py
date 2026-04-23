import asyncio
import client

# Этот файл нужен только для того, чтобы pygbag нашел точку входа.
# Он просто перенаправляет выполнение в твой основной клиент.

if __name__ == "__main__":
    try:
        asyncio.run(client.main())
    except KeyboardInterrupt:
        pass