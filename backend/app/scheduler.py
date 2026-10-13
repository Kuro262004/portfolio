from datetime import datetime, timedelta, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import delete

from .config import settings
from .database import SessionLocal
from .models import Message
from .ws import hub

scheduler = AsyncIOScheduler(timezone="UTC")


def purge_old_messages() -> None:
    cutoff = datetime.now(timezone.utc) - timedelta(days=settings.message_retention_days)
    with SessionLocal() as db:
        db.execute(delete(Message).where(Message.created_at < cutoff))
        db.commit()


async def broadcast_presence() -> None:
    await hub.broadcast({"type": "presence", "online": len(hub.clients)})


def start() -> None:
    scheduler.add_job(purge_old_messages, "cron", hour=3, id="purge_messages", replace_existing=True)
    scheduler.add_job(broadcast_presence, "interval", seconds=30, id="presence", replace_existing=True)
    scheduler.start()
