import pandas as pd
import re

# Load the full CSV
df = pd.read_csv("establishment_addresses.csv")

# Initialize new columns
df["country"] = None
df["state_or_region"] = None
df["postal_code"] = None

# Patterns
country_pattern = re.compile(r"\((\w{3})\)$")

postal_code_patterns = [
    re.compile(r"\b\d{5}(?:-\d{4})?\b"),         # US ZIP
    re.compile(r"\b\d{6}\b"),                   # India
    re.compile(r"\b[A-Z]\d[A-Z] ?\d[A-Z]\d\b"), # Canada
    re.compile(r"\b\d{4,5}\b"),                 # EU / misc
]

state_patterns = [
    re.compile(r",\s*([A-Z]{2})\s*\d{5}"),           # US State (e.g., MI 49001)
    re.compile(r",\s*([^,]+?)\s+\d{4,6}"),           # Region before postal (non-US)
]

# Parse
for i, row in df.iterrows():
    addr = row.get("address", "")
    if pd.isna(addr):
        continue

    # Country
    country_match = country_pattern.search(addr)
    if country_match:
        df.at[i, "country"] = country_match.group(1)

    # Postal code
    for pattern in postal_code_patterns:
        match = pattern.search(addr)
        if match:
            df.at[i, "postal_code"] = match.group(0)
            break

    # State or region
    for pattern in state_patterns:
        match = pattern.search(addr)
        if match:
            df.at[i, "state_or_region"] = match.group(1).strip()
            break

# Save full file
df.to_csv("establishment_addresses_with_fields.csv", index=False)
print("✅ Saved: establishment_addresses_with_fields.csv")