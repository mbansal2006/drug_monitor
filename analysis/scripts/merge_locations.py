import pandas as pd

# Load files
risk_df = pd.read_csv("scored_country_risk.csv")
estab_df = pd.read_csv("establishment_addresses_with_fields.csv")

# Clean country codes
risk_df['country'] = risk_df['country'].str.strip().str.upper()
estab_df['country'] = estab_df['country'].str.strip().str.upper()

# Merge on country
merged_df = estab_df.merge(risk_df, on="country", how="left")

# Save the result
merged_df.to_csv("location_import.csv", index=False)
print("Saved as location_import.csv")