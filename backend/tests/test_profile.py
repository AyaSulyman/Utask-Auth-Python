from tests.conftest import auth_headers, login, register_user


def _get_token(client, email="john@example.com", password="Password123"):
    register_user(client, email=email, password=password)
    return login(client, email, password).json()["access_token"]


def test_get_own_profile(client):
    token = _get_token(client)
    resp = client.get("/users/me", headers=auth_headers(token))
    assert resp.status_code == 200
    assert resp.json()["type"] == "client"


def test_update_own_profile(client):
    token = _get_token(client)
    resp = client.put(
        "/users/me", json={"city": "Beirut"}, headers=auth_headers(token)
    )
    assert resp.status_code == 200
    assert resp.json()["city"] == "Beirut"


def test_update_own_password(client):
    token = _get_token(client)
    resp = client.put(
        "/users/me", json={"password": "NewPassword123"}, headers=auth_headers(token)
    )
    assert resp.status_code == 200

    relogin = login(client, "john@example.com", "NewPassword123")
    assert relogin.status_code == 200


def test_client_cannot_change_own_role(client):
    token = _get_token(client)
    resp = client.put(
        "/users/me", json={"type": "admin"}, headers=auth_headers(token)
    )

    assert resp.status_code == 200
    assert resp.json()["type"] == "client"

    me = client.get("/users/me", headers=auth_headers(token))
    assert me.json()["type"] == "client"
