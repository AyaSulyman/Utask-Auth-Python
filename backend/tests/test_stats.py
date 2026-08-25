from tests.conftest import auth_headers, make_admin_directly, register_user, login


def test_total_active_users(client):
    register_user(client, email="a@example.com")
    register_user(client, email="b@example.com")
    resp = client.get("/stats/count")
    assert resp.status_code == 200
    assert resp.json()["total_users"] == 2


def test_average_age(client):
    register_user(client, email="a@example.com", age=20)
    register_user(client, email="b@example.com", age=30)
    resp = client.get("/stats/average-age")
    assert resp.json()["average_age"] == 25.0


def test_top_cities(client):
    for i in range(3):
        register_user(client, email=f"trip{i}@example.com", city="Tripoli")
    for i in range(2):
        register_user(client, email=f"beir{i}@example.com", city="Beirut")
    register_user(client, email="saida@example.com", city="Saida")

    resp = client.get("/stats/top-cities")
    cities = resp.json()["cities"]
    assert cities[0]["city"] == "Tripoli"
    assert cities[0]["count"] == 3
    assert len(cities) == 3


def test_soft_deleted_excluded_from_stats(client, db_session):
    admin_token_user = make_admin_directly(db_session)
    admin_token = login(client, "admin@example.com", "AdminPass123").json()["access_token"]

    register_user(client, email="temp@example.com", city="Tripoli")
    users = client.get(
        "/users?email=temp@example.com", headers=auth_headers(admin_token)
    ).json()["users"]
    user_id = users[0]["id"]
    client.delete(f"/users/{user_id}", headers=auth_headers(admin_token))

    count = client.get("/stats/count").json()["total_users"]

    assert count == 1
