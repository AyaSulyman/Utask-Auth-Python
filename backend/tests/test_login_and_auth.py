from tests.conftest import auth_headers, login, register_user


def test_successful_login(client):
    register_user(client)
    resp = login(client, "john@example.com", "Password123")
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password(client):
    register_user(client)
    resp = login(client, "john@example.com", "WrongPass123")
    assert resp.status_code == 401


def test_login_nonexistent_email(client):
    resp = login(client, "ghost@example.com", "Password123")
    assert resp.status_code == 401


def test_soft_deleted_user_cannot_login(client, db_session):
    register_user(client)
    resp = login(client, "john@example.com", "Password123")
    token = resp.json()["access_token"]

    from app.services import user_service

    user = user_service.get_user_by_email(db_session, "john@example.com")
    user_service.soft_delete_user(db_session, user)

    resp2 = login(client, "john@example.com", "Password123")
    assert resp2.status_code == 401


def test_request_without_jwt_is_rejected(client):
    resp = client.get("/users/me")
    assert resp.status_code == 401


def test_invalid_jwt_is_rejected(client):
    resp = client.get("/users/me", headers=auth_headers("this.is.not.a.valid.jwt"))
    assert resp.status_code == 401


def test_valid_jwt_allows_access(client):
    register_user(client)
    token = login(client, "john@example.com", "Password123").json()["access_token"]
    resp = client.get("/users/me", headers=auth_headers(token))
    assert resp.status_code == 200
    assert resp.json()["email"] == "john@example.com"
