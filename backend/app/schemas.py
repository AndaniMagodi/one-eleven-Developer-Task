from pydantic import BaseModel, Field

class WebhookPayload(BaseModel):
    data: str = Field(..., min_length=1, description="String to be sorted into characters")