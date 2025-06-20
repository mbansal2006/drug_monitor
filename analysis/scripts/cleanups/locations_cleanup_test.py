import pandas as pd
import re

# Load the full CSV
df = pd.read_csv("llm_locations.csv")

# Take only the first 10 rows
df = df.head(10)

# Function to parse the use_llm string
def parse_location_string(loc_str):
    if pd.isnull(loc_str):
        return pd.Series([None, None, None, None])
    try:
        match = re.search(r"\{(.*?)\}", loc_str)
        if not match:
            return pd.Series([None, None, None, None])
        pairs = match.group(1).split(", ")
        data = {k.strip(): v.strip() for k, v in (pair.split("=", 1) for pair in pairs if "=" in pair)}
        return pd.Series([
            data.get("country") or None,
            data.get("state_or_region") or None,
            data.get("postal_code") or None,
            data.get("full_address") or None,
        ])
    except Exception:
        return pd.Series([None, None, None, None])

# Apply the function
df[["country", "state_or_region", "postal_code", "full_address"]] = df["use_llm"].apply(parse_location_string)

# Select desired columns and save
df[["path", "media_reference", "country", "state_or_region", "postal_code", "full_address"]].to_csv(
    "llm_locations_parsed_test.csv", index=False
)

print("✅ Saved to llm_locations_parsed_test.csv")