import pandas as pd

# Load CSV
df = pd.read_csv("spl_xml_log.csv")

# Clean xml_path only if it's not null
df["xml_path"] = df["xml_path"].apply(
    lambda path: path.split("/")[-1] + ".pdf" if isinstance(path, str) else path
)

# Save cleaned version
df.to_csv("spl_xml_log_updated.csv", index=False)