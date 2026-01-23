import json
import os

TRACK_MAPPING = {
    "AUS": "au-1953.geojson",
    "BHR": "bh-2002.geojson",
    "SAU": "sa-2021.geojson",
    "JPN": "jp-1962.geojson",
    "CHN": "cn-2004.geojson",
    "MIA": "us-2022.geojson",
    "EMI": "it-1953.geojson",
    "MCO": "mc-1929.geojson",
    "ESP": "es-1991.geojson",
    "CAN": "ca-1978.geojson",
    "AUT": "at-1969.geojson",
    "GBR": "gb-1948.geojson",
    "HUN": "hu-1986.geojson",
    "BEL": "be-1925.geojson",
    "NED": "nl-1948.geojson",
    "ITA": "it-1922.geojson",
    "MAD": "es-2026.geojson",
    "AZE": "az-2016.geojson",
    "SGP": "sg-2008.geojson",
    "USA": "us-2012.geojson",
    "MEX": "mx-1962.geojson",
    "BRA": "br-1940.geojson",
    "LVS": "us-2023.geojson",
    "QAT": "qa-2004.geojson",
    "ABU": "ae-2009.geojson"
}

CIRCUITS_DIR = "/tmp/f1-circuits/circuits"
OUTPUT_FILE = "app/lib/trackPaths.ts"

def geojson_to_svg_path(geojson_path):
    with open(geojson_path, 'r') as f:
        data = json.load(f)
    
    # Extract coordinates from the first feature's LineString
    coords = data['features'][0]['geometry']['coordinates']
    
    # Handle both simple LineString and MultiLineString logic if needed, 
    # but based on inspection they are simple arrays of [lon, lat]
    
    lons = [c[0] for c in coords]
    lats = [c[1] for c in coords]
    
    min_lon, max_lon = min(lons), max(lons)
    min_lat, max_lat = min(lats), max(lats)
    
    width = max_lon - min_lon
    height = max_lat - min_lat
    
    # Normalize to 0-100 viewbox, maintaining aspect ratio? 
    # Or just fit to 100x100? Fit to 100x100 usually looks best for icons, 
    # but preserving aspect ratio is better for "Technical" accuracy.
    # Let's preserve aspect ratio within a 100x100 box.
    
    scale = 90 / max(width, height) # Leave some padding (5 units on each side)
    
    path_commands = []
    
    for i, (lon, lat) in enumerate(coords):
        # Center the track in 100x100
        x = (lon - min_lon) * scale
        y = (max_lat - lat) * scale # Flip Y
        
        # Center offsets
        x_offset = (100 - (width * scale)) / 2
        y_offset = (100 - (height * scale)) / 2
        
        x_final = x + x_offset
        y_final = y + y_offset
        
        cmd = "M" if i == 0 else "L"
        path_commands.append(f"{cmd}{x_final:.2f},{y_final:.2f}")
    
    path_commands.append("Z")
    return "".join(path_commands)

print("Genering track paths...")
tracks = {}

for code, filename in TRACK_MAPPING.items():
    try:
        path = os.path.join(CIRCUITS_DIR, filename)
        svg_path = geojson_to_svg_path(path)
        tracks[code] = svg_path
        print(f"Processed {code}")
    except Exception as e:
        print(f"Error processing {code}: {e}")

# Write to TS file
ts_content = f"""// Auto-generated track paths
// Source: bacinger/f1-circuits

export const TRACK_PATHS: Record<string, string> = {json.dumps(tracks, indent=2)};
"""

with open(OUTPUT_FILE, 'w') as f:
    f.write(ts_content)

print(f"Successfully wrote to {OUTPUT_FILE}")
