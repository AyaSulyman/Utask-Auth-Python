
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.database import get_db
from app.schemas import Token, UserLogin, UserOut, UserRegister
from app.security import create_access_token, verify_password
from app.services import user_service

router = APIRouter(tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new account (always created as 'client')",
)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    user = user_service.register_client(db, payload)
    return user


@router.post("/login", response_model=Token, summary="Log in and receive a JWT")
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = user_service.get_user_by_email(db, payload.email)

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if user.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account has been deactivated",
        )

    access_token = create_access_token(subject=user.id, extra_claims={"type": user.type.value})
    return Token(access_token=access_token)

@router.post(
    "/login/oauth2",
    response_model=Token,
    include_in_schema=False,
)
def login_oauth2(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = user_service.get_user_by_email(db, form_data.username)

    if not user or not verify_password(
        form_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if user.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account has been deactivated",
        )

    access_token = create_access_token(
        subject=user.id,
        extra_claims={"type": user.type.value},
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
    )
