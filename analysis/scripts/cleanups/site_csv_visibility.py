import pandas as pd
import os

folder_path = "site_csv"

for filename in os.listdir(folder_path):
    if filename.endswith(".csv"):
        filepath = os.path.join(folder_path, filename)
        df = pd.read_csv(filepath)
        print(f"\n📄 {filename}")
        print(df.dtypes)