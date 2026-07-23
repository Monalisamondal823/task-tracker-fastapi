from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from .. import models, schemas
from ..dashboard import broadcast_user_task_deleted, broadcast_user_task_event
from ..database import get_db
from ..deps import get_current_user
from ..s3 import upload_file

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/", response_model=schemas.TaskOut, status_code=201)
async def create_task(
    task_in: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = models.Task(**task_in.dict(), owner_id=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    await broadcast_user_task_event(current_user.id, "task_created", task)
    return task


@router.get("/", response_model=List[schemas.TaskOut])
def list_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Task)
        .filter(models.Task.owner_id == current_user.id)
        .order_by(models.Task.created_at.desc())
        .all()
    )


def _get_owned_task_or_404(task_id: int, db: Session, current_user: models.User) -> models.Task:
    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.owner_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("/{task_id}", response_model=schemas.TaskOut)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return _get_owned_task_or_404(task_id, db, current_user)


@router.put("/{task_id}", response_model=schemas.TaskOut)
async def update_task(
    task_id: int,
    task_in: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = _get_owned_task_or_404(task_id, db, current_user)
    for field, value in task_in.dict(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    await broadcast_user_task_event(current_user.id, "task_updated", task)
    return task


@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = _get_owned_task_or_404(task_id, db, current_user)
    task_id = task.id
    db.delete(task)
    db.commit()
    await broadcast_user_task_deleted(current_user.id, task_id)
    return None


@router.post("/{task_id}/attachment", response_model=schemas.TaskOut)
async def upload_attachment(
    task_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Uploads a file to S3 and links it to the task. Requires S3_BUCKET_NAME to be set."""
    task = _get_owned_task_or_404(task_id, db, current_user)

    file_bytes = await file.read()
    try:
        url = upload_file(file_bytes, file.filename, file.content_type or "application/octet-stream")
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    task.attachment_url = url
    db.commit()
    db.refresh(task)
    await broadcast_user_task_event(current_user.id, "task_updated", task)
    return task
