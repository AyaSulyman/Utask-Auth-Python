
from datetime import datetime, timezone
from math import ceil
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import User, UserType
from app.schemas import AdminUserCreate, AdminUserUpdate, UserRegister, UserSelfUpdate
from app.security import hash_password


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(func.lower(User.email) == email.strip().lower()).first()


def get_active_user_by_id(db: Session, user_id: str) -> Optional[User]:
    return db.query(User).filter(User.id == user_id, User.is_deleted.is_(False)).first()


def get_any_user_by_id(db: Session, user_id: str) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def _ensure_email_available(db: Session, email: str, exclude_user_id: Optional[str] = None):
    existing = get_user_by_email(db, email)
    if existing and existing.id != exclude_user_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )


def register_client(db: Session, payload: UserRegister) -> User:

    _ensure_email_available(db, payload.email)

    user = User(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        phone_number=payload.phone_number,
        city=payload.city,
        age=payload.age,
        type=UserType.client,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def admin_create_user(db: Session, payload: AdminUserCreate) -> User:
    """Admin-only creation. The admin explicitly chooses the role."""
    _ensure_email_available(db, payload.email)

    user = User(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        phone_number=payload.phone_number,
        city=payload.city,
        age=payload.age,
        type=payload.type,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def apply_self_update(db: Session, user: User, payload: UserSelfUpdate) -> User:

    data = payload.model_dump(exclude_unset=True)

    if "email" in data and data["email"]:
        _ensure_email_available(db, data["email"], exclude_user_id=user.id)

    if data.get("password"):
        user.hashed_password = hash_password(data.pop("password"))
    else:
        data.pop("password", None)

    for field, value in data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


def admin_update_user(db: Session, user: User, payload: AdminUserUpdate) -> User:

    data = payload.model_dump(exclude_unset=True)

    if "email" in data and data["email"]:
        _ensure_email_available(db, data["email"], exclude_user_id=user.id)

    if data.get("password"):
        user.hashed_password = hash_password(data.pop("password"))
    else:
        data.pop("password", None)

    for field, value in data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


def soft_delete_user(db: Session, user: User) -> User:
    user.is_deleted = True
    user.deleted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    return user


def list_users(
    db: Session,
    page: int,
    limit: int,
    city: Optional[str] = None,
    user_type: Optional[UserType] = None,
    age: Optional[int] = None,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    email: Optional[str] = None,
    include_deleted: bool = False,
):
    query = db.query(User)

    if not include_deleted:
        query = query.filter(User.is_deleted.is_(False))
    if city:
        query = query.filter(func.lower(User.city) == city.strip().lower())
    if user_type:
        query = query.filter(User.type == user_type)
    if age is not None:
        query = query.filter(User.age == age)
    if first_name:
        query = query.filter(User.first_name.ilike(f"%{first_name.strip()}%"))
    if last_name:
        query = query.filter(User.last_name.ilike(f"%{last_name.strip()}%"))
    if email:
        query = query.filter(User.email.ilike(f"%{email.strip()}%"))

    total = query.count()
    total_pages = max(ceil(total / limit), 1) if total else 0

    users = (
        query.order_by(User.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return users, total, total_pages


def count_active_users(db: Session) -> int:
    return db.query(User).filter(User.is_deleted.is_(False)).count()


def average_age_active_users(db: Session) -> float:
    avg = (
        db.query(func.avg(User.age)).filter(User.is_deleted.is_(False)).scalar()
    )
    return round(float(avg), 2) if avg is not None else 0.0


def top_cities(db: Session, limit: int = 3):
    rows = (
        db.query(User.city, func.count(User.id).label("count"))
        .filter(User.is_deleted.is_(False))
        .group_by(User.city)
        .order_by(func.count(User.id).desc())
        .limit(limit)
        .all()
    )
    return [{"city": city, "count": count} for city, count in rows]
