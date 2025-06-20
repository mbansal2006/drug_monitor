import pandas as pd

TEST_MODE = False

# Load the data
establishments = pd.read_csv("extracted_establishments.csv")
decrs = pd.read_csv("decrs.csv")
spl_log = pd.read_csv("spl_xml_log.csv")

# Sample for testing
if TEST_MODE:
    print("🧪 Running in TEST_MODE (10 rows)...")
    establishments = establishments.head(10)

# Rename columns for consistency
establishments = establishments.rename(columns={"fei": "duns_number"})

# Merge establishments with SPL log (to get ndc_id, ndc_code)
merged = pd.merge(establishments, spl_log, left_on="set_id", right_on="spl_set_id", how="left")

# Merge with DECRS to get address + firm name
merged = pd.merge(merged, decrs, on="duns_number", how="left")

# Build locations table with unique location_id
location_cols = ["duns_number", "address", "firm_name"]
locations = merged[location_cols].drop_duplicates().reset_index(drop=True)

print(f"📍 Generating {len(locations)} location_ids...")
locations["location_id"] = locations.index
for i, row in locations.iterrows():
    print(f"  ✅ Assigned location_id: {row.location_id} — {row.firm_name}")

# Merge location_id back into merged
merged = pd.merge(merged, locations, on=location_cols, how="left")

# Create join table: ndc_id, ndc_code, location_id
join_table = merged[["ndc_id", "ndc_code", "location_id"]].drop_duplicates()

# Save outputs
locations.to_csv("establishment_addresses.csv", index=False)
join_table.to_csv("ndc_to_location.csv", index=False)

print("✅ Merged and saved: establishment_addresses.csv and ndc_to_location.csv")