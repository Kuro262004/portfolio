from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import current_admin
from ..models import Project, Skill
from ..schemas import ProjectCreate, ProjectOut, SkillOut
from ..ws import hub

router = APIRouter(prefix="/api", tags=["portfolio"])


def _get_or_404(db: Session, project_id: int) -> Project:
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")
    return project


@router.get("/projects", response_model=list[ProjectOut])
def list_projects(category: str | None = None, db: Session = Depends(get_db)):
    q = select(Project).order_by(Project.featured.desc(), Project.created_at.desc())
    if category:
        q = q.where(Project.category == category)
    return db.scalars(q).all()


@router.get("/projects/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, project_id)


@router.post("/projects", response_model=ProjectOut, status_code=201, dependencies=[Depends(current_admin)])
async def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(**data.model_dump())
    db.add(project)
    db.commit()
    await hub.broadcast({"type": "project_added", "title": project.title})
    return project


@router.put("/projects/{project_id}", response_model=ProjectOut, dependencies=[Depends(current_admin)])
def update_project(project_id: int, data: ProjectCreate, db: Session = Depends(get_db)):
    project = _get_or_404(db, project_id)
    for key, value in data.model_dump().items():
        setattr(project, key, value)
    db.commit()
    return project


@router.delete("/projects/{project_id}", status_code=204, dependencies=[Depends(current_admin)])
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = _get_or_404(db, project_id)
    # SQLite doesn't enforce ON DELETE SET NULL by default, so detach skills explicitly.
    db.execute(update(Skill).where(Skill.project_id == project_id).values(project_id=None))
    db.delete(project)
    db.commit()


@router.get("/skills", response_model=list[SkillOut])
def list_skills(db: Session = Depends(get_db)):
    return db.scalars(select(Skill).order_by(Skill.level.desc())).all()
