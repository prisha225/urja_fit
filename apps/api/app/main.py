from fastapi import FastAPI
from .models import PlanResponse

app = FastAPI(title="URJA API", version="0.0.1")

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "review": "pending professional review"}

@app.get("/plan", response_model=PlanResponse)
def plan() -> PlanResponse:
    # Phase 0 deliberately returns no generated health or fitness advice.
    return PlanResponse(plans=[])
