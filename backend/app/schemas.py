
import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.config import settings
from app.models import UserType

PHONE_REGEX = re.compile(r"^\+?[0-9]{7,15}$")

PASSWORD_COMPLEXITY_REGEX = re.compile(r"^(?=.*[A-Za-z])(?=.*\d).+$")

MIN_AGE = 13
MAX_AGE = 120


def validate_name(value: str, field_name: str) -> str:
    value = (value or "").strip()
    if not value:
        raise ValueError(f"{field_name} must not be empty")
    if len(value) > 100:
        raise ValueError(f"{field_name} must be at most 100 characters")
    return value


def validate_phone(value: str) -> str:
    value = (value or "").strip()
    if not PHONE_REGEX.match(value):
        raise ValueError(
            "Phone number must be a valid number, e.g. +96170123456 (7-15 digits, optional +)"
        )
    return value


def validate_city(value: str) -> str:
    value = (value or "").strip()
    if not value:
        raise ValueError("City must not be empty")
    return value


def validate_age(value: int) -> int:
    if value <= 0:
        raise ValueError("Age must be a positive number")
    if value < MIN_AGE or value > MAX_AGE:
        raise ValueError(f"Age must be between {MIN_AGE} and {MAX_AGE}")
    return value


def validate_password(value: str) -> str:
    if len(value) < settings.PASSWORD_MIN_LENGTH:
        raise ValueError(
            f"Password must be at least {settings.PASSWORD_MIN_LENGTH} characters long"
        )
    if not PASSWORD_COMPLEXITY_REGEX.match(value):
        raise ValueError("Password must contain at least one letter and one number")
    return value


# ---------------------------------------------------------------------------
# Registration (PUBLIC) — deliberately has no `type` field.
# ---------------------------------------------------------------------------
class UserRegister(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: EmailStr
    phone_number: str = Field(..., alias="phone")
    city: str
    age: int
    password: str

    model_config = ConfigDict(populate_by_name=True)

    _v_first_name = field_validator("first_name")(
        lambda v: validate_name(v, "First name")
    )
    _v_last_name = field_validator("last_name")(
        lambda v: validate_name(v, "Last name")
    )
    _v_phone = field_validator("phone_number")(validate_phone)
    _v_city = field_validator("city")(validate_city)
    _v_age = field_validator("age")(validate_age)
    _v_password = field_validator("password")(validate_password)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class AdminUserCreate(UserRegister):
    type: UserType


class UserSelfUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = Field(None, alias="phone")
    city: Optional[str] = None
    age: Optional[int] = None
    password: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)

    @field_validator("first_name")
    @classmethod
    def _v_first_name(cls, v):
        return validate_name(v, "First name") if v is not None else v

    @field_validator("last_name")
    @classmethod
    def _v_last_name(cls, v):
        return validate_name(v, "Last name") if v is not None else v

    @field_validator("phone_number")
    @classmethod
    def _v_phone(cls, v):
        return validate_phone(v) if v is not None else v

    @field_validator("city")
    @classmethod
    def _v_city(cls, v):
        return validate_city(v) if v is not None else v

    @field_validator("age")
    @classmethod
    def _v_age(cls, v):
        return validate_age(v) if v is not None else v

    @field_validator("password")
    @classmethod
    def _v_password(cls, v):
        return validate_password(v) if v is not None else v



class AdminUserUpdate(UserSelfUpdate):
    type: Optional[UserType] = None


class UserOut(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str = Field(..., serialization_alias="phone")
    city: str
    age: int
    type: UserType
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class PaginatedUsers(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int
    users: list[UserOut]


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    message: str


class CountStats(BaseModel):
    total_users: int


class AverageAgeStats(BaseModel):
    average_age: float


class CityCount(BaseModel):
    city: str
    count: int


class TopCitiesStats(BaseModel):
    cities: list[CityCount]
