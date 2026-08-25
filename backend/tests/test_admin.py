from tests.conftest import auth_headers, login, make_admin_directly, register_user


def _admin_token(client, db_session):
    make_admin_directly(db_session)
    return login(client, "admin@example.com", "AdminPass123").json()["access_token"]


def _client_token(client, email="john@example.com"):
    register_user(client, email=email)
    return login(client, email, "Password123").json()["access_token"]


def test_client_cannot_access_admin_list(client):
    token = _client_token(client)
    resp = client.get("/users", headers=auth_headers(token))
    assert resp.status_code == 403


def test_admin_can_list_users(client, db_session):
    admin_token = _admin_token(client, db_session)
    _client_token(client)
    resp = client.get("/users", headers=auth_headers(admin_token))
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] >= 1
    assert "users" in body


def test_admin_creates_client(client, db_session):
    admin_token = _admin_token(client, db_session)
    resp = client.post(
        "/users",
        json={
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "jane@example.com",
            "phone": "+96170123456",
            "city": "Beirut",
            "age": 30,
            "type": "client",
            "password": "SecurePassword123",
        },
        headers=auth_headers(admin_token),
    )
    assert resp.status_code == 201
    assert resp.json()["type"] == "client"


def test_admin_creates_admin(client, db_session):
    admin_token = _admin_token(client, db_session)
    resp = client.post(
        "/users",
        json={
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "jane2@example.com",
            "phone": "+96170123456",
            "city": "Beirut",
            "age": 30,
            "type": "admin",
            "password": "SecurePassword123",
        },
        headers=auth_headers(admin_token),
    )
    assert resp.status_code == 201
    assert resp.json()["type"] == "admin"


def test_client_cannot_create_users(client):
    token = _client_token(client)
    resp = client.post(
        "/users",
        json={
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "jane3@example.com",
            "phone": "+96170123456",
            "city": "Beirut",
            "age": 30,
            "type": "admin",
            "password": "SecurePassword123",
        },
        headers=auth_headers(token),
    )
    assert resp.status_code == 403


def test_pagination(client, db_session):
    admin_token = _admin_token(client, db_session)
    for i in range(15):
        register_user(client, email=f"user{i}@example.com")

    resp = client.get("/users?page=1&limit=10", headers=auth_headers(admin_token))
    body = resp.json()
    assert body["page"] == 1
    assert body["limit"] == 10
    assert len(body["users"]) == 10

    assert body["total"] == 16
    assert body["total_pages"] == 2

    resp2 = client.get("/users?page=2&limit=10", headers=auth_headers(admin_token))
    assert len(resp2.json()["users"]) == 6


def test_filtering_by_city(client, db_session):
    admin_token = _admin_token(client, db_session)
    register_user(client, email="a@example.com", city="Tripoli")
    register_user(client, email="b@example.com", city="Beirut")

    resp = client.get("/users?city=Tripoli", headers=auth_headers(admin_token))
    body = resp.json()
    assert all(u["city"] == "Tripoli" for u in body["users"])


def test_filtering_pagination_combined(client, db_session):
    admin_token = _admin_token(client, db_session)
    for i in range(12):
        register_user(client, email=f"trip{i}@example.com", city="Tripoli")
    register_user(client, email="other@example.com", city="Beirut")

    resp = client.get(
        "/users?city=Tripoli&type=client&page=2&limit=10",
        headers=auth_headers(admin_token),
    )
    body = resp.json()
    assert body["total"] == 12
    assert len(body["users"]) == 2


def test_admin_updates_user_and_changes_role(client, db_session):
    admin_token = _admin_token(client, db_session)
    register_user(client, email="promote@example.com")
    users = client.get(
        "/users?email=promote@example.com", headers=auth_headers(admin_token)
    ).json()["users"]
    user_id = users[0]["id"]

    resp = client.put(
        f"/users/{user_id}",
        json={"type": "admin"},
        headers=auth_headers(admin_token),
    )
    assert resp.status_code == 200
    assert resp.json()["type"] == "admin"


def test_admin_update_nonexistent_user_404(client, db_session):
    admin_token = _admin_token(client, db_session)
    resp = client.put(
        "/users/does-not-exist",
        json={"city": "Beirut"},
        headers=auth_headers(admin_token),
    )
    assert resp.status_code == 404


def test_client_cannot_modify_another_user(client):
    _client_token(client, email="victim@example.com")
    attacker_token = _client_token(client, email="attacker@example.com")
    resp = client.put(
        "/users/some-id", json={"city": "X"}, headers=auth_headers(attacker_token)
    )

    assert resp.status_code == 403


def test_admin_soft_deletes_user(client, db_session):
    admin_token = _admin_token(client, db_session)
    register_user(client, email="todelete@example.com")
    users = client.get(
        "/users?email=todelete@example.com", headers=auth_headers(admin_token)
    ).json()["users"]
    user_id = users[0]["id"]

    resp = client.delete(f"/users/{user_id}", headers=auth_headers(admin_token))
    assert resp.status_code == 200

    listing = client.get("/users", headers=auth_headers(admin_token)).json()
    assert all(u["id"] != user_id for u in listing["users"])

    login_resp = login(client, "todelete@example.com", "Password123")
    assert login_resp.status_code == 401
