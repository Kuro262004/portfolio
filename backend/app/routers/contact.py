from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import current_admin
from ..models import Message
from ..schemas import MessageCreate, MessageOut

router = APIRouter(prefix="/api/messages", tags=["contact"])


@router.post("", status_code=201)
def send_message(data: MessageCreate, db: Session = Depends(get_db)):
    db.add(Message(**data.model_dump()))
    db.commit()
    return {"ok": True}


@router.get("", response_model=list[MessageOut], dependencies=[Depends(current_admin)])
def list_messages(db: Session = Depends(get_db)):
    return db.scalars(select(Message).order_by(Message.created_at.desc())).all()
