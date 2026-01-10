
import os
from supabase import create_client
from dotenv import load_dotenv
import random
import uuid

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

def seed_rival():
    # 1. Create a fake profile if it doesn't exist (we can't create auth users easily without admin API, 
    # but we can insert into profiles if policies allow, or just find another user.
    # Actually, let's just insert a prediction for a "Random ID" if foreign keys allow.
    # Checking schema implies user_id references auth.users. 
    # We might need to just use the same user twice or check if another user exists.
    
    # Let's check existing profiles.
    profiles = supabase.table("profiles").select("*").execute()
    print(f"Profiles found: {len(profiles.data)}")
    
    user1 = profiles.data[0]
    
    if len(profiles.data) > 1:
        user2 = profiles.data[1]
    else:
        print("Only 1 user found. Cannot fully simulate rivalry without another auth user.")
        print("I will insert a 'Ghost' prediction for the SAME user but different race to fake points? No, unique constraint.")
        print("I will just update the current user's points to be high so we can see data.")
        
        # improving the existing prediction to have points
        sup = supabase.table("predictions").update({"points_total": 45, "manual_score": 10}).eq("user_id", user1['id']).execute()
        print("Updated user1 points.")
        return

    # If we have 2 users, give user 2 some points
    race_id = 25 # Australian GP
    
    try:
        data = {
            "user_id": user2['id'],
            "race_id": race_id,
            "quali_p1_driver": "Kimi Antonelli (Mercedes)",
            "quali_p2_driver": "George Russell (Mercedes)",
            "quali_p3_driver": "Max Verstappen (Red Bull)",
            "race_p1_driver": "Kimi Antonelli (Mercedes)",
            "race_p2_driver": "Oscar Piastri (McLaren)",
            "race_p3_driver": "Lewis Hamilton (Ferrari)",
            "wild_prediction": "Mercedes 1-2",
            "biggest_flop": "Red Bull",
            "biggest_surprise": "Williams",
            "points_total": 42, # Close rivalry
            "manual_score": 5
        }
        supabase.table("predictions").insert(data).execute()
        print("Seeded rival prediction.")
    except Exception as e:
        print(f"Rival seed result: {e}")

if __name__ == "__main__":
    seed_rival()
