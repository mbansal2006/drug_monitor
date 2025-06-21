import pandas as pd
from opencage.geocoder import OpenCageGeocode
from tqdm import tqdm
import time

# Initialize
key = '1961dcaddb744cf8a02bddb8475df2a4'
geocoder = OpenCageGeocode(key)

# Load the input CSV
df = pd.read_csv("public/site_csvs/site_locations_table.csv")

# Ensure 'address' column exists
if 'address' not in df.columns:
    raise ValueError("Missing 'address' column in CSV")

# Drop duplicates for efficiency
unique_addresses = df['address'].dropna().unique()
coords_dict = {}

# Geocode each unique address
print("Geocoding addresses...")
for addr in tqdm(unique_addresses):
    try:
        result = geocoder.geocode(addr)
        if result and len(result):
            lat = result[0]['geometry']['lat']
            lng = result[0]['geometry']['lng']
            coords_dict[addr] = (lat, lng)
        else:
            coords_dict[addr] = (None, None)
    except Exception as e:
        print(f"Error for '{addr}': {e}")
        coords_dict[addr] = (None, None)
    time.sleep(1)  # Respect OpenCage's 1 request/sec rate limit

# Map back to full DataFrame
df['latitude'] = df['address'].map(lambda x: coords_dict.get(x, (None, None))[0])
df['longitude'] = df['address'].map(lambda x: coords_dict.get(x, (None, None))[1])

# Save result
df.to_csv("public/site_csvs/site_locations_table_with_coords.csv", index=False)
print("Saved to public/site_csvs/site_locations_table_with_coords.csv")