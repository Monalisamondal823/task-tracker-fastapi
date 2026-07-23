import asyncio
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from . import models
from .database import get_db
from .security import decode_access_token

router = APIRouter(tags=["dashboard"])


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int) -> None:
        await websocket.accept()
        self.active_connections.setdefault(user_id, []).append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        for user_id, connections in list(self.active_connections.items()):
            if websocket in connections:
                connections.remove(websocket)
                if not connections:
                    self.active_connections.pop(user_id, None)
                break

    async def broadcast_to_user(self, user_id: int, message: dict) -> None:
        connections = list(self.active_connections.get(user_id, []))
        for websocket in connections:
            try:
                await websocket.send_json(message)
            except Exception:
                self.disconnect(websocket)


manager = ConnectionManager()


def _task_to_dict(task: models.Task) -> dict:
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "is_done": task.is_done,
        "attachment_url": task.attachment_url,
        "created_at": task.created_at.isoformat() if task.created_at is not None else None,
    }


def _get_user_from_token(token: str, db: Session) -> Optional[models.User]:
    payload = decode_access_token(token)
    if payload is None:
        return None
    user_id = payload.get("sub")
    if user_id is None:
        return None
    return db.query(models.User).filter(models.User.id == int(user_id)).first()


async def broadcast_user_task_event(user_id: int, event_type: str, task: models.Task) -> None:
    await manager.broadcast_to_user(user_id, {"type": event_type, "task": _task_to_dict(task)})


async def broadcast_user_task_deleted(user_id: int, task_id: int) -> None:
    await manager.broadcast_to_user(user_id, {"type": "task_deleted", "task": {"id": task_id}})


@router.websocket("/ws/dashboard")
async def dashboard_websocket(websocket: WebSocket, token: str = Query(None), db: Session = Depends(get_db)) -> None:
    if not token:
        await websocket.close(code=1008)
        return

    user = _get_user_from_token(token, db)
    if user is None:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user.id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
