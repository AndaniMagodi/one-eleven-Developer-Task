from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_webhook_sorts_chars():
    res = client.post("/webhook", json={"data": "example"})
    assert res.status_code == 200
    assert res.json() == {"word": ["a", "e", "e", "l", "m", "p", "x"]}

def test_webhook_rejects_empty():
    res = client.post("/webhook", json={"data": "   "})
    assert res.status_code == 400
    