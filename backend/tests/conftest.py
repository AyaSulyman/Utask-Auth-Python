import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    from fastapi.testclient import TestClient

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def register_user(client, **overrides):
    payload = {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "phone": "+96170123456",
        "city": "Tripoli",
        "age": 25,
        "password": "Password123",
    }
    payload.update(overrides)
    return client.post("/register", json=payload)


def login(client, email, password):
    return client.post("/login", json={"email": email, "password": password})


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def make_admin_directly(db_session):
    """Helper: create an admin user straight through the ORM so tests don't
    have a chicken-and-egg problem (need an admin to create an admin)."""
    from app.models import User, UserType
    from app.security import hash_password

    admin = User(
        first_name="Admin",
        last_name="Root",
        email="admin@example.com",
        phone_number="+96171000000",
        city="Beirut",
        age=35,
        type=UserType.admin,
        hashed_password=hash_password("AdminPass123"),
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin
