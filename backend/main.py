from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google_service import get_place_suggestions, fetch_place_data
from logic import calculate_safety

app = FastAPI()

# Fixes "CORS" errors so React can talk to Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/suggestions")
async def suggestions(query: str):
    return get_place_suggestions(query)

@app.get("/analyze")
async def analyze(place_id: str, time: str):
    metrics = fetch_place_data(place_id)
    if not metrics: return {"error": "No data"}
    score, level, reasoning = calculate_safety(metrics, time)
    return {"score": score, "level": level, "reasoning": reasoning}