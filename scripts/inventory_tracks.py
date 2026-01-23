import os
import json

circuits_dir = "/tmp/f1-circuits/circuits"
files = [f for f in os.listdir(circuits_dir) if f.endswith(".geojson")]
files.sort()

print(f"{'File':<20} | {'Name':<40} | {'Location':<20}")
print("-" * 85)

for f in files:
    path = os.path.join(circuits_dir, f)
    try:
        with open(path, 'r') as file:
            data = json.load(file)
            props = data['features'][0]['properties']
            print(f"{f:<20} | {props.get('Name', 'N/A'):<40} | {props.get('Location', 'N/A'):<20}")
    except Exception as e:
        print(f"{f:<20} | Error: {e}")
