from fastapi import FastAPI, HTTPException
from .schemas import WebhookPayload

app = FastAPI(title="One Eleven Developer Task", version="1.0.0")

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/webhook")
def webhook(payload: WebhookPayload):
    s = payload.data.strip()
    if not s:
        raise HTTPException(status_code=400, detail="data must not be empty")

    chars = list(s)
    sorted_chars = sorted(chars, key=lambda c: c.lower())
    return {"word": sorted_chars}