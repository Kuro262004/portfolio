from fastapi import WebSocket


class LiveHub:
    """Tracks open WebSocket clients and broadcasts JSON events to all of them."""

    def __init__(self) -> None:
        self.clients: set[WebSocket] = set()

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self.clients.add(ws)
        await self.broadcast({"type": "presence", "online": len(self.clients)})

    async def disconnect(self, ws: WebSocket) -> None:
        self.clients.discard(ws)
        await self.broadcast({"type": "presence", "online": len(self.clients)})

    async def broadcast(self, event: dict) -> None:
        for ws in list(self.clients):
            try:
                await ws.send_json(event)
            except Exception:
                self.clients.discard(ws)


hub = LiveHub()
