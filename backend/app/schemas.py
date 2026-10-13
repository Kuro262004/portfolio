from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

Category = Literal["developer", "ai", "designer", "professional"]


class ProjectBase(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    summary: str = Field(min_length=1, max_length=300)
    description: str = ""
    category: Category
    tags: list[str] = []
    image_url: str = ""
    live_url: str = ""
    repo_url: str = ""
    featured: bool = False


class ProjectCreate(ProjectBase):
    pass


class ProjectOut(ProjectBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class SkillOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    level: int
    category: str
    description: str
    parent_id: int | None
    project_id: int | None


class MessageCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    body: str = Field(min_length=10, max_length=4000)


class MessageOut(MessageCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
