import os

os.environ["DATABASE_URL"] = "sqlite:///./test_portfolio.db"

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


def test_full_flow():
    with TestClient(app) as client:
        assert client.get("/api/health").json()["status"] == "ok"

        projects = client.get("/api/projects").json()
        assert len(projects) >= 5
        assert all(p["category"] == "designer" for p in client.get("/api/projects?category=designer").json())
        skills = client.get("/api/skills").json()
        by_id = {s["id"]: s for s in skills}
        assert {s["category"] for s in skills} == {"developer", "ai", "designer", "professional"}
        assert len([s for s in skills if s["parent_id"] is None]) == 10
        for s in skills:
            if s["parent_id"] is not None:  # children share their parent's class
                assert by_id[s["parent_id"]]["category"] == s["category"]
        # nearly every skill links to the project where it was earned (Photoshop is the one without)
        assert sum(1 for s in skills if s["project_id"] is None) <= 1
        assert {s["project_id"] for s in skills if s["project_id"]} <= {p["id"] for p in projects}

        # protected routes
        assert client.post("/api/projects", json={}).status_code == 401
        bad = client.post("/api/auth/login", data={"username": "admin@example.com", "password": "nope"})
        assert bad.status_code == 401

        token = client.post(
            "/api/auth/login", data={"username": "admin@example.com", "password": "admin12345"}
        ).json()["access_token"]
        auth = {"Authorization": f"Bearer {token}"}

        with client.websocket_connect("/ws/live") as ws:
            assert ws.receive_json()["type"] == "presence"
            new = {"title": "T", "summary": "S", "category": "developer", "tags": ["x"]}
            created = client.post("/api/projects", json=new, headers=auth)
            assert created.status_code == 201
            assert ws.receive_json() == {"type": "project_added", "title": "T"}

        pid = created.json()["id"]
        assert client.put(f"/api/projects/{pid}", json={**new, "title": "T2"}, headers=auth).json()["title"] == "T2"
        assert client.delete(f"/api/projects/{pid}", headers=auth).status_code == 204
        assert client.get(f"/api/projects/{pid}").status_code == 404

        assert client.post("/api/messages", json={"name": "A", "email": "bad", "body": "hello there friend"}).status_code == 422
        ok = client.post("/api/messages", json={"name": "A", "email": "a@b.co", "body": "hello there friend"})
        assert ok.status_code == 201
        assert client.get("/api/messages").status_code == 401
        assert len(client.get("/api/messages", headers=auth).json()) == 1
