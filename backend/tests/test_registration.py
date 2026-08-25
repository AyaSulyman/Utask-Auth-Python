from tests.conftest import register_user


def test_successful_registration(client):
    resp = register_user(client)
    assert resp.status_code == 201
    body = resp.json()
    assert body["type"] == "client"
    assert "password" not in body
    assert "hashed_password" not in body


def test_registration_forces_client_even_if_admin_requested(client):
    resp = register_user(client, email="hacker@example.com", type="admin")
    assert resp.status_code == 201
    assert resp.json()["type"] == "client"


def test_invalid_email(client):
    resp = register_user(client, email="not-an-email")
    assert resp.status_code == 400


def test_invalid_phone(client):
    resp = register_user(client, phone="abc123")
    assert resp.status_code == 400


def test_invalid_age_negative(client):
    resp = register_user(client, age=-5)
    assert resp.status_code == 400


def test_invalid_age_out_of_range(client):
    resp = register_user(client, age=999)
    assert resp.status_code == 400


def test_empty_first_name(client):
    resp = register_user(client, first_name="   ")
    assert resp.status_code == 400


def test_empty_last_name(client):
    resp = register_user(client, last_name="")
    assert resp.status_code == 400


def test_weak_password_rejected(client):
    resp = register_user(client, password="short")
    assert resp.status_code == 400


def test_duplicate_email(client):
    first = register_user(client)
    assert first.status_code == 201
    second = register_user(client, first_name="Jane")
    assert second.status_code == 409
