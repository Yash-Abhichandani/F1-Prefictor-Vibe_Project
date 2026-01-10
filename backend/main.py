from fastapi import FastAPI, HTTPException, Depends, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel, field_validator
from dotenv import load_dotenv
from datetime import datetime, timezone
from typing import Optional
import os
import re
from scoring import calculate_points

# Rate limiting imports
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="F1 Predictor API", version="2.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# SECURITY: Define allowed origins (update for production)
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
# Ensure localhost is always allowed for development
if "http://localhost:3000" not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append("http://localhost:3000")
if "http://127.0.0.1:3000" not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append("http://127.0.0.1:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# --- VALID DRIVERS LIST (2026 Grid - 11 Teams, 22 Drivers) ---
VALID_DRIVERS = [
    # Red Bull
    "Max Verstappen (Red Bull)",
    "Isack Hadjar (Red Bull)",
    # McLaren
    "Lando Norris (McLaren)",
    "Oscar Piastri (McLaren)",
    # Ferrari
    "Charles Leclerc (Ferrari)",
    "Lewis Hamilton (Ferrari)",
    # Mercedes
    "George Russell (Mercedes)",
    "Kimi Antonelli (Mercedes)",
    # Aston Martin
    "Fernando Alonso (Aston Martin)",
    "Lance Stroll (Aston Martin)",
    # Williams
    "Carlos Sainz (Williams)",
    "Alexander Albon (Williams)",
    # Alpine
    "Pierre Gasly (Alpine)",
    "Franco Colapinto (Alpine)",
    # Haas
    "Esteban Ocon (Haas)",
    "Oliver Bearman (Haas)",
    # RB (Visa Cash App RB)
    "Yuki Tsunoda (RB)",
    "Liam Lawson (RB)",
    # Sauber (Audi)
    "Nico Hulkenberg (Sauber)",
    "Gabriel Bortoleto (Sauber)",
    # Cadillac (NEW TEAM 2026)
    "Valtteri Bottas (Cadillac)",
    "Sergio Perez (Cadillac)",
    # Form placeholders
    "Select Driver...",
    ""
]

# --- MODELS WITH VALIDATION ---
class PredictionInput(BaseModel):
    user_id: str
    race_id: int
    quali_p1_driver: str
    quali_p2_driver: str
    quali_p3_driver: str
    race_p1_driver: str
    race_p2_driver: str
    race_p3_driver: str
    wild_prediction: str
    biggest_flop: str
    biggest_surprise: str
    
    @field_validator('quali_p1_driver', 'quali_p2_driver', 'quali_p3_driver', 
                     'race_p1_driver', 'race_p2_driver', 'race_p3_driver')
    @classmethod
    def validate_driver(cls, v: str) -> str:
        if v and v not in VALID_DRIVERS:
            raise ValueError(f'Invalid driver: {v}')
        return v
    
    @field_validator('wild_prediction', 'biggest_flop', 'biggest_surprise')
    @classmethod
    def sanitize_text(cls, v: str) -> str:
        # Remove any potentially dangerous characters
        if v:
            v = re.sub(r'[<>"\']', '', v)[:500]  # Limit to 500 chars
        return v

class RaceResultInput(BaseModel):
    race_id: int
    quali_p1_driver: str
    quali_p2_driver: str
    quali_p3_driver: str
    race_p1_driver: str
    race_p2_driver: str
    race_p3_driver: str
    
    @field_validator('quali_p1_driver', 'quali_p2_driver', 'quali_p3_driver',
                     'race_p1_driver', 'race_p2_driver', 'race_p3_driver')
    @classmethod
    def validate_driver(cls, v: str) -> str:
        if v not in VALID_DRIVERS:
            raise ValueError(f'Invalid driver: {v}')
        return v

class GradingInput(BaseModel):
    prediction_id: int
    manual_score: int
    
    @field_validator('manual_score')
    @classmethod
    def validate_score(cls, v: int) -> int:
        if v < 0 or v > 50:
            raise ValueError('Score must be between 0 and 50')
        return v

# --- SECURITY: Admin Authorization Helper ---
async def verify_admin(authorization: Optional[str] = Header(None)):
    """Verify that the request is from an authenticated admin user."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    try:
        # Extract token from "Bearer <token>"
        token = authorization.replace("Bearer ", "")
        
        # Verify the token with Supabase
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_id = user_response.user.id
        
        # Check if user is admin
        profile = supabase.table("profiles").select("is_admin").eq("id", user_id).single().execute()
        
        if not profile.data or not profile.data.get("is_admin"):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        return user_id
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Auth error: {str(e)}")

# --- ROUTES ---

@app.get("/")
def read_root():
    return {"message": "F1 Predictor API is running!", "version": "2.0.0"}

@app.get("/races")
@limiter.limit("30/minute")
def get_races(request: Request):
    response = supabase.table("races").select("*").order("race_time", desc=False).execute()
    return response.data

@app.get("/races/{race_id}")
@limiter.limit("60/minute")
def get_race(request: Request, race_id: int):
    response = supabase.table("races").select("*").eq("id", race_id).execute()
    return response.data[0] if response.data else {}

@app.get("/admin/predictions/{race_id}")
@limiter.limit("20/minute")
def get_predictions_for_race(request: Request, race_id: int, admin_id: str = Depends(verify_admin)):
    response = supabase.table("predictions").select("*").eq("race_id", race_id).execute()
    return response.data

@app.post("/predict")
@limiter.limit("10/minute")  # Prevent spam submissions
def submit_prediction(request: Request, prediction: PredictionInput):
    # SECURITY: Enforce prediction deadline
    race_response = supabase.table("races").select("quali_time").eq("id", prediction.race_id).single().execute()
    
    if race_response.data and race_response.data.get("quali_time"):
        quali_time = datetime.fromisoformat(race_response.data["quali_time"].replace("Z", "+00:00"))
        if datetime.now(timezone.utc) > quali_time:
            raise HTTPException(status_code=403, detail="Predictions are closed - qualifying has started")
    
    data = prediction.dict()
    try:
        response = supabase.table("predictions").insert(data).execute()
        return {"message": "Success", "data": response.data}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/admin/grade")
@limiter.limit("30/minute")
def grade_prediction(request: Request, grading: GradingInput, admin_id: str = Depends(verify_admin)):
    try:
        supabase.table("predictions").update({"manual_score": grading.manual_score}).eq("id", grading.prediction_id).execute()
        return {"message": "Grade saved"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/admin/settle")
@limiter.limit("5/minute")  # Settling should be rare
def settle_race(request: Request, result: RaceResultInput, admin_id: str = Depends(verify_admin)):
    print(f"Settling Race {result.race_id} by admin {admin_id}...")
    response = supabase.table("predictions").select("*").eq("race_id", result.race_id).execute()
    predictions = response.data
    
    if not predictions:
        return {"message": "No predictions found for this race"}

    updated_count = 0
    for pred in predictions:
        # Calculate automatic points from scoring algorithm
        auto_points = calculate_points(pred, result.dict())
        # Add manual grading points (wild prediction, flop, surprise bonuses)
        manual_points = pred.get('manual_score') or 0
        # Total = automatic + manual
        total_points = auto_points + manual_points
        
        supabase.table("predictions").update({"points_total": total_points}).eq("id", pred['id']).execute()
        updated_count += 1
        
    return {"message": f"Race settled! Updated {updated_count} predictions."}

# --- REAL-TIME STANDINGS ENDPOINT ---
def get_race_code(race_name):
    # Maps race names to 3-letter codes for 2026 calendar
    name = race_name.lower()
    if "australian" in name: return "AUS"
    if "chinese" in name: return "CHN"
    if "japanese" in name: return "JPN"
    if "bahrain" in name: return "BHR"
    if "saudi" in name: return "SAU"
    if "miami" in name: return "MIA"
    if "emilia" in name or "imola" in name: return "ITA"
    if "monaco" in name: return "MCO"
    if "spanish" in name or "spain" in name: return "ESP"
    if "canadian" in name or "canada" in name: return "CAN"
    if "austrian" in name or "austria" in name: return "AUT"
    if "british" in name or "silverstone" in name: return "GBR"
    if "belgian" in name or "spa" in name: return "BEL"
    if "hungarian" in name or "hungary" in name: return "HUN"
    if "dutch" in name or "netherlands" in name: return "NED"
    if "italian" in name or "monza" in name: return "ITA"
    if "madrid" in name: return "MAD"
    if "azerbaijan" in name or "baku" in name: return "AZE"
    if "singapore" in name: return "SGP"
    if "united states" in name or "austin" in name or "cota" in name: return "USA"
    if "mexico" in name: return "MEX"
    if "brazil" in name or "são paulo" in name or "sao paulo" in name: return "BRA"
    if "las vegas" in name: return "LVS"
    if "qatar" in name: return "QAT"
    if "abu dhabi" in name: return "ABU"
    return "GP"

@app.get("/standings")
@limiter.limit("30/minute")
def get_standings(request: Request):
    # 1. Fetch all users
    users_res = supabase.table("profiles").select("*").execute()
    users = users_res.data
    
    standings_data = []
    
    for user in users:
        # 2. Fetch all predictions for this user (with race info)
        preds_res = supabase.table("predictions").select("points_total, race_id, races(name, race_time)").eq("user_id", user['id']).execute()
        predictions = preds_res.data
        
        # 3. Calculate Total Score dynamically
        total_score = sum((p['points_total'] or 0) for p in predictions)
        
        # 4. Get Recent Form (Last 3 races)
        scored_preds = [p for p in predictions if p['points_total'] is not None]
        scored_preds.sort(key=lambda x: x['races']['race_time'], reverse=True)
        
        recent_raw = scored_preds[:3]
        last_races = []
        for p in recent_raw:
            last_races.append({
                "code": get_race_code(p['races']['name']),
                "points": p['points_total']
            })
            
        standings_data.append({
            "id": user['id'],
            "username": user['username'],
            "total_score": total_score,
            "last_races": last_races
        })
    
    # 5. Sort by Total Score (Highest First)
    standings_data.sort(key=lambda x: x['total_score'], reverse=True)
    
    return standings_data

# --- HEALTH CHECK ---
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# --- SERVER STARTUP ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)