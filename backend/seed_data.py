
import os
from supabase import create_client
from dotenv import load_dotenv
import random

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

def seed_prediction():
    # 1. Get a user
    users = supabase.table("profiles").select("id").limit(1).execute()
    if not users.data:
        print("No users found!")
        return
    
    user_id = users.data[0]['id']
    race_id = 25 # Australian GP

    # 2. Check if already exists
    existing = supabase.table("predictions").select("*").eq("user_id", user_id).eq("race_id", race_id).execute()
    if existing.data:
        print("Prediction already exists for this user/race.")
        return

    # 3. Insert Prediction
    data = {
        "user_id": user_id,
        "race_id": race_id,
        "quali_p1_driver": "Max Verstappen (Red Bull)",
        "quali_p2_driver": "Charles Leclerc (Ferrari)",
        "quali_p3_driver": "Lando Norris (McLaren)",
        "race_p1_driver": "Max Verstappen (Red Bull)",
        "race_p2_driver": "Lewis Hamilton (Ferrari)",
        "race_p3_driver": "Oscar Piastri (McLaren)",
        "wild_prediction": "Safety Car lap 1",
        "biggest_flop": "Alpine",
        "biggest_surprise": "Haas"
    }

    try:
        supabase.table("predictions").insert(data).execute()
        print("Seeded prediction successfully!")
    except Exception as e:
        print(f"Error seeding: {e}")

if __name__ == "__main__":
    seed_prediction()
