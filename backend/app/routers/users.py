
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models import User, UserType
from app.schemas import (
    AdminUserCreate,
    AdminUserUpdate,
    MessageResponse,
    PaginatedUsers,
    UserOut,
    UserSelfUpdate,
)
from app.services import user_service

router = APIRouter(tags=["Users"])


@router.get("/users/me", response_model=UserOut, summary="Get my own profile")
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/users/me", response_model=UserOut, summary="Update my own profile")
def update_my_profile(
    payload: UserSelfUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
  
    return user_service.apply_self_update(db, current_user, payload)


@router.post(
    "/users",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="(Admin) Create a client or admin account",
)
def admin_create_user(
    payload: AdminUserCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return user_service.admin_create_user(db, payload)



@router.get(
    "/users",
    response_model=PaginatedUsers,
    summary="(Admin) List users with pagination, filtering and search",
)
def admin_list_users(
    page: int = Query(1, ge=1, description="Page number, starting at 1"),
    limit: int = Query(
        settings.DEFAULT_PAGE_SIZE, ge=1, le=settings.MAX_PAGE_SIZE, description="Page size"
    ),
    city: Optional[str] = Query(None),
    type: Optional[UserType] = Query(None),
    age: Optional[int] = Query(None, gt=0),
    first_name: Optional[str] = Query(None),
    last_name: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    users, total, total_pages = user_service.list_users(
        db,
        page=page,
        limit=limit,
        city=city,
        user_type=type,
        age=age,
        first_name=first_name,
        last_name=last_name,
        email=email,
    )
    return PaginatedUsers(
        page=page, limit=limit, total=total, total_pages=total_pages, users=users
    )


@router.put(
    "/users/{user_id}",
    response_model=UserOut,
    summary="(Admin) Update any user, including their role",
)
def admin_update_user(
    user_id: str,
    payload: AdminUserUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    user = user_service.get_any_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user_service.admin_update_user(db, user, payload)


@router.delete(
    "/users/{user_id}",
    response_model=MessageResponse,
    summary="(Admin) Soft-delete a user",
)
def admin_delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account",
        )

    user = user_service.get_any_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.is_deleted:
        return MessageResponse(message="User is already deleted")

    user_service.soft_delete_user(db, user)
    return MessageResponse(message="User deleted successfully")
