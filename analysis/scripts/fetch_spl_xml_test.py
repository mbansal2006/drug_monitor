import pandas as pd
import requests
from time import sleep
import os

# Load just 10 NDCs
df = pd.read_csv("ndcs.csv").drop_duplicates(subset=["ndc_code"]).head(10)

os.makedirs("spl_xml_test_files", exist_ok=True)

log_rows = []
seen = {}

def fetch_spl_set_id(ndc_code):
    base_url = "https://api.fda.gov/drug/ndc.json"
    try:
        resp = requests.get(f"{base_url}?search=package_ndc:{ndc_code}&limit=1")
        if resp.status_code == 200 and "results" in resp.json():
            return resp.json()["results"][0]["openfda"]["spl_set_id"][0]
        short_ndc = "-".join(ndc_code.split("-")[:2])
        resp = requests.get(f"{base_url}?search=product_ndc:{short_ndc}&limit=1")
        if resp.status_code == 200 and "results" in resp.json():
            return resp.json()["results"][0]["openfda"]["spl_set_id"][0]
    except Exception:
        return None
    return None

def fetch_spl_xml(spl_set_id):
    url = f"https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/{spl_set_id}.xml"
    try:
        resp = requests.get(url)
        return resp.text if resp.status_code == 200 else None
    except Exception:
        return None

for i, row in df.iterrows():
    ndc_id = row["ndc_id"]
    ndc_code = row["ndc_code"]

    if ndc_code in seen:
        result = seen[ndc_code]
    else:
        spl_set_id = fetch_spl_set_id(ndc_code)
        if not spl_set_id:
            result = {"status": "fail", "message": "No SPL Set ID found", "spl_set_id": None, "xml_path": None}
        else:
            xml_text = fetch_spl_xml(spl_set_id)
            if not xml_text:
                result = {"status": "fail", "message": "Failed to download SPL XML", "spl_set_id": spl_set_id, "xml_path": None}
            else:
                file_path = f"spl_xml_test_files/{ndc_id}.xml"
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(xml_text)
                result = {
                    "status": "success",
                    "message": "Downloaded",
                    "spl_set_id": spl_set_id,
                    "xml_path": file_path
                }
        seen[ndc_code] = result

    log_rows.append({
        "ndc_id": ndc_id,
        "ndc_code": ndc_code,
        **result
    })

    print(f"[{i+1}/10] {ndc_code}: {result['status']}")

    sleep(0.25)

pd.DataFrame(log_rows).to_csv("spl_xml_test_log.csv", index=False)