import pandas as pd

# Load the datasets
location_df = pd.read_csv("location_import.csv")
oai_df = pd.read_csv("oai_duns.csv")

# Standardize DUNS formats
location_df["duns_number"] = location_df["duns_number"].astype(str).str.strip()
oai_df["uq_duns"] = oai_df["uq_duns"].astype(str).str.strip()

# Rename for join
oai_df = oai_df.rename(columns={"uq_duns": "duns_number"})

# Merge on DUNS number
merged_df = location_df.merge(oai_df, on="duns_number", how="left")

# Fill missing OAI counts with 0
merged_df["oai_count"] = merged_df["oai_count"].fillna(0).astype(int)

# Export final file
merged_df.to_csv("location_with_risk.csv", index=False)
print("Saved to location_with_risk.csv")