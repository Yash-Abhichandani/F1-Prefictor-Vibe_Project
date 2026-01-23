import csv
import os
import time
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY") # MUST use SERVICE_ROLE key

if not url or not key:
    print("❌ Error: Missing SUPABASE_URL or SUPABASE_KEY in .env")
    exit(1)

supabase: Client = create_client(url, key)

# Correct CSV Filename
CSV_FILE_PATH = "Formula 1 Predictions Competition - Migration_Clean.csv"

def ensure_races_exist():
    """
    Ensures the 2025 Calendar exists in the DB with correct dates.
    Specifically fixes Abu Dhabi to be in the future relative to Dec 2025 start.
    """
    print("🏁 Checking Race Calendar...")
    
    # 1. Define the critical races (Abu Dhabi specifically needs to be FUTURE)
    # We set Abu Dhabi to Dec 7, 2025 (or a date that ensures it shows up as 'Next')
    races_to_fix = [
        {"name": "Abu Dhabi Grand Prix", "circuit": "Yas Marina Circuit", "race_time": "2025-12-07 13:00:00+00"}
    ]

    for race in races_to_fix:
        # Check if it exists
        existing = supabase.table("races").select("id").eq("name", race["name"]).execute()
        
        if not existing.data:
            print(f"   ➕ Inserting missing race: {race['name']}")
            supabase.table("races").insert(race).execute()
        else:
            # OPTIONAL: Force update the date to ensure it appears as 'Next'
            # This is useful if your previous SQL set it to a past date
            print(f"   🔄 Updating date for: {race['name']}")
            supabase.table("races").update({"race_time": race["race_time"]}).eq("name", race["name"]).execute()

def get_or_create_user(email):
    """
    Tries to find a user by email. If not found, creates a new one.
    Returns the User ID.
    """
    if not email or not email.strip():
        return None

    # 1. Check if user exists in profiles table (Fastest check)
    try:
        res = supabase.table("profiles").select("id").eq("username", email).execute()
        if res.data:
            return res.data[0]['id']
    except Exception as e:
        print(f"   ⚠️ Error checking profile for {email}: {e}")

    # 2. If not in profile, check Auth via Admin API
    print(f"   👤 Creating/Fetching account for {email}...")
    try:
        # Generate a secure random password (user will need to reset)
        import secrets
        import string
        secure_password = ''.join(secrets.choice(string.ascii_letters + string.digits + "!@#$%") for _ in range(16))
        
        auth_res = supabase.auth.admin.create_user({
            "email": email,
            "password": secure_password,
            "email_confirm": True
        })
        return auth_res.user.id
    except Exception as e:
        if "User already registered" in str(e) or "duplicate key" in str(e):
            try:
                # If user exists, we need to find their ID. 
                # Since we can't list all easily, we rely on the Profile table being in sync.
                # If Profile is missing but Auth exists, we are in a tricky spot.
                # For now, we log it.
                print(f"   ⚠️ User {email} exists in Auth. Assuming ID sync will happen or manual fix needed.")
                return None 
            except Exception as e2:
                print(f"   ❌ Failed to find existing user {email}: {e2}")
                return None
        else:
            print(f"   ❌ Failed to create user {email}: {e}")
            return None

def migrate():
    print("🚀 Starting Migration V5...")
    
    # STEP 0: Fix the Calendar first!
    ensure_races_exist()
    
    # 1. Load CSV Data
    try:
        with open(CSV_FILE_PATH, mode='r', encoding='utf-8-sig') as file:
            reader = csv.DictReader(file)
            data = list(reader)
    except FileNotFoundError:
        print(f"❌ Error: Could not find file '{CSV_FILE_PATH}'")
        return

    print(f"📂 Loaded {len(data)} rows. Processing...")

    # 2. Process each row
    for i, row in enumerate(data):
        email = row.get('Email Address', '').strip()
        race_name = row.get('Race Name', '').strip()
        
        if not email or not race_name:
            continue

        print(f"[{i+1}/{len(data)}] Processing {race_name} for {email}...")

        # --- A. Get User ID ---
        user_id = get_or_create_user(email)
        if not user_id:
            continue

        # --- B. Find Race ID ---
        race_res = supabase.table("races").select("id").ilike("name", f"%{race_name}%").execute()
        
        if not race_res.data:
            print(f"   ❌ Race not found: '{race_name}'. Skipping.")
            continue
            
        race_id = race_res.data[0]['id']

        # --- C. Insert Prediction ---
        points_str = row.get('Total Points For This Race', '0')
        points_val = 0
        if points_str:
            try:
                points_val = int(float(points_str))
            except ValueError:
                points_val = 0

        prediction_data = {
            "user_id": user_id,
            "race_id": race_id,
            "quali_p1_driver": row.get('Quali P1', ''),
            "quali_p2_driver": row.get('Quali P2', ''),
            "quali_p3_driver": row.get('Quali P3', ''),
            "race_p1_driver": row.get('Race P1', ''),
            "race_p2_driver": row.get('Race P2', ''),
            "race_p3_driver": row.get('Race P3', ''),
            "wild_prediction": row.get('Wild Prediction', ''),
            "biggest_flop": row.get('Flop', ''),
            "biggest_surprise": row.get('Surprise', ''),
            "points_total": points_val
        }

        try:
            supabase.table("predictions").upsert(prediction_data, on_conflict="user_id, race_id").execute()
        except Exception as e:
            print(f"   ❌ Prediction Insert Error: {e}")
            continue
        
        time.sleep(0.1)

    print("\n🎉 Data Import Complete!")
    
    # --- D. Recalculate Total Scores ---
    print("🔄 Syncing Total Scores...")
    distinct_emails = set(row['Email Address'] for row in data if row.get('Email Address'))
    
    for email in distinct_emails:
        user_res = supabase.table("profiles").select("id").eq("username", email).execute()
        if user_res.data:
            uid = user_res.data[0]['id']
            preds = supabase.table("predictions").select("points_total").eq("user_id", uid).execute()
            if preds.data:
                total = sum((p['points_total'] or 0) for p in preds.data)
                supabase.table("profiles").update({"total_score": total}).eq("id", uid).execute()
                print(f"   Updated {email}: {total} pts")

    print("✅ Migration Finished Successfully.")

if __name__ == "__main__":
    migrate()