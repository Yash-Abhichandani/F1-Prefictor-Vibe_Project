
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

race_id = 95 # Australian GP is likely not 25, let's check races first. 
# Wait, the subagent went to /predict/25. Let's check what race 25 is.

def check_data():
    # 1. Check what Race 25 is
    try:
        race = supabase.table("races").select("*").eq("id", 25).execute()
        print(f"Race 25: {race.data}")
    except Exception as e:
        print(f"Error fetching race: {e}")

    # 2. Check predictions for Race 25
    try:
        preds = supabase.table("predictions").select("*").eq("race_id", 25).execute()
        print(f"Count of predictions for Race 25: {len(preds.data)}")
        if len(preds.data) > 0:
            print("Sample pred:", preds.data[0])
    except Exception as e:
        print(f"Error fetching predictions: {e}")

if __name__ == "__main__":
    check_data()
